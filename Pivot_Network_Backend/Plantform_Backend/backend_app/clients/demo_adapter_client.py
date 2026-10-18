"""Local, in-process placeholder for the Docker_Swarm_Adapter HTTP service.

The real topology is::

    Plantform_Backend  --HTTP-->  Docker_Swarm_Adapter (BACKEND_ADAPTER_BASE_URL)

which in turn talks to a Docker Swarm manager.  On a developer laptop there is no
Docker and no adapter process, so the buyer trade chain would stop at the
``redeem`` step (``AdapterClientError: adapter_request_failed``).  To keep the
whole demo runnable locally, :class:`DemoAdapterClient` answers the same adapter
calls from an in-memory "demo swarm":

* read-only node views (``/platform/nodes``, ``/platform/swarm/overview``, ...)
  return three fixed demo nodes that match the seeded demo offers;
* runtime-session bundle create/inspect/remove return placeholder-but-complete
  bundle payloads (service names, connect URLs, WireGuard lease metadata) so the
  runtime-session API has realistic data to show.

It is enabled by setting ``BACKEND_ADAPTER_BASE_URL`` to an empty value in
``.env`` (see ``docs/LOCAL_DEMO.md``); when a real adapter URL is configured the
normal :class:`~backend_app.clients.adapter_client.AdapterClient` is used and
nothing here is touched.  Seller-onboarding calls stay unsupported on purpose:
they need a real Swarm manager, and failing loudly is safer than faking one.
"""

from __future__ import annotations

from typing import Any

from backend_app.clients.adapter_client import AdapterClient, AdapterClientError

DEMO_MANAGER_HOST = "127.0.0.1"

DEMO_NODES: list[dict[str, Any]] = [
    {
        "id": "tj-swarm-worker-01",
        "hostname": "tj-swarm-worker-01",
        "role": "worker",
        "status": "ready",
        "availability": "active",
        "node_addr": "10.20.1.11",
        "platform_role": "compute",
        "compute_enabled": True,
        "compute_node_id": "compute-tj-a100-01",
        "seller_user_id": "user_demo_seller_tianjin",
        "accelerator": "nvidia-a100",
        "running_tasks": 1,
    },
    {
        "id": "tj-swarm-worker-02",
        "hostname": "tj-swarm-worker-02",
        "role": "worker",
        "status": "ready",
        "availability": "active",
        "node_addr": "10.20.1.12",
        "platform_role": "compute",
        "compute_enabled": True,
        "compute_node_id": "compute-tj-a100-02",
        "seller_user_id": "user_demo_seller_tianjin",
        "accelerator": "nvidia-a100",
        "running_tasks": 0,
    },
    {
        "id": "bj-edge-node-03",
        "hostname": "bj-edge-node-03",
        "role": "worker",
        "status": "warning",
        "availability": "degraded",
        "node_addr": "10.20.2.21",
        "platform_role": "compute",
        "compute_enabled": True,
        "compute_node_id": "compute-bj-4090-03",
        "seller_user_id": "user_demo_seller_beijing",
        "accelerator": "nvidia-rtx4090",
        "running_tasks": 2,
    },
    {
        "id": "sh-runtime-node-04",
        "hostname": "sh-runtime-node-04",
        "role": "worker",
        "status": "ready",
        "availability": "active",
        "node_addr": "10.20.3.31",
        "platform_role": "compute",
        "compute_enabled": True,
        "compute_node_id": "compute-sh-l40s-04",
        "seller_user_id": "user_demo_seller_shanghai",
        "accelerator": "nvidia-l40s",
        "running_tasks": 0,
    },
]

_NODE_DETAIL_LABELS = {
    "compute-tj-a100-01": {"pivot.region": "tianjin", "pivot.gpu": "A100 80GB", "pivot.tier": "training"},
    "compute-tj-a100-02": {"pivot.region": "tianjin", "pivot.gpu": "A100 80GB", "pivot.tier": "training"},
    "compute-bj-4090-03": {"pivot.region": "beijing", "pivot.gpu": "RTX 4090", "pivot.tier": "inference"},
    "compute-sh-l40s-04": {"pivot.region": "shanghai", "pivot.gpu": "L40S", "pivot.tier": "multimodal"},
}


class DemoAdapterClient(AdapterClient):
    """AdapterClient-compatible stand-in that runs entirely in the API process."""

    def __init__(self) -> None:
        super().__init__(base_url="demo://local-adapter", token="", timeout_seconds=1)
        self._runtime_sessions: dict[str, dict[str, Any]] = {}

    # ------------------------------------------------------------------ nodes
    def _request(
        self,
        method: str,
        path: str,
        *,
        params: dict[str, Any] | None = None,
        json: dict[str, Any] | None = None,
        auth_required: bool = False,
    ) -> dict[str, Any]:
        del method, params, auth_required

        if path == "/health":
            return {
                "status": "ok",
                "adapter_name": "local-demo-adapter",
                "swarm_manager_addr": DEMO_MANAGER_HOST,
                "wireguard_interface": "wg-demo",
                "portainer_url": None,
            }

        if path == "/swarm/overview":
            return {
                "manager_host": DEMO_MANAGER_HOST,
                "swarm": {
                    "state": "active",
                    "node_id": "demo-manager-1",
                    "node_addr": DEMO_MANAGER_HOST,
                    "control_available": True,
                    "nodes": len(DEMO_NODES),
                    "managers": 1,
                },
                "node_list_summary": [dict(node) for node in DEMO_NODES],
                "service_list_summary": [],
            }

        if path == "/swarm/nodes":
            return {"nodes": [dict(node) for node in DEMO_NODES], "total": len(DEMO_NODES)}

        if path == "/swarm/nodes/search":
            # Force the base AdapterClient.search_nodes() fallback onto /swarm/nodes
            # so the demo nodes go through the same filtering path as production.
            raise AdapterClientError(404, "demo_adapter_search_not_implemented")

        if path.startswith("/swarm/nodes/by-ref/"):
            node_ref = path.rsplit("/", 1)[-1]
            return self._node_detail_for(self._find_node(node_ref))

        if path == "/swarm/nodes/inspect":
            node_ref = str((json or {}).get("node_ref") or "")
            return self._node_detail_for(self._find_node(node_ref))

        if path.startswith("/swarm/nodes/by-compute-node-id/"):
            compute_node_id = path.rsplit("/", 1)[-1]
            return self._node_detail_for(self._find_node(compute_node_id))

        # -------------------------------------------------- runtime session bundles
        if path == "/swarm/runtime-session-bundles/create":
            payload = dict(json or {})
            session_id = str(payload.get("session_id") or "")
            runtime_image_ref = str(payload.get("runtime_image_ref") or "")
            public_key = self._buyer_public_key(payload)
            bundle = self._bundle(session_id, public_key, "running", runtime_image_ref)
            self._runtime_sessions[session_id] = bundle
            return dict(bundle)

        if path == "/swarm/runtime-session-bundles/inspect":
            session_id = str((json or {}).get("session_id") or "")
            existing = self._runtime_sessions.get(session_id)
            if existing is not None:
                return dict(existing)
            # After a backend restart the in-memory bundles are gone, but sessions
            # persisted in PostgreSQL should still render as a running demo bundle.
            return self._bundle(session_id, "demo-buyer-public-key", "running", "")

        if path == "/swarm/runtime-session-bundles/remove":
            session_id = str((json or {}).get("session_id") or "")
            existing = self._runtime_sessions.pop(session_id, None)
            public_key = None if existing is None else existing["wireguard_lease_metadata"].get("public_key")
            return {
                "session_id": session_id,
                "status": "removed",
                "runtime_service_name": "pivot-demo-runtime",
                "gateway_service_name": "pivot-demo-gateway",
                "network_name": "pivot-demo-net",
                "connect_metadata": {},
                "wireguard_lease_metadata": {
                    "runtime_session_id": session_id,
                    "lease_type": "buyer",
                    "status": "removed",
                    "public_key": public_key,
                },
                "recent_error_summary": [],
            }

        raise AdapterClientError(
            503,
            "demo_adapter_unsupported",
            {
                "detail": (
                    "local demo adapter does not support this operation; "
                    "run the real Docker_Swarm_Adapter and set BACKEND_ADAPTER_BASE_URL to use it"
                ),
                "path": path,
            },
        )

    # ----------------------------------------------------------------- helpers
    @staticmethod
    def _find_node(node_ref: str) -> dict[str, Any]:
        for node in DEMO_NODES:
            if node_ref in {node["id"], node["compute_node_id"]}:
                return node
        raise AdapterClientError(404, "node_not_found", {"detail": "node_not_found"})

    @staticmethod
    def _node_detail_for(node: dict[str, Any]) -> dict[str, Any]:
        compute_node_id = str(node.get("compute_node_id") or "")
        labels = dict(_NODE_DETAIL_LABELS.get(compute_node_id, {}))
        return {
            "node": dict(node),
            "platform_labels": labels,
            "raw_labels": {
                f"pivot.node.{key}": value for key, value in labels.items()
            },
            "tasks": [],
            "recent_error_summary": [],
        }

    @staticmethod
    def _buyer_public_key(payload: dict[str, Any]) -> str:
        buyer_network = payload.get("buyer_network")
        if isinstance(buyer_network, dict):
            return str(buyer_network.get("public_key") or "")
        return ""

    @staticmethod
    def _bundle(session_id: str, public_key: str, status: str, runtime_image_ref: str) -> dict[str, Any]:
        return {
            "session_id": session_id,
            "status": status,
            "runtime_image_ref": runtime_image_ref,
            "runtime_service_name": "pivot-demo-runtime",
            "gateway_service_name": "pivot-demo-gateway",
            "network_name": "pivot-demo-net",
            "connect_metadata": {
                "demo": True,
                "note": "adapter 未接入，本机演示降级",
                "wireguard_shell_embed_url": f"http://127.0.0.1:32080/shell/{session_id}",
                "workspace_sync_url": f"http://127.0.0.1:32080/api/workspace/upload/{session_id}",
                "runtime_image_ref": runtime_image_ref,
                "adapter_mode": "local_demo",
            },
            "wireguard_lease_metadata": {
                "runtime_session_id": session_id,
                "lease_type": "buyer",
                "status": "applied",
                "public_key": public_key,
                "client_address": "10.66.66.200",
                "server_interface": "wg-demo",
                "server_public_key": "demo-server-public-key",
                "server_access_ip": "10.66.66.1",
                "endpoint_host": "127.0.0.1",
                "endpoint_port": 51820,
                "allowed_ips": ["10.66.66.200/32"],
                "client_allowed_ips": ["10.66.66.1/32"],
                "persistent_keepalive": 25,
                "lease_payload": {},
            },
            "recent_error_summary": [],
        }

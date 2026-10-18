# 本机零依赖演示启动指南（Local Demo）

本指南让 **Plantform_Backend** 在 macOS / Apple Silicon 上、**不需要 Docker、不需要 Docker
Swarm、不需要外部 PostgreSQL 服务** 的情况下完整跑起来，供前端（Pivot_Network_Frontend，
Vite dev server `http://127.0.0.1:5173`）联调使用。

演示范围：

- 买家注册 / 登录（Bearer token）
- 商品目录 `GET /api/v1/offers`（3 个 GPU 商品，天津 / 北京 / 上海）
- 下单 → 激活（access grant）→ 兑换（redeem）→ runtime session 全链
- runtime session 心跳 / 停止 / 关闭
- `GET /api/v1/platform/nodes`、`GET /api/v1/platform/swarm/overview` 节点视图

> 降级说明：真实链路里「兑换授权」需要调用 Docker_Swarm_Adapter（默认
> `http://127.0.0.1:8010`）。本机演示没有该服务，因此后端在 `BACKEND_DEMO_MODE=true`
> 下改用进程内的 `DemoAdapterClient`（`backend_app/clients/demo_adapter_client.py`）
> 生成一份演示用的 runtime session / WireGuard 租约 / 节点列表。**业务状态机、数据库表、
> 接口 schema 与真实链路一致**，只是底层编排数据是演示数据。

---

## 1. 端口与地址

| 组件 | 地址 / 端口 | 说明 |
| --- | --- | --- |
| 后端 API | `http://127.0.0.1:8000` | uvicorn，`--host 127.0.0.1` |
| OpenAPI 文档 | `http://127.0.0.1:8000/docs` | FastAPI Swagger UI |
| 健康检查 | `http://127.0.0.1:8000/api/v1/health` | `{"status":"ok", ...}` |
| 就绪 / adapter | `http://127.0.0.1:8000/api/v1/ready` | adapter 在 demo 模式下返回 `local-demo-adapter` |
| 前端 dev server | `http://127.0.0.1:5173` | 已在运行，后端 CORS 已放行 |
| 本地 PostgreSQL | Unix socket `/private/tmp/pivot-pgdata/.s.PGSQL.5432` | pgserver 起库，**不占 TCP 端口** |

注意：`55432` 端口在本机被其他进程占用，本方案不使用它；pgserver 在 macOS 上走 Unix
socket，因此也不会和任何 TCP 端口冲突。

---

## 2. 一次性准备（虚拟环境 + 依赖）

```bash
cd Pivot_Network_Backend/Plantform_Backend

python3 -m venv /tmp/pivot-be-venv
/tmp/pivot-be-venv/bin/pip install --cache-dir /tmp/pip-cache -U pip
/tmp/pivot-be-venv/bin/pip install --cache-dir /tmp/pip-cache -e ".[dev]"
# 可选：无需 Docker / brew 的本地 PostgreSQL（自带二进制，免 root）
/tmp/pivot-be-venv/bin/pip install --cache-dir /tmp/pip-cache pgserver
```

`pgserver` 只有在「本机无 Docker」时才需要；有真实 PostgreSQL 时跳过第 3 步的
`local_postgres.py`，把 `.env` 里的 `BACKEND_POSTGRES_URL` 指向真实数据库即可。

---

## 3. 一键启动

```bash
cd Pivot_Network_Backend/Plantform_Backend
export PIVOT_PYTHON=/tmp/pivot-be-venv/bin/python
bash scripts/start_local_demo.sh
```

脚本依次执行 4 步（每步都可单独重跑，幂等）：

1. `scripts/local_postgres.py start` —— 用 pgserver 启动本地 PostgreSQL
   （data dir `/tmp/pivot-pgdata`），并确保存在 `plantform_backend` 数据库；
2. `python -m alembic upgrade head` —— 建表（4 个 migration）；
3. `scripts/seed_local_demo.py` —— 写入演示账号 + 3 个 offer；
4. `nohup python -m uvicorn backend_app.main:app --host 127.0.0.1 --port 8000`，
   日志追加到 `/tmp/pivot-backend.log`，pid 写入 `/tmp/pivot-backend.pid`，
   然后轮询 `/api/v1/health` 直到就绪。

成功后输出样例：

```text
==> health: {"status":"ok","service":"Plantform Backend (local demo)"}
==> ready : {"status":"ready","adapter":{"status":"ok","adapter_name":"local-demo-adapter",...}}
Backend : http://127.0.0.1:8000  (OpenAPI docs: http://127.0.0.1:8000/docs)
```

### 分步启动（排错时用）

```bash
cd Pivot_Network_Backend/Plantform_Backend
export PY=/tmp/pivot-be-venv/bin/python

$PY scripts/local_postgres.py start          # 1) 起库，打印 BACKEND_POSTGRES_URL
$PY -m alembic upgrade head                  # 2) 迁移
$PY scripts/seed_local_demo.py               # 3) 种子数据
nohup $PY -m uvicorn backend_app.main:app --host 127.0.0.1 --port 8000 \
  >> /tmp/pivot-backend.log 2>&1 < /dev/null &
echo $! > /tmp/pivot-backend.pid             # 4) 起后端
curl -s http://127.0.0.1:8000/api/v1/health
```

### 停止

```bash
cd Pivot_Network_Backend/Plantform_Backend
export PIVOT_PYTHON=/tmp/pivot-be-venv/bin/python
bash scripts/stop_local_demo.sh --with-db    # 停后端 + 停本地 PostgreSQL
bash scripts/stop_local_demo.sh              # 只停后端，保留数据库
```

机器重启后，本地 PostgreSQL 不会自启：重新执行 `bash scripts/start_local_demo.sh`
（或只执行 `scripts/local_postgres.py start`）即可，数据目录 `/tmp/pivot-pgdata`
仍在，数据不丢；`/tmp` 被系统清理时按第 3 步重建即可。

---

## 4. `.env` 配置（本机演示值）

文件位置：`Pivot_Network_Backend/Plantform_Backend/.env`，已被
`Plantform_Backend/.gitignore` 首行 `.env` 忽略，**不会进入 git**。关键项：

```dotenv
BACKEND_DEMO_MODE=true
BACKEND_ADAPTER_BASE_URL=
BACKEND_POSTGRES_URL=postgresql+psycopg://postgres@/plantform_backend?host=/private/tmp/pivot-pgdata
BACKEND_APP_PORT=8000
```

- `BACKEND_DEMO_MODE=true`：所有走 adapter 的路径改用 `DemoAdapterClient`；
- `BACKEND_ADAPTER_BASE_URL=` 置空时即使 demo_mode=false 也会降级到 demo client；
- `BACKEND_POSTGRES_URL` 的 Unix socket 地址由 `scripts/local_postgres.py start`
  打印，可直接复制。迁移 / 种子 / uvicorn 必须在 `Plantform_Backend/` 目录下执行，
  因为 `.env` 是按进程 cwd 解析的。

`.env.example` 仍是生产 / compose 用法的参考（TCP `localhost:55432` 等），本机演示
不要直接复制使用。

---

## 5. 演示账号

| 角色 | 邮箱 | 密码 | user id |
| --- | --- | --- | --- |
| 买家 | `demo@pivot.local` | `demo1234` | `user_demo_buyer` |
| 卖家·天津 | `seller.tianjin@pivot.local` | `demo1234` | `user_demo_seller_tianjin` |
| 卖家·北京 | `seller.beijing@pivot.local` | `demo1234` | `user_demo_seller_beijing` |
| 卖家·上海 | `seller.shanghai@pivot.local` | `demo1234` | `user_demo_seller_shanghai` |

种子脚本可重复执行：账号密码会被重置回 `demo1234` 并保持 `active`；offer 按固定 id
upsert，不会产生重复数据。

## 6. 演示商品（`GET /api/v1/offers` 必须返回这 3 条）

| offer id | 标题 | 价格 | 节点 / compute_node_id |
| --- | --- | --- | --- |
| `offer-a100-80g-tianjin` | A100 80GB 训练实例 · 天津 | ¥42/小时 | `tj-swarm-worker-01` / `compute-tj-a100-01` |
| `offer-rtx4090-beijing` | RTX 4090 推理实例 · 北京 | ¥18/小时 | `bj-edge-node-03` / `compute-bj-4090-03` |
| `offer-l40s-shanghai` | L40S 多模态实例 · 上海 | ¥26/小时 | `sh-runtime-node-04` / `compute-sh-l40s-04` |

排序为 `updated_at desc`，A100 固定排第一。每条 offer 的
`price_snapshot` / `capability_summary` / `inventory_state` 三个 dict 已带前端映射所需
字段（`hourly_price`、`gpu_model`、`gpu_memory_gb`、`region`、`latency_ms`、
`stock`、`seller_name`、`tags` 等）。

---

## 7. 全链 curl 实测

以下命令在 `http://127.0.0.1:8000` 上验证过（`jq` 用于截取字段）。

```bash
BASE=http://127.0.0.1:8000/api/v1

# 1) 登录，拿 Bearer token
TOKEN=$(curl -s -X POST $BASE/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"demo@pivot.local","password":"demo1234"}' | jq -r .access_token)

# 2) 商品列表（total=3）
curl -s $BASE/offers | jq '{total, ids: [.items[].id]}'

# 3) 下单（报价 120 分钟）
ORDER_ID=$(curl -s -X POST $BASE/orders \
  -H "Authorization: Bearer $TOKEN" -H 'Content-Type: application/json' \
  -d '{"offer_id":"offer-a100-80g-tianjin","requested_duration_minutes":120}' | jq -r .id)
echo "$ORDER_ID"

# 4) 激活订单，签发 access grant
GRANT_CODE=$(curl -s -X POST "$BASE/orders/$ORDER_ID/activate" \
  -H "Authorization: Bearer $TOKEN" | jq -r .access_grant.grant_code)
echo "$GRANT_CODE"

# 5) 兑换授权（demo 模式不需要 adapter，直接返回 runtime session）
SESSION_ID=$(curl -s -X POST $BASE/access-grants/redeem-by-code \
  -H "Authorization: Bearer $TOKEN" -H 'Content-Type: application/json' \
  -d "{\"grant_code\":\"$GRANT_CODE\",\"wireguard_public_key\":\"demo-wireguard-public-key-0001\"}" \
  | jq -r .id)
echo "$SESSION_ID"

# 6) 查询 runtime session
curl -s "$BASE/runtime-sessions/$SESSION_ID" -H "Authorization: Bearer $TOKEN" | jq '{id,status,runtime_bundle_status,runtime_service_name}'

# 7) 心跳 / 停止 / 关闭
curl -s -X POST "$BASE/runtime-sessions/$SESSION_ID/heartbeat" -H "Authorization: Bearer $TOKEN" | jq '{id,status}'
curl -s -X POST "$BASE/runtime-sessions/$SESSION_ID/stop"      -H "Authorization: Bearer $TOKEN" | jq '{id,status,closed_at}'
curl -s -X POST "$BASE/runtime-sessions/$SESSION_ID/close"     -H "Authorization: Bearer $TOKEN" | jq '{id,status,closed_at}'
```

实测关键响应（本次运行样例，重新跑会生成新的 id）：

```jsonc
// 1) login
{"token_type":"bearer","expires_at":"2026-10-18T20:55:16Z",
 "user":{"id":"user_demo_buyer","email":"demo@pivot.local","display_name":"演示买家","role":"buyer","status":"active"}}

// 2) offers
{"total":3,"items":[{"id":"offer-a100-80g-tianjin","title":"A100 80GB 训练实例 · 天津",
 "price_snapshot":{"currency":"CNY","hourly_price":42,"unit":"hour"},
 "inventory_state":{"region":"天津","latency_ms":14,"stock":2}}, ...]}

// 3) order
{"id":"order_72582fc456ec8307","buyer_user_id":"user_demo_buyer","offer_id":"offer-a100-80g-tianjin",
 "status":"created","requested_duration_minutes":120,"runtime_bundle_status":"placeholder_pending","access_grant_id":null}

// 4) activate
{"order":{"id":"order_72582fc456ec8307","status":"grant_issued"},
 "access_grant":{"id":"grant_3c44a74ccc4aea0d","grant_code":"h_Uh1yzhSrJ6BP5X5B6K16MSBubZPbYVjd_JFlByrbQ",
   "status":"issued","grant_type":"placeholder","runtime_session_id":"placeholder-runtime-56ec8307"}}

// 5) redeem-by-code -> runtime session
{"id":"runtime_session_d03d1536082814ec","order_id":"order_72582fc456ec8307","offer_id":"offer-a100-80g-tianjin",
 "status":"ready","runtime_bundle_status":"running","network_mode":"wireguard",
 "runtime_service_name":"pivot-demo-runtime","gateway_service_name":"pivot-demo-gateway","network_name":"pivot-demo-net",
 "connect_metadata":{"demo":true,"note":"adapter 未接入，本机演示降级",
   "wireguard_shell_embed_url":"http://127.0.0.1:32080/shell/runtime_session_d03d1536082814ec",
   "workspace_sync_url":"http://127.0.0.1:32080/api/workspace/upload/runtime_session_d03d1536082814ec",
   "runtime_image_ref":"registry.pivot.local/runtime/pytorch-cuda12.4:latest","adapter_mode":"local_demo"},
 "wireguard_lease_metadata":{"client_address":"10.66.66.200","server_interface":"wg-demo",
   "endpoint_host":"127.0.0.1","endpoint_port":51820}}

// 6) runtime session
{"id":"runtime_session_d03d1536082814ec","status":"ready","runtime_bundle_status":"running","runtime_service_name":"pivot-demo-runtime"}

// 7) stop
{"id":"runtime_session_d03d1536082814ec","status":"closed","runtime_bundle_status":"removed","closed_at":"..."}
```

### 节点视图（demo 数据）

```bash
curl -s $BASE/platform/nodes | jq '{total, items: [.items[] | {id,status,availability,compute_node_id,accelerator,running_tasks}]}'
curl -s $BASE/platform/swarm/overview | jq '{manager_host, swarm: .swarm | {state,node_id,control_available}, node_count: (.node_list_summary|length)}'
```

返回 4 个固定节点（`source: "adapter"`）：

| id | 状态 | availability | accelerator | running_tasks |
| --- | --- | --- | --- | --- |
| `tj-swarm-worker-01` | ready | active | nvidia-a100 | 1 |
| `tj-swarm-worker-02` | ready | active | nvidia-a100 | 0 |
| `bj-edge-node-03` | warning | degraded | nvidia-rtx4090 | 2 |
| `sh-runtime-node-04` | ready | active | nvidia-l40s | 0 |

---

## 8. `demo_mode` 降级改动点（代码位置）

| 文件 | 改动 |
| --- | --- |
| `backend_app/core/config.py` | 新增 `demo_mode: bool = False`（env `BACKEND_DEMO_MODE`） |
| `backend_app/api/deps.py` | `get_adapter_client()`：`demo_mode=True` 或 `adapter_base_url` 为空时返回 `DemoAdapterClient()`，否则保持原 `AdapterClient` |
| `backend_app/clients/demo_adapter_client.py`（新增） | `DemoAdapterClient(AdapterClient)`，覆盖 `/swarm/*`、节点详情、`/runtime-session-bundles`（create / inspect / remove）、`/health`；bundle `status=running`，服务名 `pivot-demo-runtime` / `pivot-demo-gateway` / `pivot-demo-net`，`connect_metadata.demo=true` |
| `backend_app/main.py` | 新增 `CORSMiddleware`：放行 `http://127.0.0.1:5173`、`http://localhost:5173`，`allow_credentials=True`，methods / headers 全开 |
| `backend_app/repositories/trade_repository.py` | `ensure_seed_offers()` 改为 3 条固定 id 的幂等 upsert（原 2 条示例 offer 被替换） |

默认 `demo_mode=False`，pytest / 生产行为不变（`32 passed`）。

---

## 9. 前端联调注意（当前前端代码仍需小改）

前端 `Pivot_Network_Frontend/src/services/api/client.ts` 目前是：

- `BASE_URL = 'http://localhost:8000'`：需要拼上 `/api/v1` 前缀（或用 Vite 代理），
  后端所有业务接口都在 `/api/v1` 下；
- `export const useMock = true`：联调时必须改为 `false`，否则不会发真实请求；
- 除登录 / 注册外，请求需要带上 `Authorization: Bearer <access_token>`；
- 后端 offer 是嵌套结构（`price_snapshot` / `capability_summary` / `inventory_state`），
  前端 `Offer` 是扁平结构，需要在 service/adapter 层做一次映射；
- 后端 runtime session 字段是 snake_case（`runtime_bundle_status` 等），前端 domain 是
  camelCase，需要映射。

CORS 已放行 5173，无需额外代理。

---

## 10. 常见问题

**`GET /offers` 返回 500 / 连接失败？**
本地 PostgreSQL 没起来。执行 `scripts/local_postgres.py status`，
再用 `scripts/local_postgres.py start` 起库；后端连接池会自动重连（`pool_pre_ping`）。

**`alembic upgrade head` 报连不上数据库？**
确认在 `Plantform_Backend/` 目录执行（`.env` 按 cwd 解析），并先
`scripts/local_postgres.py start`。

**种子脚本提示 “Database is not migrated yet”？**
先跑 `python -m alembic upgrade head`。

**8000 端口被占用？**
`lsof -nP -iTCP:8000 -sTCP:LISTEN` 找到进程；或 `bash scripts/stop_local_demo.sh`
释放端口，再 `PIVOT_PORT=8001 bash scripts/start_local_demo.sh` 换端口
（换端口后前端 `BASE_URL` 同步改）。

**pgserver 启动报 `PermissionError: .../Library/Caches/TemporaryItems`？**
受限 shell / 沙箱下无法写平台缓存目录。`scripts/local_postgres.py` 已把 pgserver 的
运行时目录重定向到系统临时目录（可用 `PIVOT_PG_RUNTIME_DIR` 覆盖），一般无需处理。

**想清空演示数据重来？**
```bash
bash scripts/stop_local_demo.sh --with-db
rm -rf /tmp/pivot-pgdata
bash scripts/start_local_demo.sh    # 重新建库 + 迁移 + 种子
```

**机器重启后？**
重新执行 `bash scripts/start_local_demo.sh`；数据保留在 `/tmp/pivot-pgdata`
（系统清理 `/tmp` 则需要重建，如下）。

**`/tmp/pivot-be-venv` 被清理了？**
按第 2 节重建 venv，然后重新执行一键启动。

**日志在哪？**
uvicorn：`/tmp/pivot-backend.log`；本地 PostgreSQL：
`/tmp/pivot-pgdata/log`。

---

## 11. 相关文件清单

| 文件 | 作用 |
| --- | --- |
| `Plantform_Backend/.env` | 本机演示配置（git 忽略） |
| `Plantform_Backend/scripts/start_local_demo.sh` | 一键启动 |
| `Plantform_Backend/scripts/stop_local_demo.sh` | 停止 |
| `Plantform_Backend/scripts/local_postgres.py` | pgserver 起 / 停 / 查本地库 |
| `Plantform_Backend/scripts/seed_local_demo.py` | 幂等种子数据 |
| `Plantform_Backend/backend_app/clients/demo_adapter_client.py` | adapter 演示降级实现 |
| `docs/LOCAL_DEMO.md` | 本文档 |

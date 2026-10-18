from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend_app.api.router import api_router
from backend_app.core.config import get_settings

settings = get_settings()

app = FastAPI(
    title=settings.project_name,
    version=settings.project_version,
    debug=settings.debug,
    openapi_url=f"{settings.api_v1_prefix}/openapi.json",
)

# Local demo: the Vite dev server (Pivot_Network_Frontend) runs on 5173 by default, but
# a second demo instance (e.g. `npm run dev:real -- --port 5174`) may use another port, so
# allow any loopback port during local development. Keep credentials enabled for Bearer flows.
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://127.0.0.1:5173",
        "http://localhost:5173",
        "http://127.0.0.1:5174",
        "http://localhost:5174",
    ],
    allow_origin_regex=r"http://(127\.0\.0\.1|localhost):\d+",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix=settings.api_v1_prefix)


@app.get("/", include_in_schema=False)
def root() -> dict[str, str]:
    return {
        "message": "Plantform Backend is running.",
        "docs": "/docs",
    }

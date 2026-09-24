from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .routes.intern_pod_routes import router as intern_pod_router

app = FastAPI(title="InnerLoop API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(intern_pod_router)


@app.get("/health")
def health():
    return {"status": "ok", "service": "innerloop-backend"}

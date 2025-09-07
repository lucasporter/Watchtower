# backend/app/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.hosts import router as hosts_router

app = FastAPI(
    title="Watchtower Monitoring API",
    version="0.1.0",
)

# CORS configuration
origins = [
    "http://localhost:5173",   # Vite dev server
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(hosts_router, prefix="/api", tags=["clusters", "nodes"])

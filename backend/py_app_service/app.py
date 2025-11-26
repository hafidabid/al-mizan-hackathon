from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import asyncio
from py_app_service.routers import projects, indexer, users, selected_projects, training
from py_app_service.services.training import process_training_job


app = FastAPI()

# Add CORS middleware to allow all origins and methods
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# @app.on_event("startup")
# async def worker_runner():
#     global worker_task  # Ensure the task can be accessed globally if needed
#     # Start the prompting_worker in the background without blocking FastAPI
#     worker_task = asyncio.create_task(process_training_job())
#     print("Worker started in the background.")

@app.get("/")
async def root():
    return {"message": "Hello World"}

app.include_router(projects.router)
app.include_router(selected_projects.router)
app.include_router(indexer.router)
app.include_router(users.router)
# app.include_router(training.router)

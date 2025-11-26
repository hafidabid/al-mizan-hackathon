from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from py_app_service.routers import projects, indexer, users, selected_projects

app = FastAPI()

# Add CORS middleware to allow all origins and methods
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "Hello World"}

app.include_router(projects.router)
app.include_router(selected_projects.router)
app.include_router(indexer.router)
app.include_router(users.router)

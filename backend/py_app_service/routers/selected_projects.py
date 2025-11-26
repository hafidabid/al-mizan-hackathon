from fastapi import APIRouter, HTTPException, UploadFile, File, Form
import httpx
import json
from typing import List, Optional
from py_app_service.config import POCKETBASE_BASE_URL, POCKETBASE_PROJECTS_COLLECTION, POCKETBASE_SELECTED_PROJECTS_COLLECTION

router = APIRouter(prefix="/selected-projects", tags=["selected-projects"])

@router.get("")
async def list_selected_projects():
    async with httpx.AsyncClient(base_url=POCKETBASE_BASE_URL, timeout=10.0) as client:
        try:
            resp = await client.get(f"/api/collections/{POCKETBASE_SELECTED_PROJECTS_COLLECTION}/records")
        except httpx.HTTPError as e:
            raise HTTPException(status_code=502, detail=f"PocketBase connection error: {str(e)}")
        
        if resp.status_code != 200:
             raise HTTPException(status_code=502, detail=f"PocketBase error: {resp.text}")
             
        return resp.json().get("items", [])

@router.post("")
async def create_selected_project(
    project_id: str = Form(...),
    beforeTrain: UploadFile = File(...)
):
    async with httpx.AsyncClient(base_url=POCKETBASE_BASE_URL, timeout=30.0) as client:
        # 1. Fetch project details
        try:
            project_resp = await client.get(f"/api/collections/{POCKETBASE_PROJECTS_COLLECTION}/records/{project_id}")
        except httpx.HTTPError as e:
            raise HTTPException(status_code=502, detail=f"PocketBase connection error: {str(e)}")

        if project_resp.status_code == 404:
            raise HTTPException(status_code=404, detail="Project not found")
        if project_resp.status_code != 200:
            raise HTTPException(status_code=502, detail=f"Error fetching project: {project_resp.text}")
            
        project_data = project_resp.json()
        
        # 2. Prepare payload for selected_project
        # User requirement: 
        # - field: relation record id (project_id)
        # - beforeTrain: file object
        # - afterTrain: null (empty)
        # - isTrained: False
        # - metadata: copy data from project
        
        # PocketBase expects multipart/form-data for file uploads
        files = {
            "beforeTrain": (beforeTrain.filename, await beforeTrain.read(), beforeTrain.content_type)
        }
        
        data = {
            "field": project_id,
            "isTrained": "false", # Multipart form data bools as strings
            "metadata": json.dumps(project_data),
            # "afterTrain": "" # Empty string to clear/set null if needed, or omit
        }

        try:
            resp = await client.post(
                f"/api/collections/{POCKETBASE_SELECTED_PROJECTS_COLLECTION}/records",
                data=data,
                files=files
            )
        except httpx.HTTPError as e:
            raise HTTPException(status_code=502, detail=f"PocketBase connection error: {str(e)}")
            
        if resp.status_code not in (200, 201):
             raise HTTPException(status_code=502, detail=f"PocketBase error: {resp.text}")
             
        return resp.json()

@router.delete("/{id}")
async def delete_selected_project(id: str):
    async with httpx.AsyncClient(base_url=POCKETBASE_BASE_URL, timeout=10.0) as client:
        try:
            resp = await client.delete(f"/api/collections/{POCKETBASE_SELECTED_PROJECTS_COLLECTION}/records/{id}")
        except httpx.HTTPError as e:
            raise HTTPException(status_code=502, detail=f"PocketBase connection error: {str(e)}")

        if resp.status_code == 404:
            raise HTTPException(status_code=404, detail="Selected project not found")
        if resp.status_code not in (200, 204):
             raise HTTPException(status_code=502, detail=f"PocketBase error: {resp.text}")
             
        return {"message": "Selected project deleted successfully"}


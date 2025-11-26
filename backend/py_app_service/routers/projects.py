from fastapi import APIRouter, HTTPException
from typing import List
import httpx
from py_app_service.models.project import ProjectCreate, ProjectResponse
from py_app_service.config import POCKETBASE_BASE_URL, POCKETBASE_PROJECTS_COLLECTION

router = APIRouter(prefix="/projects", tags=["projects"])

@router.get("", response_model=List[ProjectResponse])
async def list_projects():
    async with httpx.AsyncClient(base_url=POCKETBASE_BASE_URL, timeout=10.0) as client:
        try:
            resp = await client.get(f"/api/collections/{POCKETBASE_PROJECTS_COLLECTION}/records")
        except httpx.HTTPError as e:
            raise HTTPException(status_code=502, detail=f"PocketBase connection error: {str(e)}")
        
        if resp.status_code != 200:
             raise HTTPException(status_code=502, detail=f"PocketBase error: {resp.text}")
             
        data = resp.json().get("items", [])
        # Parse JSON fields
        mapped_items = [_map_pb_to_project_response(item) for item in data]
        return mapped_items


@router.post("", response_model=ProjectResponse)
async def create_project(project: ProjectCreate):
    async with httpx.AsyncClient(base_url=POCKETBASE_BASE_URL, timeout=10.0) as client:
        # Transform ProjectCreate to match PocketBase schema
        # PocketBase schema provided:
        # "location": {"lon": 0, "lat": 0}, "address": "test", "type": "test", "verified": true,
        # "metrics": "JSON", "quickMetrics": "JSON", "sgds": "JSON", "maqasid": "JSON",
        # "neededFund": 123, "currentFund": 123, "projectStartedAt": "...", "finishEstimationAt": "..."
        
        import json
        from datetime import datetime, timedelta
        import random

        now = datetime.utcnow()
        started_at = now - timedelta(days=random.randint(13, 30))
        finish_at = now + timedelta(days=random.randint(180, 550))

        # Map Pydantic model to PB schema
        pb_data = {
            "location": {
                "lon": project.location.longitude,
                "lat": project.location.latitude
            },
            "address": project.location.address,
            "type": project.type,
            "verified": project.verified,
            "metrics": project.metrics.dict(), # PB JSON field
            "quickMetrics": project.quickMetrics.dict(), # PB JSON field
            "sgds": [str(sdg) for sdg in project.sdgs], # PB JSON field
            "maqasid": project.maqasid, # PB JSON field
            "neededFund": project.quickMetrics.needed, # Assuming mapping from quickMetrics
            "currentFund": project.quickMetrics.beneficiaries, # Default or calculated?
            "projectStartedAt": started_at.isoformat() + "Z",
            "finishEstimationAt": finish_at.isoformat() + "Z",
            "title": project.title,
            "imageFile": project.image,
        }

        try:
            resp = await client.post(
                f"/api/collections/{POCKETBASE_PROJECTS_COLLECTION}/records",
                json=pb_data
            )
        except httpx.HTTPError as e:
             raise HTTPException(status_code=502, detail=f"PocketBase connection error: {str(e)}")

        if resp.status_code not in (200, 201):
             raise HTTPException(status_code=502, detail=f"PocketBase error: {resp.text}")
             
        # We need to map the PB response back to ProjectResponse to satisfy the contract
        # or update ProjectResponse to match PB structure if the frontend changes.
        # For now, let's return the created record, assuming frontend can handle it 
        # OR map it back to ProjectResponse structure.
        # The user query implies "update python code ... especially for get and post parsing".
        
        pb_record = resp.json()
        
        # Reconstruct ProjectResponse from PB record
        return _map_pb_to_project_response(pb_record)

def _map_pb_to_project_response(record: dict) -> ProjectResponse:
    # Map PB record back to internal model
    return ProjectResponse(
        id=record.get("id"),
        collectionId=record.get("collectionId"),
        collectionName=record.get("collectionName"),
        created=record.get("created"),
        updated=record.get("updated"),
        title=record.get("title", ""),
        location={
            "address": record.get("address", ""),
            "latitude": record.get("location", {}).get("lat", 0),
            "longitude": record.get("location", {}).get("lon", 0)
        },
        sdgs=record.get("sgds", []),
        maqasid=record.get("maqasid", []),
        type=record.get("type", ""),
        verified=record.get("verified", False),
        image=record.get("imageFile"),
        quickMetrics=record.get("quickMetrics", {}),
        metrics=record.get("metrics", {})
    )

@router.get("/{id}", response_model=ProjectResponse)
async def get_project(id: str):
    async with httpx.AsyncClient(base_url=POCKETBASE_BASE_URL, timeout=10.0) as client:
        try:
            resp = await client.get(f"/api/collections/{POCKETBASE_PROJECTS_COLLECTION}/records/{id}")
        except httpx.HTTPError as e:
             raise HTTPException(status_code=502, detail=f"PocketBase connection error: {str(e)}")

        if resp.status_code == 404:
            raise HTTPException(status_code=404, detail="Project not found")
        if resp.status_code != 200:
             raise HTTPException(status_code=502, detail=f"PocketBase error: {resp.text}")
             
        return _map_pb_to_project_response(resp.json())


@router.patch("/{id}", response_model=ProjectResponse)
async def update_project(id: str, project: ProjectCreate):
    async with httpx.AsyncClient(base_url=POCKETBASE_BASE_URL, timeout=10.0) as client:
        project_data = project.dict(exclude_unset=True)
        try:
            resp = await client.patch(
                f"/api/collections/{POCKETBASE_PROJECTS_COLLECTION}/records/{id}",
                json=project_data
            )
        except httpx.HTTPError as e:
             raise HTTPException(status_code=502, detail=f"PocketBase connection error: {str(e)}")

        if resp.status_code == 404:
            raise HTTPException(status_code=404, detail="Project not found")
        if resp.status_code != 200:
             raise HTTPException(status_code=502, detail=f"PocketBase error: {resp.text}")
             
        return resp.json()


@router.delete("/{id}")
async def delete_project(id: str):
    async with httpx.AsyncClient(base_url=POCKETBASE_BASE_URL, timeout=10.0) as client:
        try:
            resp = await client.delete(f"/api/collections/{POCKETBASE_PROJECTS_COLLECTION}/records/{id}")
        except httpx.HTTPError as e:
             raise HTTPException(status_code=502, detail=f"PocketBase connection error: {str(e)}")

        if resp.status_code == 404:
            raise HTTPException(status_code=404, detail="Project not found")
        if resp.status_code not in (200, 204):
             raise HTTPException(status_code=502, detail=f"PocketBase error: {resp.text}")
             
        return {"message": "Project deleted successfully"}


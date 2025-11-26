import httpx
import cv2
import numpy as np
import io
import os
import json
import logging
from typing import List, Optional
from py_app_service.config import POCKETBASE_BASE_URL, POCKETBASE_SELECTED_PROJECTS_COLLECTION
from py_app_service.services.compvis import predict_solar_panel

logger = logging.getLogger(__name__)

async def fetch_image_as_numpy(url: str) -> Optional[np.ndarray]:
    async with httpx.AsyncClient() as client:
        try:
            resp = await client.get(url)
            if resp.status_code != 200:
                logger.error(f"Failed to fetch image: {resp.status_code} {url}")
                return None
            image_array = np.asarray(bytearray(resp.content), dtype=np.uint8)
            image = cv2.imdecode(image_array, cv2.IMREAD_COLOR)
            return image
        except Exception as e:
            logger.error(f"Error downloading image: {e}")
            return None

async def process_project(project: dict):
    project_id = project.get("id")
    collection_id = project.get("collectionId")
    before_train_filename = project.get("beforeTrain")
    
    if not before_train_filename:
        logger.warning(f"Project {project_id} has no beforeTrain image.")
        return

    # Construct image URL
    if before_train_filename.startswith("http"):
        image_url = before_train_filename
    else:
        image_url = f"{POCKETBASE_BASE_URL}/api/files/{collection_id}/{project_id}/{before_train_filename}"

    logger.info(f"Processing project {project_id} with image {image_url}")

    # 1. Download Image
    image = await fetch_image_as_numpy(image_url)
    if image is None:
        return

    # 2. Run Inference
    try:
        annotated_image, predictions = predict_solar_panel(image)
    except Exception as e:
        logger.error(f"Error running inference on project {project_id}: {e}")
        return

    # 3. Prepare Upload
    # Encode annotated image to memory buffer
    success, encoded_image = cv2.imencode(".jpg", annotated_image)
    if not success:
        logger.error(f"Failed to encode annotated image for project {project_id}")
        return
    
    image_bytes = io.BytesIO(encoded_image.tobytes())
    image_bytes.name = f"after_{before_train_filename}" # Name is important for multipart

    # 4. Upload to PocketBase
    # We update the record with afterTrain image, isTrained=True, and trainData
    
    # Check if trainData needs to be a JSON string or object. PocketBase JSON field usually expects JSON object.
    # However, passing it as multipart/form-data, we usually send it as stringified JSON if it's a JSON field.
    
    files = {
        "afterTrain": (image_bytes.name, image_bytes, "image/jpeg")
    }
    
    # Ensure predictions are JSON serializable (numpy floats to native floats handled in compvis.py?)
    # compvis.py: "confidence": float(box.conf.cpu().numpy()), "polygon": [[float(x), float(y)] ...]
    # So they should be standard python types.
    
    data = {
        "isTrained": "true",
        "trainData": json.dumps(predictions) # Assuming 'trainData' is a JSON field in PB
    }

    async with httpx.AsyncClient(base_url=POCKETBASE_BASE_URL, timeout=60.0) as client:
        try:
            resp = await client.patch(
                f"/api/collections/{POCKETBASE_SELECTED_PROJECTS_COLLECTION}/records/{project_id}",
                data=data,
                files=files
            )
            
            if resp.status_code == 200:
                logger.info(f"Successfully processed project {project_id}")
            else:
                logger.error(f"Failed to update project {project_id}: {resp.text}")

        except httpx.HTTPError as e:
            logger.error(f"Network error updating project {project_id}: {e}")


async def process_training_job(target_ids: List[str] = None):
    """
    target_ids: List of IDs to process. If ["*"] or None, process all pending.
    """
    while True:
        logger.info("Starting training job...")
    
        async with httpx.AsyncClient(base_url=POCKETBASE_BASE_URL, timeout=30.0) as client:
            projects_to_process = []
            
            if target_ids and "*" not in target_ids:
                # Fetch specific projects
                for pid in target_ids:
                    try:
                        resp = await client.get(f"/api/collections/{POCKETBASE_SELECTED_PROJECTS_COLLECTION}/records/{pid}")
                        if resp.status_code == 200:
                            proj = resp.json()
                            if not proj.get("isTrained"):
                                projects_to_process.append(proj)
                    except Exception as e:
                        logger.error(f"Error fetching project {pid}: {e}")
            else:
                # Fetch all pending projects
                # Filter by isTrained = false
                try:
                    # PocketBase filter syntax: isTrained=false
                    resp = await client.get(
                        f"/api/collections/{POCKETBASE_SELECTED_PROJECTS_COLLECTION}/records",
                        params={"filter": "isTrained=false", "perPage": 50}
                    )
                    if resp.status_code == 200:
                        projects_to_process = resp.json().get("items", [])
                    else:
                        logger.error(f"Error searching projects: {resp.text}")
                except Exception as e:
                    logger.error(f"Error fetching pending projects: {e}")

            logger.info(f"Found {len(projects_to_process)} projects to process.")
            
            for project in projects_to_process:
                await process_project(project)

        logger.info("Training job finished.")

        # Sleep for 10 seconds to avoid overwhelming the system
        print("Sleeping for 50 seconds to avoid overwhelming the system")
        await asyncio.sleep(50)


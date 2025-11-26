from fastapi import APIRouter, BackgroundTasks, HTTPException
from pydantic import BaseModel
from typing import List
# from py_app_service.services.training import process_training_job

# router = APIRouter(prefix="/training", tags=["training"])

# class TrainingRequest(BaseModel):
#     ids: List[str]

# @router.post("/process")
# async def trigger_training_process(request: TrainingRequest, background_tasks: BackgroundTasks):
#     """
#     Trigger the training process for specific IDs or all pending ("*").
#     The process runs in the background.
#     """
#     background_tasks.add_task(process_training_job, request.ids)
#     return {"message": "Training process started in background", "targets": request.ids}


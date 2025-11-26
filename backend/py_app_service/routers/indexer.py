from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import httpx
from py_app_service.config import INDEXER_BASE_URL

router = APIRouter(prefix="/indexer", tags=["indexer"])

class GraphQLRequest(BaseModel):
    query: str
    variables: dict | None = None

@router.post("/query")
async def proxy_indexer_query(body: GraphQLRequest):
    """
    Proxy endpoint to forward GraphQL queries to the Ponder indexer.
    
    Frontend can POST { "query": "...", "variables": { ... } } here instead of 
    calling the indexer directly.
    """
    payload: dict = {"query": body.query}
    if body.variables is not None:
        payload["variables"] = body.variables

    try:
        async with httpx.AsyncClient(timeout=15.0) as client:
            resp = await client.post(
                INDEXER_BASE_URL,
                json=payload,
                headers={
                    "accept": "application/json, multipart/mixed",
                    "content-type": "application/json",
                },
            )
    except httpx.HTTPError as e:
        raise HTTPException(status_code=502, detail=f"Indexer connection error: {str(e)}")

    if resp.status_code != 200:
        raise HTTPException(
            status_code=502,
            detail=f"Indexer error: {resp.status_code} {resp.text}",
        )

    return resp.json()


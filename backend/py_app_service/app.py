from fastapi import FastAPI, HTTPException
import httpx
from pydantic import BaseModel
from py_app_service.models import UserCreate

app = FastAPI()

POCKETBASE_BASE_URL = "https://hackathon22.pocketbase.bocindonesia.com"
POCKETBASE_USERS_COLLECTION = "users"
INDEXER_BASE_URL = "http://157.15.4.171:42069/"


class GraphQLRequest(BaseModel):
    query: str
    variables: dict | None = None

@app.get("/")
async def root():
    return {"message": "Hello World"}

@app.post("/ignore-this")
async def create_new_user(user: UserCreate):
    async with httpx.AsyncClient(base_url=POCKETBASE_BASE_URL, timeout=10.0) as client:
        # Check if a user with this email already exists in PocketBase
        try:
            filter_query = f'email="{user.email}"'
            list_resp = await client.get(
                f"/api/collections/{POCKETBASE_USERS_COLLECTION}/records",
                params={"filter": filter_query},
            )
        except httpx.HTTPError as e:
            raise HTTPException(status_code=502, detail=f"PocketBase connection error: {str(e)}")

        if list_resp.status_code != 200:
            raise HTTPException(
                status_code=502,
                detail=f"PocketBase list error: {list_resp.status_code} {list_resp.text}",
            )

        list_data = list_resp.json()
        existing_items = list_data.get("items", [])
        if existing_items:
            raise HTTPException(status_code=400, detail="Email already registered")

        # Create new user record in PocketBase
        try:
            create_resp = await client.post(
                f"/api/collections/{POCKETBASE_USERS_COLLECTION}/records",
                json=user.dict(),
            )
        except httpx.HTTPError as e:
            raise HTTPException(status_code=502, detail=f"PocketBase connection error: {str(e)}")

        if create_resp.status_code not in (200, 201):
            raise HTTPException(
                status_code=502,
                detail=f"PocketBase create error: {create_resp.status_code} {create_resp.text}",
            )

        return create_resp.json()


@app.post("/indexer/query")
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
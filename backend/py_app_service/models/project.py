from pydantic import BaseModel
from typing import List, Optional, Dict, Any

class JobMetrics(BaseModel):
    construction: float
    ops: float

class QuickMetrics(BaseModel):
    needed: float
    allocation: str
    beneficiaries: int
    timeline: str

class ProjectMetrics(BaseModel):
    co2Yearly: float
    energyMWh: float
    trees: int
    jobs: JobMetrics
    sroi: float
    irr: float
    multiplier: float

class Location(BaseModel):
    address: str
    latitude: float
    longitude: float

class ProjectBase(BaseModel):
    title: str
    location: Location
    sdgs: List[str]
    maqasid: List[str]
    type: str
    verified: bool
    image: Optional[str] = None
    quickMetrics: QuickMetrics
    metrics: ProjectMetrics

class ProjectCreate(ProjectBase):
    pass

class ProjectResponse(ProjectBase):
    id: str
    collectionId: str
    collectionName: str
    created: str
    updated: str

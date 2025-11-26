import httpx
import asyncio
import json

# Project Data to Seed
projects_data = [
  {
    "title": "Lombok Solar Microgrid Zone A",
    "location": {
      "address": "Sembalun, East Lombok",
      "latitude": -8.3587,
      "longitude": 116.5342,
    },
    "sdgs": ["7", "9", "13"],
    "maqasid": ["NAFS", "MAL", "BIAH"],
    "type": "Renewable Energy",
    "verified": True,
    "quickMetrics": {
      "needed": 2250000000,
      "allocation": "60% Waqf / 40% Zakat",
      "beneficiaries": 2500,
      "timeline": "12 Months",
    },
    "image": "https://energy-oil-gas.com/wp-content/uploads/sites/3/2023/05/Solar-panels.jpg",
    "metrics": {
      "co2Yearly": 0.15, 
      "energyMWh": 0.2,
      "trees": 5,
      "jobs": { "construction": 0.05, "ops": 0.01 },
      "sroi": 3.2,
      "irr": 12.5,
      "multiplier": 4.0,
    },
  },
  {
    "title": "Aceh Digital Education Hub",
    "location": {
      "address": "Aceh Besar, Sumatra",
      "latitude": 5.4219,
      "longitude": 95.4343,
    },
    "sdgs": ["4", "9"],
    "maqasid": ["AQL", "NASL"],
    "type": "Education Tech",
    "verified": True,
    "quickMetrics": {
      "needed": 1125000000,
      "allocation": "100% Waqf",
      "beneficiaries": 1200,
      "timeline": "6 Months",
    },
    "image": "https://energy-oil-gas.com/wp-content/uploads/sites/3/2023/05/Solar-panels.jpg",
    "metrics": {
      "co2Yearly": 0.02,
      "energyMWh": 0,
      "trees": 1,
      "jobs": { "construction": 0.02, "ops": 0.05 },
      "sroi": 4.5,
      "irr": 8.5,
      "multiplier": 3.5,
    },
  },
  {
    "title": "Cianjur Smart Paddy Waqf",
    "location": {
      "address": "Cianjur, West Java",
      "latitude": -6.8217,
      "longitude": 107.1416,
    },
    "sdgs": ["1", "2"],
    "maqasid": ["NAFS", "MAL", "BIAH"],
    "type": "Agriculture",
    "verified": True,
    "quickMetrics": {
      "needed": 3000000000,
      "allocation": "30% Waqf / 70% Zakat",
      "beneficiaries": 5000,
      "timeline": "Seasonal (4 Months)",
    },
    "image": "https://energy-oil-gas.com/wp-content/uploads/sites/3/2023/05/Solar-panels.jpg",
    "metrics": {
      "co2Yearly": 0.08,
      "energyMWh": 0,
      "trees": 20,
      "jobs": { "construction": 0.1, "ops": 0.2 },
      "sroi": 5.0,
      "irr": 11.0,
      "multiplier": 5.2,
    },
  },
]

BACKEND_URL = "http://localhost:8000" # Assuming backend is running locally

async def seed_projects():
    print("Seeding projects...")
    async with httpx.AsyncClient(timeout=30.0) as client:
        for project in projects_data:
            try:
                print(f"Creating project: {project['title']}")
                resp = await client.post(f"{BACKEND_URL}/projects", json=project)
                if resp.status_code in (200, 201):
                    print(f"Successfully created: {project['title']}")
                else:
                    print(f"Failed to create {project['title']}: {resp.status_code} - {resp.text}")
            except Exception as e:
                print(f"Error creating {project['title']}: {str(e)}")

if __name__ == "__main__":
    asyncio.run(seed_projects())


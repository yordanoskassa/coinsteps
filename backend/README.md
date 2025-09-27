# Step Bet Backend (FastAPI + MongoDB)

A minimal FastAPI service to log daily step counts to MongoDB.

## Endpoints
- POST `/steps` — upsert user's step count for a given day.
- GET `/steps/{user_id}` — fetch recent days for a user.

## Quick start
1. Create a virtualenv and install deps:
```
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

2. Set env vars (copy `.env.example` to `.env`):
```
cp .env.example .env
```
Edit `.env` and set `MONGO_URL`.

3. Run the server:
```
uvicorn app.main:app --reload --port 8000
```

## Environment
- `MONGO_URL` (required) e.g. `mongodb://localhost:27017`
- `DB_NAME` (default: `stepbet`)

## Data Model
```json
{
  "user_id": "string",
  "date": "YYYY-MM-DD",
  "steps": 12345,
  "source": "apple_health|pedometer|manual",
  "updated_at": "ISO8601"
}
```

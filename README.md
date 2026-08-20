# MaatriMarg — Backend Setup Instructions

## Requirements
- Python 3.11+

## Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate      # on Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

Then open http://localhost:8000/health — you should see {"status":"ok"}

The SQLite database file (maatrimarg.db) is created automatically on first run.
No external database setup needed.

## Interactive API docs
Once running, visit http://localhost:8000/docs for FastAPI's auto-generated
Swagger UI — you can test every endpoint directly from the browser as we add them.

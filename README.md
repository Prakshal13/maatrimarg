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

## Risk models

From `backend/`, train the locally available decision-support artifacts:

```bash
python3 -m app.ml.train_generic_model maternal
python3 -m app.ml.generate_child_data
python3 -m app.ml.train_generic_model child
python3 -m app.ml.train_generic_model chronic
```

The chronic model uses `data/chronic_risk.csv` and performs cardiovascular
screening support only. Its input API accepts age in **years**, while the
source dataset stores age in days. Child triage is exposed as a transparent
rule-based prototype, not a clinically validated autonomous model.

Useful API routes:

```text
POST /predict-risk                  Maternal decision support
POST /assessments/child-triage      Transparent paediatric triage prototype
POST /assessments/chronic-cardio    Cardiovascular screening support
GET  /assessments/model-info/{type} Model provenance and internal metrics
```

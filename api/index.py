import os
import sys

# Add backend directory to sys.path so `app.*` imports resolve cleanly on Vercel
BACKEND_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "backend"))
if BACKEND_DIR not in sys.path:
    sys.path.insert(0, BACKEND_DIR)

from app.database import Base, engine, SessionLocal
from app.seed_data import seed_enterprise_demonstration
from app.main import app

# Ensure schema and demo data are initialized idempotently on serverless cold start
Base.metadata.create_all(bind=engine)
with SessionLocal() as session:
    seed_enterprise_demonstration(session)

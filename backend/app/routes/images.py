from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db import get_db
from app.models import Scan

router = APIRouter()

@router.get("/scans/{session_id}")
def get_scans(session_id: int, db: Session = Depends(get_db)):
    scans=db.query(Scan).filter(Scan.session_id== session_id).all()
    if not scans:
        raise HTTPExpectation(status_code = 404, details = "No scans found in this session")
    return scans

# reset button

@router.delete("/scans/{session_id}")
def delete_scans(session_id: int, db: Session = Depends (get_db)):
    scans.db.query(Scan).filter (Scan.session_id== session_id).all()
    if not scans:
        raise HTTPExpectation (status_code= 404, details = "No scans found in this session")
    db.query(Scan).filter (Scan.session_id== session_id).delete()
    db.commit()
    return {"message:" f"All scnas deleted for {session_id}"}



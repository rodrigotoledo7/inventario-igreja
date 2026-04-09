from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.database import get_db
from app.models import Local, User
from app.schemas import LocalCreate, LocalResponse

router = APIRouter(prefix="/locais", tags=["locais"])


@router.get("", response_model=list[LocalResponse])
def list_locais(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> list[Local]:
    return db.query(Local).order_by(Local.nome.asc()).all()


@router.post("", response_model=LocalResponse, status_code=status.HTTP_201_CREATED)
def create_local(
    payload: LocalCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Local:
    existing_local = db.query(Local).filter(Local.nome == payload.nome.strip()).first()
    if existing_local:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Local ja cadastrado.")

    new_local = Local(nome=payload.nome.strip())
    db.add(new_local)
    db.commit()
    db.refresh(new_local)
    return new_local

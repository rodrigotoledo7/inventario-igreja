from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.database import get_db
from app.models import Bem, Local, User
from app.schemas import LocalCreate, LocalResponse, LocalUpdate

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


@router.put("/{local_id}", response_model=LocalResponse)
def update_local(
    local_id: int,
    payload: LocalUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Local:
    local = db.query(Local).filter(Local.id == local_id).first()
    if local is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Local nao encontrado.")

    nome = payload.nome.strip()
    existing_local = db.query(Local).filter(Local.nome == nome, Local.id != local_id).first()
    if existing_local:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Local ja cadastrado.")

    local.nome = nome
    db.commit()
    db.refresh(local)
    return local


@router.delete("/{local_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_local(
    local_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> None:
    local = db.query(Local).filter(Local.id == local_id).first()
    if local is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Local nao encontrado.")

    linked_bem = db.query(Bem).filter(Bem.local_id == local_id).first()
    if linked_bem is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Nao e permitido excluir local com bens vinculados.",
        )

    db.delete(local)
    db.commit()

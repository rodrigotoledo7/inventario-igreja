from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.database import get_db
from app.models import Bem, Local, User
from app.schemas import BemCreate, BemResponse, BemUpdate

router = APIRouter(prefix="/bens", tags=["bens"])


@router.get("", response_model=list[BemResponse])
def list_bens(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> list[Bem]:
    return db.query(Bem).order_by(Bem.nome.asc()).all()


@router.post("", response_model=BemResponse, status_code=status.HTTP_201_CREATED)
def create_bem(
    payload: BemCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Bem:
    local = db.query(Local).filter(Local.id == payload.local_id).first()
    if local is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Local nao encontrado.")

    if payload.identificador:
        existing_identifier = db.query(Bem).filter(Bem.identificador == payload.identificador.strip()).first()
        if existing_identifier:
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Identificador ja cadastrado.")

    bem = Bem(
        nome=payload.nome.strip(),
        descricao=payload.descricao.strip() if payload.descricao else None,
        tipo=payload.tipo,
        valor_estimado=payload.valor_estimado,
        identificador=payload.identificador.strip() if payload.identificador else None,
        local_id=payload.local_id,
    )
    db.add(bem)
    db.commit()
    db.refresh(bem)
    return bem


@router.put("/{bem_id}", response_model=BemResponse)
def update_bem(
    bem_id: int,
    payload: BemUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Bem:
    bem = db.query(Bem).filter(Bem.id == bem_id).first()
    if bem is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Bem nao encontrado.")

    local = db.query(Local).filter(Local.id == payload.local_id).first()
    if local is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Local nao encontrado.")

    identificador = payload.identificador.strip() if payload.identificador else None
    if identificador:
        existing_identifier = db.query(Bem).filter(Bem.identificador == identificador, Bem.id != bem_id).first()
        if existing_identifier:
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Identificador ja cadastrado.")

    bem.nome = payload.nome.strip()
    bem.descricao = payload.descricao.strip() if payload.descricao else None
    bem.tipo = payload.tipo
    bem.valor_estimado = payload.valor_estimado
    bem.identificador = identificador
    bem.local_id = payload.local_id

    db.commit()
    db.refresh(bem)
    return bem


@router.delete("/{bem_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_bem(
    bem_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> None:
    bem = db.query(Bem).filter(Bem.id == bem_id).first()
    if bem is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Bem nao encontrado.")

    db.delete(bem)
    db.commit()

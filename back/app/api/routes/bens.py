from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.database import get_db
from app.models import Bem, Local, User
from app.schemas import BemCreate, BemResponse

router = APIRouter(prefix="/bens", tags=["bens"])


@router.get("", response_model=list[BemResponse])
def list_bens(db: Session = Depends(get_db)) -> list[Bem]:
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


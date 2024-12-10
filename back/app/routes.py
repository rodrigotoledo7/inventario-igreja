from fastapi import FastAPI, APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Bem, Local

router = APIRouter()


@router.get("/bens")
def get_bens(db: Session = Depends(get_db)):
    bens = db.query(Bem).all()
    return [{"id": b.id, "nome": b.nome, "descricao": b.descricao, "local_id": b.local_id} for b in bens]


@router.post("/bens")
def create_bem(bem: dict, db: Session = Depends(get_db)):
    try:
        novo_bem = Bem(
            nome=bem["nome"],
            descricao=bem.get("descricao"),
            local_id=bem["local_id"]
        )
        db.add(novo_bem)
        db.commit()
        db.refresh(novo_bem)
        return {"message": "Bem criado com sucesso", "id": novo_bem.id}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/locais")
def get_locais(db: Session = Depends(get_db)):
    locais = db.query(Local).all()
    return [{"id": l.id, "nome": l.nome} for l in locais]
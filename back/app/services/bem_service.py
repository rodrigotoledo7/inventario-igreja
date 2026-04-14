from app.models import Bem, Local
from app.schemas import BemCreate, BemUpdate
from app.services.base import BaseService


class BemService(BaseService):

    def list_bens(self) -> list[Bem]:
        return self.db.query(Bem).order_by(Bem.nome.asc()).all()

    def get_by_id(self, bem_id: int) -> Bem | None:
        return self.db.query(Bem).filter(Bem.id == bem_id).first()

    def create_bem(self, payload: BemCreate) -> Bem:
        local = self.db.query(Local).filter(Local.id == payload.local_id).first()
        if local is None:
            raise LookupError("Local nao encontrado.")
        if payload.identificador:
            identificador = payload.identificador.strip()
            existing = self.db.query(Bem).filter(Bem.identificador == identificador).first()
            if existing:
                raise ValueError("Identificador ja cadastrado.")
        else:
            identificador = None
        bem = Bem(
            nome=payload.nome.strip(),
            descricao=payload.descricao.strip() if payload.descricao else None,
            tipo=payload.tipo,
            valor_estimado=payload.valor_estimado,
            identificador=identificador,
            local_id=payload.local_id,
        )
        self.db.add(bem)
        self.db.commit()
        self.db.refresh(bem)
        return bem

    def update_bem(self, bem_id: int, payload: BemUpdate) -> Bem:
        bem = self.get_by_id(bem_id)
        if bem is None:
            raise LookupError("Bem nao encontrado.")
        local = self.db.query(Local).filter(Local.id == payload.local_id).first()
        if local is None:
            raise LookupError("Local nao encontrado.")
        identificador = payload.identificador.strip() if payload.identificador else None
        if identificador:
            existing = self.db.query(Bem).filter(
                Bem.identificador == identificador, Bem.id != bem_id
            ).first()
            if existing:
                raise ValueError("Identificador ja cadastrado.")
        bem.nome = payload.nome.strip()
        bem.descricao = payload.descricao.strip() if payload.descricao else None
        bem.tipo = payload.tipo
        bem.valor_estimado = payload.valor_estimado
        bem.identificador = identificador
        bem.local_id = payload.local_id
        self.db.commit()
        self.db.refresh(bem)
        return bem

    def delete_bem(self, bem_id: int) -> None:
        bem = self.get_by_id(bem_id)
        if bem is None:
            raise LookupError("Bem nao encontrado.")
        self.db.delete(bem)
        self.db.commit()
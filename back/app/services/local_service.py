from app.models import Bem, Local
from app.schemas import LocalCreate, LocalUpdate
from app.services.base import BaseService


class LocalService(BaseService):

    def list_locais(self) -> list[Local]:
        return self.db.query(Local).order_by(Local.nome.asc()).all()

    def get_by_id(self, local_id: int) -> Local | None:
        return self.db.query(Local).filter(Local.id == local_id).first()

    def get_by_nome(self, nome: str) -> Local | None:
        return self.db.query(Local).filter(Local.nome == nome).first()

    def create_local(self, payload: LocalCreate) -> Local:
        nome = payload.nome.strip()
        if self.get_by_nome(nome):
            raise ValueError("Local ja cadastrado.")
        local = Local(nome=nome)
        self.db.add(local)
        self.db.commit()
        self.db.refresh(local)
        return local

    def update_local(self, local_id: int, payload: LocalUpdate) -> Local:
        local = self.get_by_id(local_id)
        if local is None:
            raise LookupError("Local nao encontrado.")
        nome = payload.nome.strip()
        existing = self.db.query(Local).filter(
            Local.nome == nome, Local.id != local_id
        ).first()
        if existing:
            raise ValueError("Local ja cadastrado.")
        local.nome = nome
        self.db.commit()
        self.db.refresh(local)
        return local

    def delete_local(self, local_id: int) -> None:
        local = self.get_by_id(local_id)
        if local is None:
            raise LookupError("Local nao encontrado.")
        linked_bem = self.db.query(Bem).filter(Bem.local_id == local_id).first()
        if linked_bem is not None:
            raise ValueError("Nao e permitido excluir local com bens vinculados.")
        self.db.delete(local)
        self.db.commit()
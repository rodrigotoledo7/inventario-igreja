from fastapi import FastAPI
from app.routes import router
from app.database import engine, Base

# Inicializar FastAPI
app = FastAPI()

# Configuração do banco de dados
Base.metadata.create_all(bind=engine)

# Registrar as rotas
app.include_router(router)

# Rota inicial
@app.get("/")
def read_root():
    return {"message": "Inventário da Igreja - API em FastAPI"}

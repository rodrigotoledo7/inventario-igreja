from fastapi import FastAPI, APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from jose import JWTError, jwt

from app.database import get_db
from app.models import Bem, Local, User
from app.schemas import BemCreate, BemResponse, LocalCreate, LocalResponse, UserCreate, UserResponse, Token
from app.auth import get_password_hash, verify_password, create_access_token, SECRET_KEY, ALGORITHM

router = APIRouter()

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")

# Dependência para obter usuário atual
def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Não foi possível validar as credenciais",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    user = db.query(User).filter(User.username == username).first()
    if user is None:
        raise credentials_exception
    return user

# Autenticação
@router.post("/login", response_model=Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == form_data.username).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=400, detail="Usuário ou senha incorretos")

    access_token = create_access_token(data={"sub": user.username})
    return {"access_token": access_token, "token_type": "bearer"}

@router.post("/users", response_model=UserResponse)
def create_user(user: UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.username == user.username).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Username já registrado")
    hashed_password = get_password_hash(user.password)
    new_user = User(username=user.username, hashed_password=hashed_password)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

# Bens
@router.get("/bens", response_model=List[BemResponse])
def get_bens(db: Session = Depends(get_db)):
    return db.query(Bem).all()

@router.post("/bens", response_model=BemResponse)
def create_bem(bem: BemCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    novo_bem = Bem(**bem.dict())
    db.add(novo_bem)
    db.commit()
    db.refresh(novo_bem)
    return novo_bem

# Locais
@router.get("/locais", response_model=List[LocalResponse])
def get_locais(db: Session = Depends(get_db)):
    return db.query(Local).all()

@router.post("/locais", response_model=LocalResponse)
def create_local(local: LocalCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    novo_local = Local(**local.dict())
    db.add(novo_local)
    db.commit()
    db.refresh(novo_local)
    return novo_local
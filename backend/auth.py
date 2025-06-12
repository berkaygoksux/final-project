from datetime import datetime, timedelta
from typing import Optional

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from passlib.context import CryptContext
from sqlalchemy.orm import Session

# Diğer modüllerimizi import ediyoruz
import models
import schemas
from database import SessionLocal

# --- Konfigürasyon ---
SECRET_KEY = "your-secret-key"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

# --- Yardımcı Fonksiyon: Veritabanı oturumu almak için ---
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# --- Mevcut Fonksiyonlarınız ---
def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

# --- EKSİK OLAN VE YENİ EKLENEN FONKSİYONLAR ---

def authenticate_user(db: Session, username: str, password: str):
    """
    Kullanıcıyı doğrular. Kullanıcı adı ve şifre doğruysa kullanıcı modelini,
    değilse None döndürür.
    """
    user = db.query(models.User).filter(models.User.username == username).first()
    if not user:
        return None
    if not verify_password(password, user.hashed_password):
        return None
    return user

def get_current_active_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    """
    JWT token'ını alır, çözer, kullanıcıyı bulur ve döndürür.
    Bu fonksiyon, korumalı endpoint'lerde dependency olarak kullanılır.
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
        # TokenData şemasını kullanarak veriyi doğruluyoruz
        token_data = schemas.TokenData(username=username)
    except JWTError:
        raise credentials_exception
    
    user = db.query(models.User).filter(models.User.username == token_data.username).first()
    if user is None:
        raise credentials_exception
        
    return user

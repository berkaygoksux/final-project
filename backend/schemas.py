from pydantic import BaseModel, ConfigDict
from typing import Optional

# --- EKSİK OLAN VE YENİ EKLENEN SINIF ---
# JWT Token'ının içindeki 'sub' (subject) alanını temsil eder.
class TokenData(BaseModel):
    username: Optional[str] = None


# --- MEVCUT SINIFLARINIZ ---

class User(BaseModel):
    id: int
    username: str
    model_config = ConfigDict(from_attributes=True)

class UserCreate(BaseModel):
    username: str
    password: str

class UserLogin(BaseModel):
    username: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

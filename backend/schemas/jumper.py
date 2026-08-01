from pydantic import BaseModel, ConfigDict
from typing import List, Optional
from .document import TraitResponse

# ==========================================
# BUILD SCHEMAS
# ==========================================
class BuildBase(BaseModel):
    jumper_id: int
    document_id: int

class BuildCreate(BuildBase):
    trait_ids: List[int] = []
    age: Optional[int] = None
    gender: Optional[str] = None

class BuildUpdate(BaseModel):
    trait_ids: List[int] = []
    age: Optional[int] = None
    gender: Optional[str] = None

class BuildResponse(BuildBase):
    id: int
    remaining_cp: int
    traits: List[TraitResponse] = []
    age: int
    gender: str
    model_config = ConfigDict(from_attributes=True)

# ==========================================
# JUMPER SCHEMAS
# ==========================================
class JumperBase(BaseModel):
    name: str
    age: int
    gender: str

class JumperCreate(JumperBase):
    pass

class JumperResponse(JumperBase):
    id: int
    builds: List[BuildResponse] = []
    model_config = ConfigDict(from_attributes=True)
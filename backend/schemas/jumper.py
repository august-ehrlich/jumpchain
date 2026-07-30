from pydantic import BaseModel, ConfigDict
from typing import List
from .document import TraitResponse

class JumperBase(BaseModel):
    name: str

class JumperCreate(JumperBase):
    pass

class JumperResponse(JumperBase):
    id: int
    builds: List[BuildResponse] = []
    model_config = ConfigDict(from_attributes=True)

class BuildBase(BaseModel):
    jumper_id: int
    document_id: int

class BuildCreate(BuildBase):
    trait_ids: List[int] = []

class BuildResponse(BuildBase):
    id: int
    remaining_cp: int
    traits: List[TraitResponse] = []
    model_config = ConfigDict(from_attributes=True)

class BuildUpdate(BaseModel):
    trait_ids: List[int] = []
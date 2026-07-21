from pydantic import BaseModel, ConfigDict
from typing import List, Optional


class JumperBase(BaseModel):
    name: str

class JumperCreate(JumperBase):
    pass

class JumperResponse(JumperBase):
    id: int
    model_config = ConfigDict(from_attributes=True)


class BuildCreate(BaseModel):
    jumper_id: int
    document_id: int
    selected_origin_id: Optional[int] = None
    
    perk_ids: List[int] = []
    item_ids: List[int] = []
    drawback_ids: List[int] = []

class BuildResponse(BaseModel):
    id: int
    jumper_id: int
    document_id: int
    selected_origin_id: Optional[int] = None
    remaining_cp: int

    model_config = ConfigDict(from_attributes=True)
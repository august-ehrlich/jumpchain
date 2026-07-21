from pydantic import BaseModel, ConfigDict
from typing import List


# ORIGIN SCHEMAS
class OriginBase(BaseModel):
    name: str
    cost: int
    description: str

class OriginCreate(OriginBase):
    pass

class OriginResponse(OriginBase):
    id: int
    model_config = ConfigDict(from_attributes=True)


# PERK SCHEMAS
class PerkBase(BaseModel):
    name: str
    cost: int
    description: str

class PerkCreate(PerkBase):
    pass

class PerkResponse(PerkBase):
    id: int
    model_config = ConfigDict(from_attributes=True)


# ITEM SCHEMAS
class ItemBase(BaseModel):
    name: str
    cost: int
    description: str

class ItemCreate(ItemBase):
    pass

class ItemResponse(ItemBase):
    id: int
    model_config = ConfigDict(from_attributes=True)


# DRAWBACK SCHEMAS
class DrawbackBase(BaseModel):
    name: str
    profit: int
    description: str

class DrawbackCreate(DrawbackBase):
    pass

class DrawbackResponse(DrawbackBase):
    id: int
    model_config = ConfigDict(from_attributes=True)


# DOCUMENT SCHEMAS
class DocumentBase(BaseModel):
    title: str
    choice_points: int
    summary: str

class DocumentCreate(DocumentBase):
    origins: List[OriginCreate] = []
    perks: List[PerkCreate] = []
    items: List[ItemCreate] = []
    drawbacks: List[DrawbackCreate] = []

class DocumentResponse(DocumentBase):
    id: int
    
    origins: List[OriginResponse] = []
    perks: List[PerkResponse] = []
    items: List[ItemResponse] = []
    drawbacks: List[DrawbackResponse] = []
    
    model_config = ConfigDict(from_attributes=True)
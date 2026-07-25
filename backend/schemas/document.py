from pydantic import BaseModel, ConfigDict
from typing import List, Optional

# ==========================================
# DISCOUNT SCHEMAS (Must be defined first!)
# ==========================================
class DiscountUpdate(BaseModel):
    source_trait_id: int
    discount: int

class DiscountResponse(BaseModel):
    source_trait_id: int
    discount: int
    model_config = ConfigDict(from_attributes=True)

# ==========================================
# TRAIT SCHEMAS
# ==========================================
class TraitBase(BaseModel):
    name: str
    description: str
    cost: int
    subtitle: Optional[str] = None

class TraitCreate(TraitBase):
    id: int
    discounts_received: List[DiscountUpdate] = []

# Inherit from TraitBase so it gets name, description, cost, and subtitle automatically
class TraitUpdate(TraitBase):
    id: int
    discounts_received: List[DiscountUpdate] = []

class TraitResponse(TraitBase):
    id: int
    category_id: int
    discounts_received: List[DiscountResponse] = []
    model_config = ConfigDict(from_attributes=True)

# ==========================================
# CATEGORY SCHEMAS
# ==========================================
class CategoryBase(BaseModel):
    name: str
    has_cost: bool = True
    summary: Optional[str] = None

class CategoryCreate(CategoryBase):
    traits: List[TraitCreate] = []

# Inherit from CategoryBase so it gets name, has_cost, and summary automatically
class CategoryUpdate(CategoryBase):
    id: int
    traits: List[TraitUpdate]

class CategoryResponse(CategoryBase):
    id: int
    document_id: int
    traits: List[TraitResponse] = []
    model_config = ConfigDict(from_attributes=True)

# ==========================================
# DOCUMENT SCHEMAS
# ==========================================
class DocumentBase(BaseModel):
    title: str
    choice_points: int
    summary: str

class DocumentCreate(DocumentBase):
    categories: List[CategoryCreate] = []

class DocumentUpdate(BaseModel):
    title: Optional[str] = None
    choice_points: Optional[int] = None
    summary: Optional[str] = None
    categories: Optional[List[CategoryUpdate]] = None

class Document(DocumentBase):
    id: int
    categories: List[CategoryResponse] = []
    model_config = ConfigDict(from_attributes=True)
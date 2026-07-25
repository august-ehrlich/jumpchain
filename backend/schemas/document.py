from pydantic import BaseModel, ConfigDict
from typing import List, Optional

# ==========================================
# TRAIT SCHEMAS (Replaces Origins, Perks, etc.)
# ==========================================
class TraitBase(BaseModel):
    name: str
    description: str
    cost: int

class TraitCreate(TraitBase):
    id: int
    discounts_received: List[DiscountUpdate] = []

class TraitUpdate(BaseModel):
    id: int
    name: str
    description: str
    cost: int
    discounts_received: List[DiscountUpdate] = []

class TraitResponse(TraitBase):
    id: int
    category_id: int

    model_config = ConfigDict(from_attributes=True)
    discounts_received: List[DiscountResponse] = []

# ==========================================
# CATEGORY SCHEMAS
# ==========================================
class CategoryBase(BaseModel):
    name: str
    has_cost: bool = True

class CategoryCreate(CategoryBase):
    # Allows creating a category with traits already inside it
    traits: List[TraitCreate] = []

class CategoryUpdate(BaseModel):
    id: int
    name: str
    has_cost: bool
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
    # Allows creating a full document with all categories and traits in one POST request
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

class DiscountUpdate(BaseModel):
    source_trait_id: int
    discount: int

class DiscountResponse(BaseModel):
    source_trait_id: int
    discount: int
    model_config = ConfigDict(from_attributes=True)
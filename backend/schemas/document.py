from pydantic import BaseModel, ConfigDict
from typing import List, Optional

class DiscountInput(BaseModel):
    source_trait_id: int
    discount: int

class TraitBase(BaseModel):
    name: str
    description: str
    cost: int
    subtitle: Optional[str] = None
    is_modifier: bool = False

class TraitInput(TraitBase):
    id: int  # Accepts actual DB IDs or temporary negative frontend IDs
    discounts_received: List[DiscountInput] = []

class CategoryBase(BaseModel):
    name: str
    has_cost: bool = True
    summary: Optional[str] = None
    max_allowed: int = 1

class CategoryInput(CategoryBase):
    id: int  # Accepts actual DB IDs or temporary negative frontend IDs
    traits: List[TraitInput] = []

# ==========================================
# ROOT DOCUMENT SCHEMAS
# ==========================================
class DocumentBase(BaseModel):
    title: str
    choice_points: int
    summary: str

# Create requires all base fields
class DocumentCreate(DocumentBase):
    categories: List[CategoryInput] = []

# Update makes root fields optional, but expects the full category tree if provided
class DocumentUpdate(BaseModel):
    title: Optional[str] = None
    choice_points: Optional[int] = None
    summary: Optional[str] = None
    categories: Optional[List[CategoryInput]] = None

# ==========================================
# RESPONSE SCHEMAS
# ==========================================
class DiscountResponse(BaseModel):
    source_trait_id: int
    discount: int
    model_config = ConfigDict(from_attributes=True)

class TraitResponse(TraitBase):
    id: int
    category_id: int
    discounts_received: List[DiscountResponse] = []
    model_config = ConfigDict(from_attributes=True)

class CategoryResponse(CategoryBase):
    id: int
    document_id: int
    traits: List[TraitResponse] = []
    model_config = ConfigDict(from_attributes=True)

class Document(DocumentBase):
    id: int
    categories: List[CategoryResponse] = []
    model_config = ConfigDict(from_attributes=True)
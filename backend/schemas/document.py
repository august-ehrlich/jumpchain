from pydantic import BaseModel, ConfigDict
from typing import List, Optional, Dict, Any

class Rule(BaseModel):
    name: str
    ui_context: Optional[Dict[str, Any]] = None
    conditions: List[Dict[str, Any]] = []
    effects: List[Dict[str, Any]] = []

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
    id: int

class CategoryBase(BaseModel):
    name: str
    summary: Optional[str] = None
    max_allowed: int = 1
    is_random: bool = False
    is_ordering: bool = False

class CategoryInput(CategoryBase):
    id: int  
    traits: List[TraitInput] = []

# ==========================================
# ROOT DOCUMENT SCHEMAS
# ==========================================
class DocumentBase(BaseModel):
    title: str
    choice_points: int
    summary: str
    has_random_age: bool = False
    age_roll_min: int = 14
    age_roll_max: int = 25
    rules: List[Rule] = []

# Create requires all base fields
class DocumentCreate(DocumentBase):
    categories: List[CategoryInput] = []

# Update makes root fields optional, but expects the full category tree if provided
class DocumentUpdate(BaseModel):
    title: Optional[str] = None
    choice_points: Optional[int] = None
    summary: Optional[str] = None
    categories: Optional[List[CategoryInput]] = None
    has_random_age: Optional[bool] = None
    age_roll_min: Optional[int] = None
    age_roll_max: Optional[int] = None
    rules: Optional[List[Rule]] = None

# ==========================================
# RESPONSE SCHEMAS
# ==========================================
class TraitResponse(TraitBase):
    id: int
    category_id: int
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
    
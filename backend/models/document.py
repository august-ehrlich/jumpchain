from typing import Any
from sqlalchemy import String, Integer, ForeignKey, Text, Boolean, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import expression
from core.database import Base

class Document(Base):
    __tablename__ = "documents"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    title: Mapped[str] = mapped_column(String(255))
    
    choice_points: Mapped[int] = mapped_column(Integer, nullable=False)
    summary: Mapped[str] = mapped_column(Text)

    has_random_age: Mapped[bool] = mapped_column(Boolean, server_default=expression.false(), default=False)
    age_roll_min: Mapped[int] = mapped_column(Integer, server_default="14", default=14)
    age_roll_max: Mapped[int] = mapped_column(Integer, server_default="25", default=25)
    
    # The new rule engine column containing JSON arrays of conditions and effects
    rules: Mapped[list[dict[str, Any]]] = mapped_column(JSON, server_default="[]", default=list)

    categories: Mapped[list["TraitCategory"]] = relationship(
        back_populates="document", cascade="all, delete-orphan", order_by="TraitCategory.sort_order"
    )

class TraitCategory(Base):
    __tablename__ = "categories"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    document_id: Mapped[int] = mapped_column(ForeignKey("documents.id", ondelete="CASCADE"))
    
    name: Mapped[str] = mapped_column(String(255))
    document: Mapped["Document"] = relationship(back_populates="categories")
    summary: Mapped[str | None] = mapped_column(Text, nullable=True)
    sort_order: Mapped[int] = mapped_column(Integer, server_default="0", default=0)
    max_allowed: Mapped[int] = mapped_column(Integer, server_default="1", default=1)
    is_random: Mapped[bool] = mapped_column(Boolean, server_default=expression.false(), default=False)
    is_ordering : Mapped[bool] = mapped_column(Boolean, server_default=expression.false(), default=False)
    
    traits = relationship("Trait", back_populates="category", order_by="Trait.id", cascade="all, delete-orphan")

class Trait(Base):
    __tablename__ = "traits"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    category_id: Mapped[int] = mapped_column(ForeignKey("categories.id", ondelete="CASCADE"))
    
    name: Mapped[str] = mapped_column(String(255))
    description: Mapped[str] = mapped_column(Text)
    cost: Mapped[int] = mapped_column(Integer, default=0)
    subtitle: Mapped[str | None] = mapped_column(String(255), nullable=True)
    is_modifier: Mapped[bool] = mapped_column(Boolean, server_default=expression.false(), default=False)

    category: Mapped["TraitCategory"] = relationship(back_populates="traits")
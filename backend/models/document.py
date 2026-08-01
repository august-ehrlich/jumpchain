from sqlalchemy import String, Integer, ForeignKey, Text, Boolean
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
    age_bypass_trait_id: Mapped[int | None] = mapped_column(Integer, nullable=True)
    gender_bypass_trait_id: Mapped[int | None] = mapped_column(Integer, nullable=True)

    # A document now has many custom categories
    categories: Mapped[list["TraitCategory"]] = relationship(
        back_populates="document", cascade="all, delete-orphan", order_by="TraitCategory.sort_order"
    )

class TraitCategory(Base):
    __tablename__ = "categories"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    document_id: Mapped[int] = mapped_column(ForeignKey("documents.id", ondelete="CASCADE"))
    
    name: Mapped[str] = mapped_column(String(255))
    has_cost: Mapped[bool] = mapped_column(Boolean, default=True)
    document: Mapped["Document"] = relationship(back_populates="categories")
    summary: Mapped[str | None] = mapped_column(Text, nullable=True)
    sort_order: Mapped[int] = mapped_column(Integer, server_default="0", default=0)
    max_allowed: Mapped[int] = mapped_column(Integer, server_default="1", default="1")
    is_random: Mapped[bool] = mapped_column(Boolean, server_default=expression.false(), default=False)
    bypass_trait_id: Mapped[int | None] = mapped_column(Integer, nullable=True)
    free_pick_trait_id: Mapped[int | None] = mapped_column(Integer, nullable=True)

    traits: Mapped[list["Trait"]] = relationship(
        back_populates="category", cascade="all, delete-orphan"
    )

class TraitDiscount(Base):
    __tablename__ = "discounts"

    source_trait_id: Mapped[int] = mapped_column(ForeignKey("traits.id", ondelete="CASCADE"), primary_key=True)
    target_trait_id: Mapped[int] = mapped_column(ForeignKey("traits.id", ondelete="CASCADE"), primary_key=True)

    discount: Mapped[int] = mapped_column(Integer, default=0)

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

    discounts_received: Mapped[list["TraitDiscount"]] = relationship(
        foreign_keys=[TraitDiscount.target_trait_id],
        cascade="all, delete-orphan"
    )

    discounts_given: Mapped[list["TraitDiscount"]] = relationship(
        foreign_keys=[TraitDiscount.source_trait_id],
        cascade="all, delete-orphan"
    )

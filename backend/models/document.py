from sqlalchemy import String, Integer, ForeignKey, Text, Boolean
from sqlalchemy.orm import Mapped, mapped_column, relationship
from core.database import Base

class Document(Base):
    __tablename__ = "documents"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    title: Mapped[str] = mapped_column(String(255))
    
    choice_points: Mapped[int] = mapped_column(Integer, nullable=False)
    summary: Mapped[str] = mapped_column(Text)

    # A document now has many custom categories
    categories: Mapped[list["TraitCategory"]] = relationship(
        back_populates="document", cascade="all, delete-orphan"
    )

class TraitCategory(Base):
    __tablename__ = "categories"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    document_id: Mapped[int] = mapped_column(ForeignKey("documents.id", ondelete="CASCADE"))
    
    name: Mapped[str] = mapped_column(String(255))
    
    has_cost: Mapped[bool] = mapped_column(Boolean, default=True)

    document: Mapped["Document"] = relationship(back_populates="categories")
    
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

    category: Mapped["TraitCategory"] = relationship(back_populates="traits")

    discounts_received: Mapped[list["TraitDiscount"]] = relationship(
        foreign_keys=[TraitDiscount.target_trait_id],
        cascade="all, delete-orphan"
    )

    discounts_given: Mapped[list["TraitDiscount"]] = relationship(
        foreign_keys=[TraitDiscount.source_trait_id],
        cascade="all, delete-orphan"
    )

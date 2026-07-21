from sqlalchemy import String, Integer, ForeignKey, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from core.database import Base
from .associations import drawback_locked_origins

class Document(Base):
    __tablename__ = "documents"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    title: Mapped[str] = mapped_column(String(255))
    
    choice_points: Mapped[int] = mapped_column(Integer, nullable=False)
    summary: Mapped[str] = mapped_column(Text)

    origins: Mapped[list["Origin"]] = relationship(back_populates="document", cascade="all, delete-orphan")
    perks: Mapped[list["Perk"]] = relationship(back_populates="document", cascade="all, delete-orphan")
    items: Mapped[list["Item"]] = relationship(back_populates="document", cascade="all, delete-orphan")
    drawbacks: Mapped[list["Drawback"]] = relationship(back_populates="document", cascade="all, delete-orphan")

class OriginPerkDiscount(Base):
    __tablename__ = "origin_perk_discounts"

    # The two foreign keys act as a composite primary key
    origin_id: Mapped[int] = mapped_column(ForeignKey("origins.id", ondelete="CASCADE"), primary_key=True)
    perk_id: Mapped[int] = mapped_column(ForeignKey("perks.id", ondelete="CASCADE"), primary_key=True)
    
    # The new data payload!
    discount_percentage: Mapped[int] = mapped_column(Integer, default=50) # e.g., 50 for half off, 100 for free

    # Relationships pointing back to the core models
    origin: Mapped["Origin"] = relationship(back_populates="perk_discounts")
    perk: Mapped["Perk"] = relationship(back_populates="origin_discounts")

class Origin(Base):
    __tablename__ = "origins"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    document_id: Mapped[int] = mapped_column(ForeignKey("documents.id", ondelete="CASCADE"))
    
    name: Mapped[str] = mapped_column(String(255))
    cost: Mapped[int] = mapped_column(Integer)
    description: Mapped[str] = mapped_column(Text)

    document: Mapped["Document"] = relationship(back_populates="origins")

    perk_discounts: Mapped[list["OriginPerkDiscount"]] = relationship(
        back_populates="origin", cascade="all, delete-orphan"
    )

    locked_by_drawbacks: Mapped[list["Drawback"]] = relationship(
        secondary=drawback_locked_origins, back_populates="locked_origins"
    )

    def discount_perk(self, perk: "Perk", percentage: int = 50):
        """Helper to quickly attach a discounted perk to this origin."""
        discount = OriginPerkDiscount(
            origin=self, 
            perk=perk, 
            discount_percentage=percentage
        )
        self.perk_discounts.append(discount)

class Perk(Base):
    __tablename__ = "perks"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    document_id: Mapped[int] = mapped_column(ForeignKey("documents.id", ondelete="CASCADE"))
    
    name: Mapped[str] = mapped_column(String(255))
    cost: Mapped[int] = mapped_column(Integer)
    description: Mapped[str] = mapped_column(Text)

    document: Mapped["Document"] = relationship(back_populates="perks")

    origin_discounts: Mapped[list["OriginPerkDiscount"]] = relationship(
        back_populates="perk", cascade="all, delete-orphan"
    )
    def get_actual_cost(self, origin_id: int | None) -> int:
        """Calculates the final CP cost based on the Jumper's chosen origin."""
        if not origin_id:
            return self.cost
            
        for discount in self.origin_discounts:
            if discount.origin_id == origin_id:
                multiplier = 1 - (discount.discount_percentage / 100.0)
                return int(self.cost * multiplier)
                
        return self.cost

class Item(Base):
    __tablename__ = "items"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    document_id: Mapped[int] = mapped_column(ForeignKey("documents.id", ondelete="CASCADE"))
    
    name: Mapped[str] = mapped_column(String(255))
    cost: Mapped[int] = mapped_column(Integer)
    description: Mapped[str] = mapped_column(Text)

    document: Mapped["Document"] = relationship(back_populates="items")

class Drawback(Base):
    __tablename__ = "drawbacks"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    document_id: Mapped[int] = mapped_column(ForeignKey("documents.id", ondelete="CASCADE"))
    
    name: Mapped[str] = mapped_column(String(255))
    profit: Mapped[int] = mapped_column(Integer)
    description: Mapped[str] = mapped_column(Text)

    document: Mapped["Document"] = relationship(back_populates="drawbacks")

    locked_origins: Mapped[list["Origin"]] = relationship(
        secondary=drawback_locked_origins, back_populates="locked_by_drawbacks"
    )
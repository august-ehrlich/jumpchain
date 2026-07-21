from sqlalchemy import String, Integer, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from core.database import Base
from .associations import build_perks, build_items, build_drawbacks
from .document import Document, Origin, Perk, Item, Drawback

class Jumper(Base):
    __tablename__ = "jumpers"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(255))
    
    # A Jumper has a history of many Builds
    builds: Mapped[list["Build"]] = relationship(back_populates="jumper", cascade="all, delete-orphan")


class Build(Base):
    __tablename__ = "builds"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    
    # The two core links: Who is playing, and what Document are they playing?
    jumper_id: Mapped[int] = mapped_column(ForeignKey("jumpers.id", ondelete="CASCADE"))
    document_id: Mapped[int] = mapped_column(ForeignKey("documents.id", ondelete="CASCADE"))
    
    # The specific choices made in this run
    selected_origin_id: Mapped[int | None] = mapped_column(ForeignKey("origins.id", ondelete="SET NULL"), nullable=True)
    remaining_cp: Mapped[int] = mapped_column(Integer, default=0)

    # Relationships back to the core entities
    jumper: Mapped["Jumper"] = relationship(back_populates="builds")
    document: Mapped["Document"] = relationship()
    origin: Mapped["Origin"] = relationship()

    # Many-to-Many relationships bridging to the purchased traits
    perks: Mapped[list["Perk"]] = relationship(secondary=build_perks)
    items: Mapped[list["Item"]] = relationship(secondary=build_items)
    drawbacks: Mapped[list["Drawback"]] = relationship(secondary=build_drawbacks)
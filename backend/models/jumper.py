from sqlalchemy import String, Integer, ForeignKey, Table, Column
from sqlalchemy.orm import Mapped, mapped_column, relationship
from core.database import Base
from .document import Document, Trait

build_traits_table = Table(
    "build_traits",
    Base.metadata,
    Column("build_id", Integer, ForeignKey("builds.id", ondelete="CASCADE"), primary_key=True),
    Column("trait_id", Integer, ForeignKey("traits.id", ondelete="CASCADE"), primary_key=True)
)

class Jumper(Base):
    __tablename__ = "jumpers"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(255))
    
    builds: Mapped[list["Build"]] = relationship(back_populates="jumper", cascade="all, delete-orphan")

class Build(Base):
    __tablename__ = "builds"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    jumper_id: Mapped[int] = mapped_column(ForeignKey("jumpers.id", ondelete="CASCADE"))
    document_id: Mapped[int] = mapped_column(ForeignKey("documents.id", ondelete="CASCADE"))
    remaining_cp: Mapped[int] = mapped_column(Integer, default=0)

    jumper: Mapped["Jumper"] = relationship(back_populates="builds")
    document: Mapped["Document"] = relationship()
    
    traits: Mapped[list["Trait"]] = relationship(secondary=build_traits_table)
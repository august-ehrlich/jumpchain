from sqlalchemy import Integer, ForeignKey, Table, Column
from core.database import Base

drawback_locked_origins = Table(
    "drawback_locked_origins",
    Base.metadata,
    Column("drawback_id", Integer,  ForeignKey("drawbacks.id", ondelete="CASCADE"), primary_key=True),
    Column("origin_id", Integer,  ForeignKey("origins.id", ondelete="CASCADE"), primary_key=True),
)

build_perks = Table(
    "build_perks",
    Base.metadata,
    Column("build_id", Integer, ForeignKey("builds.id", ondelete="CASCADE"), primary_key=True),
    Column("perk_id", Integer, ForeignKey("perks.id", ondelete="CASCADE"), primary_key=True),
)

build_items = Table(
    "build_items",
    Base.metadata,
    Column("build_id", Integer, ForeignKey("builds.id", ondelete="CASCADE"), primary_key=True),
    Column("item_id", Integer, ForeignKey("items.id", ondelete="CASCADE"), primary_key=True),
)

build_drawbacks = Table(
    "build_drawbacks",
    Base.metadata,
    Column("build_id", Integer, ForeignKey("builds.id", ondelete="CASCADE"), primary_key=True),
    Column("drawback_id", Integer, ForeignKey("drawbacks.id", ondelete="CASCADE"), primary_key=True),
)
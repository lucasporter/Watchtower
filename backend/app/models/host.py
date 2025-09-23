# backend/app/models/host.py
from __future__ import annotations

from datetime import datetime, UTC
from typing import List, Optional

from sqlalchemy import String, Integer, Boolean, Text, ForeignKey, DateTime, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class Cluster(Base):
    __tablename__ = "clusters"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String, unique=True, index=True)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    # Timezone-aware; DB default + Python-side default for safety
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        default=lambda: datetime.now(UTC),
        nullable=False,
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        default=lambda: datetime.now(UTC),
        nullable=False,
    )

    nodes: Mapped[List["Node"]] = relationship(
        back_populates="cluster",
        cascade="all, delete-orphan",
    )


class Node(Base):
    __tablename__ = "nodes"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String, index=True)
    ip_address: Mapped[Optional[str]] = mapped_column(String, index=True)
    hostname: Mapped[Optional[str]] = mapped_column(String, index=True)

    # SSH connectivity
    ssh_reachable: Mapped[bool] = mapped_column(Boolean, default=False)
    ssh_port: Mapped[int] = mapped_column(Integer, default=22)
    ssh_username: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    ssh_key_path: Mapped[Optional[str]] = mapped_column(String, nullable=True)

    # Health status
    is_alive: Mapped[bool] = mapped_column(Boolean, default=False)
    passing_unit_tests: Mapped[bool] = mapped_column(Boolean, default=True)
    last_health_check: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True), nullable=True
    )

    # Additional attributes
    operating_system: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    cpu_info: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    memory_info: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    disk_info: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    # Timestamps (timezone-aware)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        default=lambda: datetime.now(UTC),
        nullable=False,
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        default=lambda: datetime.now(UTC),
        nullable=False,
    )

    # Foreign key to cluster
    cluster_id: Mapped[int] = mapped_column(ForeignKey("clusters.id"), nullable=False)
    cluster: Mapped["Cluster"] = relationship(back_populates="nodes")

"""Make business_id nullable in customers and conversations

Revision ID: 001
Revises: 
Create Date: 2026-07-08
"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa


revision: str = "001"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.alter_column("customers", "business_id", nullable=True, existing_type=sa.String(36))
    op.alter_column("conversations", "business_id", nullable=True, existing_type=sa.String(36))


def downgrade() -> None:
    op.alter_column("customers", "business_id", nullable=False, existing_type=sa.String(36))
    op.alter_column("conversations", "business_id", nullable=False, existing_type=sa.String(36))

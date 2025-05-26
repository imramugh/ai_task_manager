"""merge password reset and templates migrations

Revision ID: 43d95238296e
Revises: add_password_reset, add_templates_001
Create Date: 2025-05-25 17:50:59.649095

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '43d95238296e'
down_revision = ('add_password_reset', 'add_templates_001')
branch_labels = None
depends_on = None


def upgrade() -> None:
    pass


def downgrade() -> None:
    pass
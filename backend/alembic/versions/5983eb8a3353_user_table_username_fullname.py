"""User table: username->fullname

Revision ID: 5983eb8a3353
Revises: 1a0d0d69b4e9
Create Date: 2024-10-07 07:22:31.525582

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.engine.reflection import Inspector


# revision identifiers, used by Alembic.
revision = '5983eb8a3353'
down_revision = '1a0d0d69b4e9'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Start batch mode for SQLite compatibility
    with op.batch_alter_table("users", schema=None) as batch_op:
        batch_op.add_column(sa.Column('fullname', sa.String(), nullable=False, server_default='Unknown'))
        batch_op.create_unique_constraint('uq_fullname', ['fullname'])
        batch_op.drop_column('username')


def downgrade() -> None:
    # Start batch mode for SQLite compatibility
    with op.batch_alter_table("users", schema=None) as batch_op:
        batch_op.add_column(sa.Column('username', sa.String(), nullable=False))
        batch_op.drop_constraint('uq_fullname', type_='unique')
        batch_op.drop_column('fullname')
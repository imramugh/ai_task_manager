"""Add templates table and update users table

Revision ID: add_templates_001
Revises: 
Create Date: 2024-01-01 00:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = 'add_templates_001'
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    # Issue #23: Create task_templates table
    op.create_table('task_templates',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('name', sa.String(length=100), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('task_description', sa.Text(), nullable=False),
        sa.Column('task_priority', sa.String(length=20), nullable=True),
        sa.Column('task_project_id', sa.Integer(), nullable=True),
        sa.Column('task_tags', sa.JSON(), nullable=True),
        sa.Column('task_duration_days', sa.Integer(), nullable=True),
        sa.Column('is_shared', sa.Boolean(), nullable=True),
        sa.Column('category', sa.String(length=50), nullable=True),
        sa.Column('usage_count', sa.Integer(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['task_project_id'], ['projects.id'], ),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_task_templates_user_id'), 'task_templates', ['user_id'], unique=False)
    
    # Issue #19: Add indexes for better query performance
    op.create_index('idx_task_user_created', 'tasks', ['user_id', 'created_at'])
    op.create_index('idx_task_user_priority', 'tasks', ['user_id', 'priority'])
    op.create_index('idx_task_user_due_date', 'tasks', ['user_id', 'due_date'])
    

def downgrade():
    # Drop indexes
    op.drop_index('idx_task_user_due_date', table_name='tasks')
    op.drop_index('idx_task_user_priority', table_name='tasks')
    op.drop_index('idx_task_user_created', table_name='tasks')
    
    # Drop templates table
    op.drop_index(op.f('ix_task_templates_user_id'), table_name='task_templates')
    op.drop_table('task_templates')
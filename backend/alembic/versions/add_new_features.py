"""Add time tracking, recurrence, dependencies, and refresh tokens

Revision ID: add_new_features
Revises: 
Create Date: 2025-05-25

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = 'add_new_features'
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    # Create refresh_tokens table
    op.create_table('refresh_tokens',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('token', sa.String(), nullable=True),
        sa.Column('user_id', sa.Integer(), nullable=True),
        sa.Column('device_fingerprint', sa.String(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('last_used', sa.DateTime(), nullable=True),
        sa.Column('expires_at', sa.DateTime(), nullable=True),
        sa.Column('is_revoked', sa.Boolean(), nullable=True),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_refresh_tokens_token'), 'refresh_tokens', ['token'], unique=True)
    
    # Create time_entries table
    op.create_table('time_entries',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('task_id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('start_time', sa.DateTime(), nullable=False),
        sa.Column('end_time', sa.DateTime(), nullable=True),
        sa.Column('duration_seconds', sa.Integer(), nullable=True),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('is_billable', sa.Boolean(), nullable=True),
        sa.Column('hourly_rate', sa.Float(), nullable=True),
        sa.ForeignKeyConstraint(['task_id'], ['tasks.id'], ),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_time_entries_id'), 'time_entries', ['id'], unique=False)
    
    # Create recurrence_patterns table
    op.create_table('recurrence_patterns',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('task_id', sa.Integer(), nullable=True),
        sa.Column('recurrence_type', sa.Enum('DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY', 'CUSTOM', name='recurrencetype'), nullable=False),
        sa.Column('interval', sa.Integer(), nullable=True),
        sa.Column('week_days', sa.String(length=20), nullable=True),
        sa.Column('month_day', sa.String(length=10), nullable=True),
        sa.Column('month_week', sa.Integer(), nullable=True),
        sa.Column('month_week_day', sa.Integer(), nullable=True),
        sa.Column('end_type', sa.String(length=20), nullable=True),
        sa.Column('end_after_count', sa.Integer(), nullable=True),
        sa.Column('end_by_date', sa.Date(), nullable=True),
        sa.Column('occurrences_created', sa.Integer(), nullable=True),
        sa.Column('last_created_date', sa.Date(), nullable=True),
        sa.Column('next_occurrence_date', sa.Date(), nullable=True),
        sa.Column('is_active', sa.Boolean(), nullable=True),
        sa.ForeignKeyConstraint(['task_id'], ['tasks.id'], ),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('task_id')
    )
    op.create_index(op.f('ix_recurrence_patterns_id'), 'recurrence_patterns', ['id'], unique=False)
    
    # Create task_dependencies table
    op.create_table('task_dependencies',
        sa.Column('dependent_task_id', sa.Integer(), nullable=False),
        sa.Column('prerequisite_task_id', sa.Integer(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['dependent_task_id'], ['tasks.id'], ),
        sa.ForeignKeyConstraint(['prerequisite_task_id'], ['tasks.id'], ),
        sa.PrimaryKeyConstraint('dependent_task_id', 'prerequisite_task_id')
    )
    
    # Add new columns to existing tables
    op.add_column('tasks', sa.Column('estimated_hours', sa.Float(), nullable=True))
    op.add_column('users', sa.Column('allow_persistent_sessions', sa.Boolean(), nullable=True))
    op.add_column('users', sa.Column('max_sessions', sa.Integer(), nullable=True))
    op.add_column('users', sa.Column('default_hourly_rate', sa.Float(), nullable=True))
    
    # Set default values for new columns
    op.execute("UPDATE users SET allow_persistent_sessions = true")
    op.execute("UPDATE users SET max_sessions = 10")


def downgrade():
    # Drop new columns from existing tables
    op.drop_column('users', 'default_hourly_rate')
    op.drop_column('users', 'max_sessions')
    op.drop_column('users', 'allow_persistent_sessions')
    op.drop_column('tasks', 'estimated_hours')
    
    # Drop new tables
    op.drop_table('task_dependencies')
    op.drop_index(op.f('ix_recurrence_patterns_id'), table_name='recurrence_patterns')
    op.drop_table('recurrence_patterns')
    op.drop_index(op.f('ix_time_entries_id'), table_name='time_entries')
    op.drop_table('time_entries')
    op.drop_index(op.f('ix_refresh_tokens_token'), table_name='refresh_tokens')
    op.drop_table('refresh_tokens')
    
    # Drop enum type
    op.execute("DROP TYPE IF EXISTS recurrencetype")

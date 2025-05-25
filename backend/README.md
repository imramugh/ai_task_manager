# AI Task Manager Backend

## Setup Instructions

1. Create a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and add:
   - `OPENAI_API_KEY`: Your OpenAI API key (required for AI features)
   - `DATABASE_URL`: PostgreSQL connection string
   - `SECRET_KEY`: A secure secret key for JWT tokens

4. Run database migrations:
   ```bash
   alembic upgrade head
   ```

5. Start the server:
   ```bash
   uvicorn main:app --reload
   ```

## API Documentation

Once the server is running, visit:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Environment Variables

- `DATABASE_URL`: PostgreSQL connection string
- `OPENAI_API_KEY`: OpenAI API key for AI features
- `SECRET_KEY`: JWT secret key
- `ALLOWED_ORIGINS`: Comma-separated list of allowed CORS origins
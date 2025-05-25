# AI Task Manager

An intelligent task management application with AI-powered assistant for smart task planning and organization.

## Features

- 🤖 AI Assistant for task planning and suggestions
- ✅ Modern task management with projects, tags, and priorities
- 🎯 Command palette for quick actions
- 💬 Natural language task creation
- 🎨 Beautiful UI with Catalyst UI Kit

## Tech Stack

### Frontend
- **NextJS 14** (App Router)
- **TypeScript**
- **Tailwind CSS** + **Catalyst UI Kit**
- **cmdk** for command palette

### Backend
- **FastAPI** (Python)
- **SQLAlchemy** ORM
- **PostgreSQL** database
- **OpenAI API** for AI features

## Project Structure

```
ai_task_manager/
├── frontend/          # NextJS application
├── backend/           # FastAPI application
├── docker-compose.yml # Development environment
└── README.md
```

## Getting Started

### Prerequisites

- Node.js 18+
- Python 3.11+
- PostgreSQL 15+
- OpenAI API key

### Development Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/imramugh/ai_task_manager.git
   cd ai_task_manager
   ```

2. **Set up the frontend**
   ```bash
   cd frontend
   npm install
   cp .env.example .env.local
   # Add your environment variables
   npm run dev
   ```

3. **Set up the backend**
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   cp .env.example .env
   # Add your OpenAI API key and database URL
   uvicorn main:app --reload
   ```

4. **Set up the database**
   ```bash
   # Using docker-compose
   docker-compose up -d postgres
   
   # Run migrations
   cd backend
   alembic upgrade head
   ```

## Environment Variables

### Frontend (.env.local)
```
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXTAUTH_SECRET=your-secret-key
NEXTAUTH_URL=http://localhost:3000
```

### Backend (.env)
```
DATABASE_URL=postgresql://user:password@localhost/ai_task_manager
OPENAI_API_KEY=your-openai-api-key
SECRET_KEY=your-secret-key
```

## License

MIT
# AI Task Manager

An intelligent task management application with AI-powered features, built with FastAPI and Next.js.

## Features

- ✅ **Task Management**: Create, update, delete, and organize tasks
- 🤖 **AI Assistant**: Get AI-powered suggestions and task generation
- 📁 **Projects**: Organize tasks into projects
- 🏷️ **Tags**: Categorize tasks with tags
- 📊 **Dashboard**: Visual overview of your tasks and productivity
- 🔒 **Authentication**: Secure user authentication with JWT
- 🔑 **Password Reset**: Email-based password recovery system
- 🔍 **Search**: Full-text search across tasks (Issue #20)
- 📊 **Pagination**: Efficient loading of large task lists (Issue #19)
- 🔃 **Sorting**: Sort tasks by various criteria (Issue #22)
- 📱 **Mobile Responsive**: Optimized for mobile devices (Issue #21)
- ⏱️ **Rate Limiting**: API protection against abuse (Issue #18)
- 📝 **Templates**: Save and reuse task templates (Issue #23)
- ✅ **Validation**: Input validation for data integrity (Issue #17)

## Recent Updates

### Password Reset Feature
- **Secure Recovery**: Email-based password reset with time-limited tokens
- **Rate Limiting**: Protection against brute force attacks
- **Email Templates**: Professional HTML email templates
- **Token Security**: 32-character random tokens with 24-hour expiry

### Previous Updates (Issues #17-23)

#### Backend Improvements
- **Input Validation** (Issue #17): Added comprehensive validation for task titles and descriptions
- **Rate Limiting** (Issue #18): Implemented API rate limiting using SlowAPI to prevent abuse
- **Pagination** (Issue #19): Added pagination support for task lists with configurable page sizes
- **Search Functionality** (Issue #20): Added basic and advanced search endpoints for tasks
- **Sorting** (Issue #22): Tasks can now be sorted by multiple fields with customizable order
- **Task Templates** (Issue #23): New template system for creating reusable task configurations

#### Frontend Enhancements
- **Mobile Responsiveness** (Issue #21): Complete mobile UI overhaul with touch-friendly interfaces
- **Search UI**: Real-time search with debouncing
- **Sort Controls**: Interactive sorting interface
- **Template Manager**: Full CRUD interface for task templates
- **Improved Validation**: Client-side validation with clear error messages

## Tech Stack

### Backend
- **FastAPI**: Modern Python web framework
- **SQLAlchemy**: SQL toolkit and ORM
- **PostgreSQL**: Primary database
- **Alembic**: Database migrations
- **OpenAI**: AI integration
- **SlowAPI**: Rate limiting
- **JWT**: Authentication
- **SMTP**: Email delivery

### Frontend
- **Next.js 13**: React framework with App Router
- **TypeScript**: Type safety
- **Tailwind CSS**: Utility-first CSS
- **Headless UI**: Unstyled UI components
- **SWR**: Data fetching and caching
- **Axios**: HTTP client
- **React Hot Toast**: Notifications

## Getting Started

### Prerequisites
- Docker and Docker Compose
- Node.js 18+ (for local development)
- Python 3.11+ (for local development)
- PostgreSQL (or use Docker)
- SMTP server (for email functionality)

### Environment Setup

1. Clone the repository:
```bash
git clone https://github.com/yourusername/ai_task_manager.git
cd ai_task_manager
```

2. Create environment files:

**Backend (.env)**:
```bash
cp backend/.env.example backend/.env
```

Edit `backend/.env` with your configuration:
```env
DATABASE_URL=postgresql://user:password@localhost/ai_task_manager
SECRET_KEY=your-secret-key-here
OPENAI_API_KEY=your-openai-api-key

# Email settings for password reset
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your-email@gmail.com
SMTP_PASSWORD=your-app-specific-password
SMTP_FROM_EMAIL=your-email@gmail.com
SMTP_FROM_NAME=AI Task Manager
SMTP_TLS=true

# Frontend URL for password reset links
FRONTEND_URL=http://localhost:3000
```

**Frontend (.env.local)**:
```bash
cp frontend/.env.example frontend/.env.local
```

### Running with Docker

1. Start all services:
```bash
docker-compose up -d
```

2. Run database migrations:
```bash
docker-compose exec backend alembic upgrade head
```

3. Access the application:
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Documentation: http://localhost:8000/docs

### Local Development

#### Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
alembic upgrade head
uvicorn main:app --reload
```

#### Frontend
```bash
cd frontend
npm install
npm run dev
```

## API Documentation

The API documentation is available at `http://localhost:8000/docs` when running the backend.

### Key Endpoints

- **Authentication**
  - `POST /api/auth/register` - Register new user
  - `POST /api/auth/login` - Login (rate limited: 5/min)
  - `POST /api/auth/password-reset/request` - Request password reset (rate limited: 3/hour)
  - `POST /api/auth/password-reset/confirm` - Confirm password reset (rate limited: 5/hour)
  - `GET /api/auth/password-reset/verify/{token}` - Verify reset token
  
- **Tasks**
  - `GET /api/tasks` - List tasks (paginated, sortable)
  - `GET /api/tasks/search` - Search tasks
  - `POST /api/tasks/search/advanced` - Advanced search
  - `POST /api/tasks` - Create task
  - `PUT /api/tasks/{id}` - Update task
  - `DELETE /api/tasks/{id}` - Delete task
  
- **Templates**
  - `GET /api/templates` - List templates
  - `POST /api/templates` - Create template
  - `POST /api/templates/{id}/use` - Create task from template
  
- **AI Features**
  - `POST /api/ai/chat` - Chat with AI (rate limited: 20/hour)
  - `POST /api/ai/generate-tasks` - Generate tasks (rate limited: 10/hour)
  - `POST /api/ai/analyze-productivity` - Get productivity analysis

## Documentation

- [Password Reset Implementation](docs/password-reset.md) - Detailed guide on the password reset feature

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

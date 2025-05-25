# AI Task Manager

An intelligent task management application with AI-powered assistant for smart task planning and organization.

![AI Task Manager](https://img.shields.io/badge/NextJS-14-black?style=flat-square&logo=next.js)
![FastAPI](https://img.shields.io/badge/FastAPI-0.109-009688?style=flat-square&logo=fastapi)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3-3178C6?style=flat-square&logo=typescript)
![Python](https://img.shields.io/badge/Python-3.11-3776AB?style=flat-square&logo=python)

## 🎯 Features

### Core Task Management
- ✅ **Full CRUD Operations** - Create, read, update, and delete tasks
- 🎨 **Priority Levels** - Organize tasks by urgency (Low, Medium, High, Urgent)
- 📅 **Due Dates** - Set deadlines and track time-sensitive tasks
- 🏷️ **Projects** - Group related tasks into projects with custom colors
- ✔️ **Task Completion** - Mark tasks as complete with visual feedback

### AI-Powered Features
- 🤖 **Intelligent Task Generation** - Describe your project and let AI create tasks
- 💬 **Natural Language Chat** - Chat with AI to plan and organize work
- 💡 **Smart Suggestions** - Get AI recommendations for task breakdown
- 🎯 **Context-Aware** - AI understands your project context

### User Experience
- ⌘ **Command Palette** - Quick actions with Cmd/Ctrl + K
- 🎨 **Beautiful UI** - Modern, responsive design with Tailwind CSS
- 🔍 **Real-time Search** - Find tasks and projects instantly
- 📋 **Filtering** - View all, active, or completed tasks
- 🔄 **Auto-refresh** - UI updates instantly after actions

### Technical Features
- 🔐 **JWT Authentication** - Secure user sessions
- 🔗 **RESTful API** - Well-structured backend endpoints
- 📦 **PostgreSQL Database** - Reliable data persistence
- 🐳 **Docker Support** - Easy development setup
- 🚀 **Production Ready** - Scalable architecture

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS (Ready for Catalyst UI Kit)
- **State Management**: React Hooks + SWR
- **Command Palette**: cmdk
- **HTTP Client**: Axios
- **UI Components**: Headless UI, Heroicons

### Backend
- **Framework**: FastAPI
- **Language**: Python 3.11
- **Database**: PostgreSQL + SQLAlchemy
- **Authentication**: JWT (python-jose)
- **AI Integration**: OpenAI API
- **Migrations**: Alembic

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Python 3.11+
- PostgreSQL 15+
- OpenAI API key

### 1. Clone the Repository
```bash
git clone https://github.com/imramugh/ai_task_manager.git
cd ai_task_manager
```

### 2. Start PostgreSQL with Docker
```bash
docker-compose up -d postgres
```

### 3. Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env and add your OPENAI_API_KEY

# Run migrations
alembic upgrade head

# Start the server
uvicorn main:app --reload
```

### 4. Frontend Setup
```bash
cd ../frontend
npm install

# Configure environment
cp .env.example .env.local

# Start development server
npm run dev
```

### 5. Access the Application
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Documentation: http://localhost:8000/docs

## 📸 Screenshots

### Task Management
- Clean, intuitive interface for managing tasks
- Visual priority indicators and due dates
- One-click task completion

### AI Assistant
- Natural conversation interface
- Intelligent task generation from descriptions
- Context-aware suggestions

### Command Palette
- Quick access to all features
- Keyboard-first navigation
- Instant task creation

## 📖 API Documentation

The backend provides a comprehensive REST API:

### Authentication
- `POST /api/auth/register` - Create new account
- `POST /api/auth/login` - Login and receive JWT token
- `GET /api/auth/me` - Get current user info

### Tasks
- `GET /api/tasks` - List all tasks (with filters)
- `POST /api/tasks` - Create new task
- `PUT /api/tasks/{id}` - Update task
- `DELETE /api/tasks/{id}` - Delete task

### Projects
- `GET /api/projects` - List all projects
- `POST /api/projects` - Create new project
- `PUT /api/projects/{id}` - Update project
- `DELETE /api/projects/{id}` - Delete project

### AI Features
- `POST /api/ai/chat` - Chat with AI assistant
- `POST /api/ai/generate-tasks` - Generate tasks from description

## 🌱 Environment Variables

### Backend (.env)
```env
DATABASE_URL=postgresql://taskuser:taskpass@localhost:5432/ai_task_manager
OPENAI_API_KEY=your-openai-api-key
SECRET_KEY=your-secret-key-for-jwt
ALLOWED_ORIGINS=http://localhost:3000
```

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXTAUTH_SECRET=your-nextauth-secret
NEXTAUTH_URL=http://localhost:3000
```

## 🛣️ Roadmap

- [ ] Team collaboration features
- [ ] Task templates
- [ ] Recurring tasks
- [ ] Calendar view
- [ ] Mobile app
- [ ] Email notifications
- [ ] Time tracking
- [ ] Export functionality
- [ ] Dark mode
- [ ] Multi-language support

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with Next.js and FastAPI
- UI components from Headless UI
- Icons from Heroicons
- Command palette powered by cmdk
- AI capabilities powered by OpenAI

---

<p align="center">Made with ❤️ by <a href="https://github.com/imramugh">imramugh</a></p>
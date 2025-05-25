# AI Task Manager Frontend

## Setup Instructions

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up environment variables:
   ```bash
   cp .env.example .env.local
   ```
   
   Edit `.env.local` and configure:
   - `NEXT_PUBLIC_API_URL`: Backend API URL (default: http://localhost:8000)
   - `NEXTAUTH_SECRET`: Secret for NextAuth.js
   - `NEXTAUTH_URL`: Application URL (default: http://localhost:3000)

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open http://localhost:3000 in your browser

## Features

- ✅ Task management with CRUD operations
- 🤖 AI-powered task generation
- 💬 Natural language chat interface
- 🎯 Command palette (Cmd/Ctrl + K)
- 📁 Project organization
- 🎨 Beautiful UI with Tailwind CSS

## Installing Catalyst UI Kit

This project is set up to use the Catalyst UI Kit. To install it:

1. Purchase Catalyst UI Kit from Tailwind UI
2. Follow their installation instructions
3. Replace the placeholder components with Catalyst components

## Available Scripts

- `npm run dev`: Start development server
- `npm run build`: Build for production
- `npm run start`: Start production server
- `npm run lint`: Run ESLint
- `npm run type-check`: Run TypeScript type checking
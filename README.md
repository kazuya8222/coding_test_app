# CodeInterview AI

A web application for simulating coding interviews with AI interviewers.

## Features

- User authentication system
- Interview simulation (video/audio, code editor, AI interviewer interaction)
- Code execution and evaluation
- Comprehensive evaluation report generation

## Tech Stack

- Frontend: React.js (TypeScript), WebRTC, WebSocket
- Backend: Node.js/Express, Socket.io
- Database: MongoDB
- AI: OpenAI API integration
- Authentication: JWT
- Code Editor: Monaco Editor

## Project Structure

```
codeinterview-ai/
├── backend/         # Express API server
├── frontend/        # React SPA
├── shared/          # Common type definitions
└── infra/           # Docker and DB configurations
```

## Prerequisites

- Node.js (v18 or higher)
- Docker and Docker Compose
- MongoDB
- OpenAI API key

## Setup Instructions

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/codeinterview-ai.git
   cd codeinterview-ai
   ```

2. Install dependencies:
   ```bash
   npm run install:all
   ```

3. Create environment files:
   ```bash
   cp .env.example .env
   ```

4. Update the `.env` file with your configuration:
   - Set your MongoDB connection string
   - Set your JWT secret
   - Set your OpenAI API key

5. Start the development environment:
   ```bash
   # Using Docker (recommended)
   docker-compose -f infra/docker-compose.yml up

   # Or manually
   npm run start
   ```

6. Access the application:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:4000

## Development

### Backend Development

```bash
cd backend
npm run dev
```

### Frontend Development

```bash
cd frontend
npm run dev
```

## Building for Production

```bash
npm run build
```

## License

MIT 
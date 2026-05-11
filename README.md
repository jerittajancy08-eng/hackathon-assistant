# Hackathon Assistant Chatbot

A full-stack AI chatbot platform for hackathon discovery, built with React, Tailwind CSS, Express, and OpenAI. This scaffold includes a modern dark-mode UI, reusable components, API integration, secure endpoint patterns, and a scalable folder architecture.

## Project Structure

- `frontend/` - React + Tailwind UI, Vite app, chat experience, API client
- `backend/` - Express server, `/chat` endpoint, OpenAI integration, validation, error handling
- `.gitignore` - ignore node_modules, env files, build artifacts

## Setup Instructions

### 1. Clone / Open Project

Open the `c:\Users\jerit\Chatbot` folder in VS Code.

### 2. Install dependencies

From the root, install frontend and backend packages separately:

```bash
cd backend
npm install
cd ../frontend
npm install
```

### 3. Configure environment variables

Create a `.env` file in `backend/` with:

```env
PORT=5000
OPENAI_API_KEY=your_openai_api_key_here
MONGO_URI=mongodb://127.0.0.1:27017/hackathon-assistant
JWT_SECRET=your_jwt_secret_here
FRONTEND_ORIGIN=http://localhost:5173
```

### 4. Run locally

Start backend server:

```bash
cd backend
npm run dev
```

Start frontend app:

```bash
cd frontend
npm run dev
```

Open `http://localhost:5173` in your browser.

## Deployment Guide

### Vercel (Frontend)

1. Deploy `frontend/` as a Vite app.
2. Set environment variables in Vercel for any public keys if needed.
3. Use a separate backend deployment.

### Render / Heroku / Railway (Backend)

1. Deploy `backend/` as a Node.js service.
2. Set `OPENAI_API_KEY` and `PORT` in service environment.
3. Configure CORS to allow your frontend origin.

## Security Best Practices

- Keep `OPENAI_API_KEY` secret and out of source control.
- Use HTTPS in production.
- Add request rate limiting and authentication before launch.
- Validate request payloads on the server.
- Sanitize and log errors safely.

## Future Enhancements

- MongoDB integration for conversation storage.
- Hackathon database + search for recommendations.
- Vector database + RAG for knowledge augmentation.
- Auth / user accounts and saved sessions.
- Rate limiting and monitoring.
- Prompt engineering for personalization.

## How to integrate MongoDB later

1. Install `mongodb` or `mongoose` in `backend/`.
2. Create a `backend/models` folder for schema definitions.
3. Add a `backend/config/db.js` helper to connect on startup.
4. Store chat sessions, users, and hackathon metadata.
5. Load saved user history when a session resumes.

## How to connect chatbot with a hackathon database

1. Build a dedicated `hackathons` collection.
2. Add metadata fields like `name`, `theme`, `teamSize`, `deadline`, and `experienceLevel`.
3. Use a backend route like `/api/hackathons/search`.
4. In the chat controller, enrich AI prompts with filtered hackathon data.
5. Return both assistant text and recommended events to the UI.

## Vector database + RAG suggestions

- Use a vector database like Pinecone, Weaviate, or Milvus.
- Store hackathon descriptions, FAQ content, and guidance docs as embeddings.
- Retrieve relevant docs for user queries.
- Add a RAG layer in the backend to combine retrieved knowledge with OpenAI prompts.
- Use RAG for more accurate and contextually grounded answers.

## Rate limiting suggestions

- Add `express-rate-limit` to protect `/api/chat`.
- Use per-IP limits, burst windows, and connection throttling.
- For production, configure Redis-backed rate limiting for horizontal scaling.

## Recommended production improvements

- Add authentication and session handling.
- Use logging and observability (Sentry, Logflare, Datadog).
- Configure a CDN for frontend assets.
- Cache safe API responses when possible.
- Use environment-based config for origins, API keys, and feature flags.
- Monitor usage and cost from the OpenAI API.

## Notes

This scaffold is designed for a clean, modular handoff. The frontend is responsive, dark-themed, animated, and expandable. The backend uses a service/controller/router pattern and environment-based configuration.

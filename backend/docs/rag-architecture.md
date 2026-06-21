# HackBot RAG Architecture

## Current Query Flow

1. The frontend posts a user message to `POST /api/chat`.
2. The backend loads or builds the persisted vector store from `backend/data/knowledge`.
3. Supported knowledge files are `.json`, `.txt`, and `.md`.
4. Documents are parsed into LangChain `Document` objects and split into searchable chunks.
5. Chunks are embedded with a deterministic local embedding function and stored in `backend/data/vector-store/hackbot-vectors.json`.
6. The top matching chunks are injected into the Groq prompt.
7. Groq returns a concise context-aware answer.
8. The API returns `{ answer, sources, mode: "rag" }`.

The vector store is implemented as a local persisted equivalent to ChromaDB so the project can run without a separate Chroma server. To move to ChromaDB later, replace `services/vectorStore.js` with a Chroma-backed implementation while preserving `similaritySearch`, `indexKnowledgeBase`, and `getVectorStore`.

## Admin Knowledge Management

Use:

`POST /api/admin/knowledge`

```json
{
  "title": "AI Hackathon Mentor",
  "category": "Project Ideas",
  "content": "A mentor that recommends project scope, stack, and pitch improvements.",
  "source": "admin"
}
```

The backend writes a JSON file into `backend/data/knowledge` and immediately re-indexes the knowledge base. No code change is required for new entries.

Useful endpoints:

- `GET /api/admin/knowledge/status`
- `POST /api/admin/knowledge/reindex`
- `POST /api/admin/knowledge`

## Future Memory System

Recommended architecture:

- Add a `UserPreference` model with fields: `user`, `key`, `value`, `confidence`, `sourceMessage`, `createdAt`, `updatedAt`.
- Detect preference-intent phrases such as "remember I prefer AI projects" after each authenticated chat.
- Store preferences separately from the knowledge base because preferences are user-specific, not global facts.
- During chat, retrieve user preferences by `req.user._id` and inject them into a separate `User memory` prompt section.
- Keep memory transparent: allow users to list, update, and delete stored preferences.

Example memory:

```json
{
  "key": "preferred_project_domain",
  "value": "AI",
  "confidence": 0.95
}
```

Prompt injection pattern:

```text
User memory:
- The user prefers AI projects.

Retrieved knowledge:
...
```

import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { cosineSimilarity, embedText } from "./embeddingService.js";
import { readKnowledgeFiles } from "./documentLoader.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const BACKEND_ROOT = path.resolve(__dirname, "..");
const VECTOR_DIR = path.resolve(BACKEND_ROOT, "data", "vector-store");
const VECTOR_FILE = path.join(VECTOR_DIR, "hackbot-vectors.json");

let memoryStore = null;
let indexingPromise = null;

async function persistStore(store) {
  await fs.mkdir(VECTOR_DIR, { recursive: true });
  await fs.writeFile(VECTOR_FILE, JSON.stringify(store, null, 2));
}

async function loadPersistedStore() {
  try {
    const content = await fs.readFile(VECTOR_FILE, "utf8");
    return JSON.parse(content);
  } catch {
    return null;
  }
}

async function indexKnowledgeBase() {
  const chunks = await readKnowledgeFiles();
  const store = {
    provider: "local-json-vector-store",
    embedding: "deterministic-hashing-embedding",
    updatedAt: new Date().toISOString(),
    documents: chunks.map((chunk) => ({
      id: chunk.id,
      pageContent: chunk.pageContent,
      metadata: chunk.metadata,
      embedding: embedText(
        `${chunk.metadata.title}\n${chunk.metadata.category}\n${chunk.pageContent}`
      ),
    })),
  };

  await persistStore(store);
  memoryStore = store;
  return store;
}

async function getVectorStore({ force = false } = {}) {
  if (force) {
    return indexKnowledgeBase();
  }

  if (memoryStore) {
    return memoryStore;
  }

  memoryStore = await loadPersistedStore();
  if (memoryStore) {
    return memoryStore;
  }

  if (!indexingPromise) {
    indexingPromise = indexKnowledgeBase().finally(() => {
      indexingPromise = null;
    });
  }

  return indexingPromise;
}

async function similaritySearch(query, topK = 5) {
  const store = await getVectorStore();
  const queryEmbedding = embedText(query);

  return store.documents
    .map((document) => ({
      ...document,
      score: cosineSimilarity(queryEmbedding, document.embedding),
    }))
    .filter((document) => document.score > 0.02)
    .sort((left, right) => right.score - left.score)
    .slice(0, topK);
}

export { getVectorStore, indexKnowledgeBase, similaritySearch };

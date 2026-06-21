import fs from "fs/promises";
import path from "path";
import crypto from "crypto";
import { KNOWLEDGE_DIR } from "./documentLoader.js";
import { indexKnowledgeBase } from "./vectorStore.js";

function slugify(value) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 70);
}

function validateKnowledgeEntry(entry = {}) {
  const required = ["title", "category", "content"];
  const missing = required.filter((field) => !entry[field]?.trim());

  if (missing.length > 0) {
    const error = new Error(`Missing required field(s): ${missing.join(", ")}`);
    error.status = 400;
    throw error;
  }
}

async function addKnowledgeEntry(entry) {
  validateKnowledgeEntry(entry);

  await fs.mkdir(KNOWLEDGE_DIR, { recursive: true });

  const slug = slugify(entry.title);
  const suffix = crypto.randomBytes(4).toString("hex");
  const filePath = path.join(KNOWLEDGE_DIR, `${slug}-${suffix}.json`);
  const payload = {
    title: entry.title.trim(),
    category: entry.category.trim(),
    source: entry.source?.trim() || "admin-entry",
    content: entry.content.trim(),
    createdAt: new Date().toISOString(),
  };

  await fs.writeFile(filePath, JSON.stringify(payload, null, 2));
  await indexKnowledgeBase();

  return {
    ...payload,
    file: path.basename(filePath),
  };
}

export { addKnowledgeEntry };

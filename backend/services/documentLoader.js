import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { Document } from "@langchain/core/documents";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const BACKEND_ROOT = path.resolve(__dirname, "..");
const KNOWLEDGE_DIR = path.resolve(BACKEND_ROOT, "data", "knowledge");
const SUPPORTED_EXTENSIONS = new Set([".json", ".md", ".txt"]);

function parseFrontMatterValue(content, label) {
  const match = content.match(new RegExp(`^${label}:\\s*(.+)$`, "im"));
  return match?.[1]?.trim() || "";
}

function parseJsonDocument(filePath, parsed) {
  const entries = Array.isArray(parsed) ? parsed : [parsed];

  return entries.map((entry, index) => ({
    id: `${path.basename(filePath)}:${index}`,
    title: entry.title || path.basename(filePath),
    category: entry.category || "General",
    source: entry.source || "",
    content: entry.content || JSON.stringify(entry, null, 2),
    filePath,
  }));
}

function parseTextDocument(filePath, content) {
  const titleMatch = content.match(/^#\s+(.+)$/m);

  return [
    {
      id: path.basename(filePath),
      title: titleMatch?.[1]?.trim() || path.basename(filePath),
      category: parseFrontMatterValue(content, "Category") || "General",
      source: parseFrontMatterValue(content, "Source") || "",
      content,
      filePath,
    },
  ];
}

function chunkDocument(document, chunkSize = 900, overlap = 120) {
  const normalized = document.content.replace(/\r\n/g, "\n").trim();
  const paragraphs = normalized.split(/\n{2,}/).map((part) => part.trim()).filter(Boolean);
  const chunks = [];
  let current = "";

  paragraphs.forEach((paragraph) => {
    if ((current + "\n\n" + paragraph).trim().length <= chunkSize) {
      current = (current + "\n\n" + paragraph).trim();
      return;
    }

    if (current) {
      chunks.push(current);
    }

    if (paragraph.length <= chunkSize) {
      current = paragraph;
      return;
    }

    for (let start = 0; start < paragraph.length; start += chunkSize - overlap) {
      chunks.push(paragraph.slice(start, start + chunkSize));
    }
    current = "";
  });

  if (current) {
    chunks.push(current);
  }

  return chunks.map((content, index) => new Document({
    id: `${document.id}#chunk-${index}`,
    pageContent: content,
    metadata: {
      title: document.title,
      category: document.category,
      source: document.source,
      filePath: document.filePath,
      chunk: index,
    },
  }));
}

async function readKnowledgeFiles(directory = KNOWLEDGE_DIR) {
  await fs.mkdir(directory, { recursive: true });
  const files = await fs.readdir(directory, { withFileTypes: true });
  const documents = [];

  for (const file of files) {
    if (!file.isFile()) {
      continue;
    }

    const filePath = path.join(directory, file.name);
    const extension = path.extname(file.name).toLowerCase();

    if (!SUPPORTED_EXTENSIONS.has(extension)) {
      continue;
    }

    const content = await fs.readFile(filePath, "utf8");

    if (extension === ".json") {
      documents.push(...parseJsonDocument(filePath, JSON.parse(content)));
    } else {
      documents.push(...parseTextDocument(filePath, content));
    }
  }

  return documents.flatMap((document) => chunkDocument(document));
}

export { KNOWLEDGE_DIR, readKnowledgeFiles };

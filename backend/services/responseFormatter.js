const CODE_FENCE_PATTERN = /```(?:json|javascript|js|text|markdown)?\s*([\s\S]*?)```/gi;
const TECHNICAL_LINES_PATTERN =
  /^(?:\[?Context\s+\d+\]?|Chunk\s*ID|Embedding|Vector|Score|Metadata|Source object|filePath|provider|updatedAt|documents:|id:).*/i;

function normalizeUrl(value = "") {
  return value.replace(/^\[|\]$/g, "").replace(/[),.]+$/g, "").trim();
}

function tryParseJson(value) {
  if (typeof value !== "string") {
    return value;
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return "";
  }

  try {
    return JSON.parse(trimmed);
  } catch {
    return null;
  }
}

function formatObject(record) {
  if (!record || typeof record !== "object" || Array.isArray(record)) {
    return "";
  }

  const title = record.title || record.name || record.platform || record.event || "";
  const description = record.description || record.summary || record.content || "";
  const link = record.link || record.url || record.source || record.officialLink || "";
  const fields = [];

  if (title) {
    fields.push(String(title).trim());
  }

  if (description && description !== title) {
    fields.push(`${String(description).trim().replace(/[.。]?$/, ".")}`);
  }

  if (link && /^https?:\/\//i.test(String(link))) {
    fields.push(`Official Link:\n${normalizeUrl(String(link))}`);
  }

  Object.entries(record).forEach(([key, value]) => {
    if (["title", "name", "platform", "event", "description", "summary", "content", "link", "url", "source", "officialLink"].includes(key)) {
      return;
    }

    if (value === null || value === undefined || typeof value === "object") {
      return;
    }

    fields.push(`${key.replace(/([A-Z])/g, " $1").replace(/^./, (char) => char.toUpperCase())}: ${value}`);
  });

  return fields.join("\n\n");
}

function formatStructuredData(value) {
  if (Array.isArray(value)) {
    return value
      .map((item, index) => {
        if (typeof item === "object") {
          return formatObject(item);
        }
        return `${index + 1}. ${String(item)}`;
      })
      .filter(Boolean)
      .join("\n\n--------------------------------\n\n");
  }

  if (value && typeof value === "object") {
    return formatObject(value);
  }

  return typeof value === "string" ? value : String(value ?? "");
}

function convertJsonBlocks(text) {
  let output = text.replace(CODE_FENCE_PATTERN, (_, inner) => inner.trim());

  const parsed = tryParseJson(output);
  if (parsed) {
    return formatStructuredData(parsed);
  }

  output = output.replace(/(^|\n)\s*(\[[\s\S]*?\]|\{[\s\S]*?\})\s*($|\n)/g, (match) => {
    const parsedBlock = tryParseJson(match);
    return parsedBlock ? `\n${formatStructuredData(parsedBlock)}\n` : match;
  });

  return output;
}

function cleanupAssistantResponse(response) {
  const initial = formatStructuredData(response);

  return convertJsonBlocks(initial)
    .replace(/\\"/g, '"')
    .replace(/\\n/g, "\n")
    .replace(/^\s*["']|["']\s*$/g, "")
    .split("\n")
    .map((line) => line.trimEnd())
    .filter((line) => !TECHNICAL_LINES_PATTERN.test(line.trim()))
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export { cleanupAssistantResponse, formatStructuredData };

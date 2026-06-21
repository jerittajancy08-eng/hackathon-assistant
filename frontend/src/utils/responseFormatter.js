const codeFencePattern = /```(?:json|javascript|js|text|markdown)?\s*([\s\S]*?)```/gi;

const technicalLinePattern =
  /^(?:\[?Context\s+\d+\]?|Chunk\s*ID|Embedding|Vector|Score|Metadata|Source object|filePath|provider|updatedAt|documents:|id:).*/i;

const titleKeys = ['title', 'name', 'platform', 'event', 'organization', 'university', 'tool', 'framework'];
const descriptionKeys = ['description', 'summary', 'content', 'details', 'about'];
const linkKeys = ['link', 'url', 'href', 'website', 'officialLink', 'officialWebsite', 'source'];
const ignoredKeys = new Set([...titleKeys, ...descriptionKeys, ...linkKeys]);

function parseJson(value) {
  if (typeof value !== 'string') return value;

  try {
    return JSON.parse(value.trim());
  } catch {
    return null;
  }
}

function parseJsonLikeString(value) {
  if (typeof value !== 'string') return null;

  const trimmed = value.trim();
  if (!/^[\[{]/.test(trimmed)) return null;

  return parseJson(trimmed);
}

function stripMarkdownLink(value) {
  const text = String(value ?? '').trim();
  const markdownMatch = text.match(/^\[([^\]]+)\]\((https?:\/\/[^)]+)\)$/i);
  return markdownMatch ? markdownMatch[2].trim() : text;
}

function extractUrl(value) {
  const text = stripMarkdownLink(value);
  const match = text.match(/https?:\/\/[^\s)]+/i);
  return match ? match[0].replace(/[),.]+$/g, '') : '';
}

function findFirst(record, keys) {
  const key = keys.find((item) => record[item] !== undefined && record[item] !== null && record[item] !== '');
  return key ? record[key] : '';
}

function humanizeKey(key) {
  return String(key)
    .replace(/[_-]+/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/^./, (char) => char.toUpperCase());
}

function formatScalar(value) {
  if (value === undefined || value === null) return '';
  if (typeof value === 'string') return value.trim();
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  return '';
}

function formatObject(record) {
  if (!record || typeof record !== 'object' || Array.isArray(record)) return '';

  const title = formatScalar(findFirst(record, titleKeys));
  const description = findFirst(record, descriptionKeys);
  const link = findFirst(record, linkKeys);
  const cleanLink = extractUrl(link);
  const lines = [];

  if (title) {
    lines.push(`🔗 ${title}`);
  }

  const formattedDescription = formatStructuredData(description);
  if (formattedDescription && formattedDescription !== title) {
    lines.push(formattedDescription.replace(/[.。]?$/, '.'));
  }

  if (cleanLink) {
    lines.push(`[${cleanLink}](${cleanLink})`);
  }

  Object.entries(record).forEach(([key, value]) => {
    if (ignoredKeys.has(key) || value === undefined || value === null || value === '') return;

    const formattedValue = formatStructuredData(value);
    if (formattedValue) {
      lines.push(`${humanizeKey(key)}:\n${formattedValue}`);
    }
  });

  return lines.join('\n\n');
}

function formatArray(items) {
  const hasObjects = items.some((item) => item && typeof item === 'object');
  const formattedItems = items
    .map((item, index) => {
      if (item && typeof item === 'object') {
        return formatObject(item);
      }

      const text = formatStructuredData(item);
      return text ? `${index + 1}. ${text}` : '';
    })
    .filter(Boolean)
    .join('\n\n');

  if (!formattedItems) return '';
  return hasObjects ? `Resources:\n\n${formattedItems}` : formattedItems;
}

function formatStructuredData(value) {
  const parsedString = parseJsonLikeString(value);
  if (parsedString) {
    return formatStructuredData(parsedString);
  }

  if (Array.isArray(value)) {
    return formatArray(value);
  }

  if (value && typeof value === 'object') {
    return formatObject(value);
  }

  return formatScalar(value);
}

function removeRawJsonSyntax(text) {
  return text
    .replace(/^\s*[\[{]\s*$/gm, '')
    .replace(/^\s*[\]}],?\s*$/gm, '')
    .replace(/^\s*"?(title|name|description|summary|content|link|url|officialLink|officialWebsite)"?\s*:\s*/gim, '')
    .replace(/^\s*,\s*$/gm, '')
    .replace(/,$/gm, '');
}

export function cleanupResponse(response) {
  const initial = formatStructuredData(response);
  let output = initial.replace(codeFencePattern, (_, inner) => inner.trim());
  const parsed = parseJson(output);

  if (parsed) {
    output = formatStructuredData(parsed);
  }

  return removeRawJsonSyntax(output)
    .replace(/\\"/g, '"')
    .replace(/\\n/g, '\n')
    .replace(/^\s*["']|["']\s*$/g, '')
    .split('\n')
    .map((line) => line.trimEnd())
    .filter((line) => !technicalLinePattern.test(line.trim()))
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

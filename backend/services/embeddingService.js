import crypto from "crypto";

const VECTOR_SIZE = 384;

function tokenize(text = "") {
  return text
    .toLowerCase()
    .replace(/https?:\/\/\S+/g, " ")
    .replace(/[^a-z0-9+#.\s-]/g, " ")
    .split(/\s+/)
    .filter((token) => token.length > 1);
}

function hashToken(token) {
  const digest = crypto.createHash("sha256").update(token).digest();
  return digest.readUInt32BE(0);
}

function normalize(vector) {
  const magnitude = Math.sqrt(vector.reduce((sum, value) => sum + value * value, 0));
  if (!magnitude) {
    return vector;
  }
  return vector.map((value) => value / magnitude);
}

function embedText(text = "") {
  const vector = Array(VECTOR_SIZE).fill(0);
  const tokens = tokenize(text);

  tokens.forEach((token) => {
    const hash = hashToken(token);
    const index = hash % VECTOR_SIZE;
    const direction = hash % 2 === 0 ? 1 : -1;
    vector[index] += direction;
  });

  return normalize(vector);
}

function cosineSimilarity(left = [], right = []) {
  const length = Math.min(left.length, right.length);
  let score = 0;

  for (let index = 0; index < length; index += 1) {
    score += left[index] * right[index];
  }

  return score;
}

export { embedText, cosineSimilarity };

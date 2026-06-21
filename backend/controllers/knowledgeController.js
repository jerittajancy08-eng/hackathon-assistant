import { addKnowledgeEntry } from "../services/knowledgeAdminService.js";
import { getVectorStore, indexKnowledgeBase } from "../services/vectorStore.js";

async function addKnowledge(req, res) {
  try {
    const entry = await addKnowledgeEntry(req.body);

    return res.status(201).json({
      message: "Knowledge entry added and indexed.",
      entry,
    });
  } catch (error) {
    return res.status(error.status || 500).json({
      error: error.message || "Unable to add knowledge entry.",
    });
  }
}

async function reindexKnowledge(req, res) {
  try {
    const store = await indexKnowledgeBase();

    return res.status(200).json({
      message: "Knowledge base indexed.",
      documents: store.documents.length,
      updatedAt: store.updatedAt,
    });
  } catch (error) {
    return res.status(500).json({
      error: error.message || "Unable to index knowledge base.",
    });
  }
}

async function getKnowledgeStatus(req, res) {
  try {
    const store = await getVectorStore();

    return res.status(200).json({
      provider: store.provider,
      embedding: store.embedding,
      documents: store.documents.length,
      updatedAt: store.updatedAt,
    });
  } catch (error) {
    return res.status(500).json({
      error: error.message || "Unable to read knowledge status.",
    });
  }
}

export { addKnowledge, getKnowledgeStatus, reindexKnowledge };

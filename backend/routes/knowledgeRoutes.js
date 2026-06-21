import express from "express";
import {
  addKnowledge,
  getKnowledgeStatus,
  reindexKnowledge,
} from "../controllers/knowledgeController.js";

const router = express.Router();

router.get("/status", getKnowledgeStatus);
router.post("/", addKnowledge);
router.post("/reindex", reindexKnowledge);

export default router;

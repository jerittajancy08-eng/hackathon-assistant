import hackathonRoutes from "./routes/hackathonRoutes.js";
import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";

import chatRoutes from "./routes/chatRoutes.js";
import knowledgeRoutes from "./routes/knowledgeRoutes.js";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/chat", chatRoutes);
app.use("/api/hackathons", hackathonRoutes);
app.use("/api/admin/knowledge", knowledgeRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on ${PORT}`);
});

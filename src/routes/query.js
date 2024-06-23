import { createEmbedding } from "../utils/createEmbedding.js";
import express from "express";
import PromptResponse from "../utils/createChat.js";
const router = express.Router();
import db from "../db/MongoDB.js";

router.post("/", async (req, res) => {
  try {
    const { query, user_id, user } = req.body;

    // Function to measure and log time for asynchronous operations
    async function measureTime(label, asyncFn) {
      console.time(label);
      const result = await asyncFn();
      console.timeEnd(label);
      return result;
    }

    let similarDocuments = [];
    let embedding = null;

    if (user) {
      embedding = await measureTime("embedding", () => createEmbedding(query));
      similarDocuments = await measureTime("findSimilarDocuments", () => findSimilarDocuments(embedding));
    } else if (user_id) {
      similarDocuments = await measureTime("findSimilarDocs", () => findSimilarDocs(user_id));
    }

    let prompt = "";
    if (similarDocuments.length > 0) {
      prompt = similarDocuments.map((doc, index) => `User ${index + 1}: ${doc.description}`).join("\n\n");
    }
    prompt = prompt ? `Based on this context:\n${prompt}\n\nQuery: ${query}\n\nAnswer:` : query;

    const answer = await measureTime("PromptResponse", () => PromptResponse(prompt));

    res.send(answer);
  } catch (err) {
    res.status(500).json({
      error: "Internal server error",
      message: err.message,
    });
  }
});

async function findSimilarDocuments(embedding) {
  try {
    const collectionName = "uploadeddocuments";
    const collection = db.collection(collectionName);
    const documents = await collection
      .aggregate([
        {
          $search: {
            knnBeta: {
              vector: embedding,
              path: "embedding",
              k: 2,
            },
          },
        },
        {
          $project: {
            description: 1,
            score: { $meta: "searchScore" },
          },
        },
      ])
      .toArray();
    return documents;
  } catch (err) {
    console.error(err, "i am here");
  }
}

async function findSimilarDocs(user_id) {
  try {
    const collectionName = "uploadeddocuments";
    const collection = db.collection(collectionName);
    const documents = await collection
      .aggregate([
        {
          $match: {
            user_id: user_id,
          },
        },
        {
          $project: {
            description: 1,
            score: { $meta: "searchScore" },
          },
        },
      ])
      .toArray();
    return documents;
  } catch (err) {
    console.error(err, "i am here");
  }
}

export default router;

import { createEmbedding } from "../utils/createEmbedding.js";
import express from "express";
import PromptResponse from "../utils/createChat.js";
const router = express.Router();
import db from "../db/MongoDB.js";

router.post("/", async (req, res) => {
  try {
    const { query, user_id, user } = req.body;

    // console.log(embedding);
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
    let similarDocuments = [];

    if (user) {
      const embedding = await createEmbedding(query);
      similarDocuments = await findSimilarDocuments(embedding);
    } else if (user_id) {
      similarDocuments = await findSimilarDocs(user_id);
    }
    // const similarDocuments = user
    //   ? await findSimilarDocuments(embedding)
    //   : user_id
    //   ? await findSimilarDocs(user_id)
    //   : [];
    // gets the document with the highest score

    // const highestScoreDoc =
    //   similarDocuments.length > 0
    //     ? similarDocuments.reduce((highest, current) => {
    //         return highest.score > current.score ? highest : current;
    //       })
    //     : { description: "search internet to answer the query" };

    let prompt = "";
    if (similarDocuments.length > 0) {
      prompt = similarDocuments.map((doc, index) => `User ${index + 1}: ${doc.description}`).join("\n\n");
    } else {
      prompt = "Search the internet to answer the query.";
    }
    if (Array.isArray(prompt)) {
      prompt = prompt.join("\n\n");
    }
    prompt = `Based on this context:\n${prompt}\n\nQuery: ${query}\n\nAnswer:`;
    console.log("check prompt", prompt);
    const answer = await PromptResponse(prompt);
    res.send(answer);
  } catch (err) {
    res.status(500).json({
      error: "Internal server error",
      message: err.message,
    });
  }
});

export default router;

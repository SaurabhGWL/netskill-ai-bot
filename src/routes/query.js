import { createEmbedding } from "../utils/createEmbedding.js";
import express from "express";
import PromptResponse from "../utils/createChat.js";
const router = express.Router();
import db from "../db/MongoDB.js";

router.post("/", async (req, res) => {
  try {
    const { query, user_id, user } = req.body;

    // console.log(query);
    const embedding = await createEmbedding(query);
    // console.log(embedding);
    async function findSimilarDocuments(embedding) {
      try {
        const collectionName = "uploadeddocuments";
        const collection = db.collection(collectionName);
        const documents = user?
        await collection
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
          .toArray()
          :
        user_id ? 
        await collection
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
        .toArray()
        :
        []
        ;
        return documents;
      } catch (err) {
        console.error(err,'i am here');
      }
    }

    const similarDocuments = await findSimilarDocuments(embedding);

    // gets the document with the highest score

    const highestScoreDoc = similarDocuments.length>0?similarDocuments.reduce((highest, current) => {
      return highest.score > current.score ? highest : current;
    }):{description:"search internet to answer the query"};


    const prompt = `Based on this context: ${highestScoreDoc.description} \n\n Query: ${query} \n\n Answer:`;
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

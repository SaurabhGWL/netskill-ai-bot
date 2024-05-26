import express from "express";

import UploadedDocument from "../models/DocumentUpload.js";
import { createEmbedding } from "../utils/createEmbedding.js";

const router = express.Router();

router.post("/", async (req, res) => {
  const { text, user_id } = req.body;
  try {
    const embedding = await createEmbedding(text);
    const newDoc = new UploadedDocument({
      description: text,
      embedding: embedding,
      user_id:user_id
    });

    const savedDoc = await newDoc.save();
    res.status(201).json({
      message: "Document uploaded successfully",
      document: savedDoc,
    });
  } catch (err) {
    console.log("err: ", err);
    res.status(500).json({
      error: "Internal server error",
      message: err.message,
    });
  }
});

export default router;

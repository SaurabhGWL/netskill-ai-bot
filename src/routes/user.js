import express from "express";
import UploadedDocument from "../models/DocumentUpload.js";

const router = express.Router();


router.get("/:user_id", async (req, res) => {
  const { user_id } = req.params;
  try {
    const documents = await UploadedDocument.find({ user_id: user_id });
    if (documents.length === 0) {
      return res.status(404).json({
        message: "No documents found for this user",
      });
    }
    res.status(200).json(documents);
  } catch (err) {
    console.log("err: ", err);
    res.status(500).json({
      error: "Internal server error",
      message: err.message,
    });
  }
});

export default router;

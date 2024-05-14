import express from "express";
import multer from 'multer';
import UploadedDocument from "../models/DocumentUpload.js";
import { createEmbedding } from "../utils/createEmbedding.js";
import { PdfReader } from "pdfreader";


const upload = multer();
const router = express.Router();

router.post("/", upload.single('pdf'), async (req, res) => {
    console.log('check req', req.file);
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No file was uploaded.' });
      }
  
      const pdfFile = req.file;
      console.log('check pdf file', pdfFile);
      const text = await processPDFStream(pdfFile.buffer);
      const embedding = await createEmbedding(text);
      const newDoc = new UploadedDocument({
        description: text,
        embedding: embedding,
      });
  
      const savedDoc = await newDoc.save();
      res.status(201).json({
        message: "Document uploaded successfully",
        document: savedDoc,
      });
    } catch (err) {
      console.error("Error:", err);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  
  async function processPDFStream(pdfBuffer) {
    return new Promise((resolve, reject) => {
      const textChunks = [];
  
      new PdfReader().parseBuffer(pdfBuffer, (err, item) => {
        if (item?.text) {
          textChunks.push(item.text);
        } else if (err) {
          console.log("Error Parsing!");
          reject(err);
        } else if (!item) resolve(textChunks.join(""));
      });
    });
  }

export default router;

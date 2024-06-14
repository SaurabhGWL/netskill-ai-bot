import express from "express";
import "dotenv/config";
import mongoose from "mongoose";
import cors from "cors"; 
import knowledgeUpdateRoutes from "./src/routes/knowledge.js";
import queryRoutes from "./src/routes/query.js";
import pdfUploadRoutes from "./src/routes/upload.js";
import usersRoutes from "./src/routes/user.js";
import db from "./src/db/MongoDB.js";

db.on("error", console.error.bind(console, "MongoDB connection error:"));
db.once("open", () => {
  console.log("Connected to MongoDB...");
});

const app = express();
app.use(cors());
app.use(express.json());
app.use("/upload", pdfUploadRoutes);
app.use("/update-knowledge", knowledgeUpdateRoutes);
app.use("/query", queryRoutes);
app.use("/get-users", usersRoutes);
app.get("/", (req,res)=>{
  res.status(200).json({
    message: "Api working!!!",
  });
});

const PORT = process.env.PORT || 7000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}...`);
});

import OpenAI from "openai";

import "dotenv/config";
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export const createEmbedding = async (text) => {
  const embeddingResponse = await openai.embeddings.create({
    // model: "text-embedding-3-small",
    model: "text-embedding-ada-002",
    input: text,
    encoding_format: "float",
  });
  const [{ embedding }] = embeddingResponse?.data;
  // console.log(embedding);

  return embedding;
};

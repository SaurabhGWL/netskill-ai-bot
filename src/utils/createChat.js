import OpenAI from "openai";

import "dotenv/config";
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

async function PromptResponse(prompt) {
  const response = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    stream: false,
    temperature: 0.5,
    max_tokens: 250,
    messages: [
      {
        role: "system",
        content: "You are a helpful assistant.",
      },
      {
        role: "user",
        content: prompt,
      },
    ],
  });
  // const response = await openai.chat.completions.create({
  //   messages: [
  //     {
  //       role: "system",
  //       content: "You are a helpful assistant",
  //     },
  //     { role: "user", content: prompt },
  //   ],
  //   model: 'gpt-4o',
  // })

  return response?.choices[0]
  // return response?.choices[0];
}

export default PromptResponse;

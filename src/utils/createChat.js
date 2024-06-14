import OpenAI from "openai";

import "dotenv/config";
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

async function PromptResponse(prompt) {
  // const response = await openai.chat.completions.create({
  //   model: "gpt-3.5-turbo",
  //   stream: false,
  //   temperature: 0.5,
  //   messages: [
  //     {
  //       role: "system",
  //       content: "You are a helpful assistant.",
  //     },
  //     {
  //       role: "user",
  //       content: prompt,
  //     },
  //   ],
  // });
  const response = await openai.chat.completions.create({
    messages: [
      {
        role: "system",
        content: "You are a helpful assistant designed to output JSON.",
      },
      { role: "user", content: prompt },
    ],
    model: 'gpt-4o',
    response_format: { type: "json_object" }
  })

  return response?.choices[0].message.content
  // return response?.choices[0];
}

export default PromptResponse;

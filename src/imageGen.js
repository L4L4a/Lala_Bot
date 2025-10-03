import OpenAI from "openai";
import dotenv from "dotenv";
dotenv.config();

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function generateImage(prompt) {
  try {
    const result = await openai.images.generate({
      model: "gpt-image-1",
      prompt: prompt,
      size: "1024x1024"
    });

    return result.data[0].url;
  } catch (err) {
    console.error(err);
    return "Failed to generate image.";
  }
}

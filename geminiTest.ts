import 'dotenv/config';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

async function testGemini() {
  try {
    const model = genAI.getGenerativeModel({ model: "models/gemini-1.5-pro" }); // ✅ CORRECT model name
    const result = await model.generateContent("Hello Gemini, how are you?");
    const response = await result.response;
    console.log("Gemini Response:", response.text());
  } catch (error) {
    console.error("Gemini test failed:", error);
  }
}

testGemini();

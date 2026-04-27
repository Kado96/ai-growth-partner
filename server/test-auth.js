require('dotenv').config({ path: './.env.production' });
const { GoogleGenerativeAI } = require("@google/generative-ai");

async function run() {
  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    // There is no direct listModels in the main SDK class, but we can try to hit the root
    console.log("Key:", process.env.GEMINI_API_KEY.substring(0, 5) + "...");
    
    // Provoking an error to see the details or trying a very old model
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent("Hi");
    console.log("Success:", result.response.text());
  } catch (e) {
    console.error("Error Detail:", e);
  }
}

run();

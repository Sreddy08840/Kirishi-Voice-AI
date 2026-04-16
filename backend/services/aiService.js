const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "dummy_key");

async function generateEmbedding(text) {
  try {
    // Using the official embedding model dynamically available to the user's specific Key scope
    const finalModel = genAI.getGenerativeModel({ model: "gemini-embedding-001" });
    const result = await finalModel.embedContent(text);
    
    // Slice down strictly to 1536 dimensions requested previously for the Qdrant DB collection mapping constraint
    return result.embedding.values.slice(0, 1536);
  } catch (error) {
    console.error("Error generating embedding:", error);
    // Return dummy embedding or throw depending on need
    throw error;
  }
}

async function generateFarmingAdvice(query, contextData = []) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" }); // Using new lightweight tier to prevent 503 errors with user's key
    
    // Construct the context string from Qdrant search results
    const contextText = contextData.map(item => item.payload?.text || "").join('\n');
    
    const prompt = `
You are "Krishi Voice AI", an expert agricultural assistant.
Based on the provided context, answer the farmer's question.

Rules for your answer:
- Determine if the user is asking in English, Kannada, or Hindi, and respond in that exact language.
- Provide short, clear, and farmer-friendly answers.
- Use simple terms that are easy to speak out loud over a voice call.

Context:
${contextText}

Question:
${query}
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("Error generating AI response:", error);
    return "Maaf kijiye, mujhe abhi samajh nahi aaya. Kripaya baad mein try karein.";
  }
}

module.exports = {
  generateEmbedding,
  generateFarmingAdvice
};

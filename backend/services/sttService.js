const fs = require('fs');
const OpenAI = require('openai');

let openai = null;

function getOpenAIClient() {
  if (!openai) {
    if (!process.env.GROQ_API_KEY) {
      throw new Error("GROQ_API_KEY is missing from environment variables. Please add it to your .env file.");
    }
    openai = new OpenAI({
      apiKey: process.env.GROQ_API_KEY,
      baseURL: "https://api.groq.com/openai/v1",
    });
  }
  return openai;
}

/**
 * Converts audio file to text using Groq's Whisper API
 * @param {string} audioFilePath - The path to the local audio file
 * @returns {Promise<string>} The transcribed text
 */
async function transcribeAudio(audioFilePath) {
  try {
    const transcription = await getOpenAIClient().audio.transcriptions.create({
      file: fs.createReadStream(audioFilePath),
      model: "whisper-large-v3-turbo",
      language: "hi", // Assuming Hindi as the primary language
    });
    
    return transcription.text;
  } catch (error) {
    console.error("Error transcribing audio:", error);
    throw error;
  }
}

module.exports = {
  transcribeAudio
};

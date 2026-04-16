require('dotenv').config({ path: '../.env' }); // Make sure it reads from the backend root if run internally
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const VAPI_URL = 'https://api.vapi.ai/assistant';

/**
 * Run this script to programmatically create your Vapi.ai Assistant.
 */
async function configureKrishiAssistant() {
    const vapiKey = process.env.VAPI_API_KEY;

    if (!vapiKey || vapiKey.includes('your_vapi_api_key')) {
        console.log("⚠️ Please add your actual VAPI_API_KEY in the .env file before running this script.");
        return;
    }

    const config = {
        name: "Krishi Voice AI",
        // 1. Language & STT (Speech-To-Text) set up for Hindi
        transcriber: {
            provider: "deepgram",
            model: "nova-2",
            language: "hi" // Hindi transcription specifically requested
        },
        // 2. Clear Voice Output TTS (Text-To-Speech)
        voice: {
            provider: "azure",
            voiceId: "hi-IN-SwaraNeural" // High-quality, clear Hindi female voice
        },
        // 3. Connect Webhook to Backend for Real-Time Streaming & Logic
        model: {
            provider: "custom-llm",
            model: "krishi-ai-backend", // Required by Vapi's validator even for custom webhooks
            url: "https://krishi-voice.ngrok.app/vapi/webhook" // Replace with YOUR actual Ngrok HTTPS URL
        },
        // Greeting phrase to start the phone call
        firstMessage: "नमस्ते! मैं कृषि वॉइस एआई हूँ। आज मैं आपकी खेती में कैसे मदद कर सकता हूँ?", // "Hello! I am Krishi Voice AI. How can I help you with farming today?"
        
        // Ensure seamless phone call streaming constraints
        recordingEnabled: true,
        endCallPhrases: ["अलविदा", "धन्यवाद", "bye", "रखता हूँ"],
        clientMessages: ["transcript", "hang", "function-call", "speech-update"],
        serverMessages: ["end-of-call-report", "hang", "function-call"]
    };

    try {
        console.log("Configuring the Vapi Assistant via API...");
        
        const response = await fetch(VAPI_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${vapiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(config)
        });

        const data = await response.json();

        if (response.ok) {
            console.log("\n✅ Krishi Voice AI Assistant setup successfully!");
            console.log("-> Assistant ID:", data.id);
            console.log("\n📱 Phone Call Setup:");
            console.log("Log into the Vapi Dashboard, go to 'Phone Numbers', buy/import a number, and attach it to this Assistant ID.");
        } else {
            console.error("❌ Failed to configure assistant:", data);
        }

    } catch (error) {
        console.error("❌ Error running Vapi configuration:", error.message);
    }
}

if (require.main === module) {
    configureKrishiAssistant();
}

module.exports = configureKrishiAssistant;

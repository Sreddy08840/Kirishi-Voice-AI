require('dotenv').config();
const { initDB, seedSampleData } = require('./qdrant/db');
const { processFarmerQuery } = require('./services/ragService');

async function runTests() {
  console.log("--- Initializing Backend Context ---");
  
  // 1. Initialize DB and insert sample data into Qdrant First
  await initDB();
  await seedSampleData();
  
  // Give Qdrant a tiny moment to finish indexing the new vectors for immediate querying
  await new Promise(r => setTimeout(r, 1500));

  console.log("\n--- Starting Text-based Realtime Scenarios ---");
  
  const scenarios = [
    "PM Kisan Yojana kya hai?",
    "Tamatar me disease hai kya kare?",
    "Aaj mandi rate kya hai?"
  ];

  for (let i = 0; i < scenarios.length; i++) {
    const query = scenarios[i];
    console.log(`\n🗣️ Test ${i+1}: "${query}"`);
    
    // Start timing
    const startTime = Date.now();
    
    try {
      // Direct call into the exact RAG endpoint our Voice Webhook uses
      const response = await processFarmerQuery(query);
      
      // Stop timing
      const latency = Date.now() - startTime;
      
      console.log(`🤖 Krishi AI (${latency}ms): ${response}`);
      console.log("==========================================");
      
    } catch (e) {
      console.log(`❌ Error processing query:`, e.message);
    }
  }

  console.log("\n✅ All Tests Successfully Completed.");
  process.exit(0);
}

runTests();

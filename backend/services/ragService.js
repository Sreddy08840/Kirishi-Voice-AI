const { searchData } = require('../qdrant/db');
const { generateFarmingAdvice } = require('./aiService');

/**
 * Service that orchestrates the full RAG pipeline for the farmer's queries.
 */
async function processFarmerQuery(query) {
  try {
    // Step 1: Receives the user query as the input string 'query'

    // Step 2 & 3: generate embedding and search Qdrant for top 3 results
    // (Note: searchData() internally calls generateEmbedding() and queries Qdrant with limit=3)
    const contextResults = await searchData(query, 3);
    
    // Step 4: Sends query + context to Gemini
    const answer = await generateFarmingAdvice(query, contextResults);

    return answer;
  } catch (error) {
    console.error("Error in AI pipeline processFarmerQuery:", error);
    return "Something went wrong. Please try again.";
  }
}

module.exports = {
  processFarmerQuery
};

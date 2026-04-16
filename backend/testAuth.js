require('dotenv').config();

async function testKey() {
    const key = process.env.GEMINI_API_KEY;
    console.log("Testing Key:", key);
    
    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${key}`);
        const data = await response.json();
        
        if (response.ok) {
            console.log("\n✅ Key is VALID. Available Models:");
            const models = data.models.map(m => m.name);
            console.log(models.filter(m => m.includes('embedding') || m.includes('gemini')));
        } else {
            console.log("\n❌ Key test failed:");
            console.log(data);
        }
    } catch (e) {
        console.error(e);
    }
}

testKey();

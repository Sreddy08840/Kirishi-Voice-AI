const startBtn = document.getElementById('start-btn');
const transcriptDisplay = document.getElementById('transcript-display');
const responseDisplay = document.getElementById('response-display');

// Check for Web Speech API support
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

if (!SpeechRecognition) {
    alert("Web Speech API is not supported in this browser. Please use Chrome or Edge for the browser demo.");
}

const recognition = new SpeechRecognition();
recognition.lang = 'hi-IN'; // Setting explicitly to catch Hindi beautifully
recognition.interimResults = false;
recognition.maxAlternatives = 1;

let isListening = false;

startBtn.addEventListener('click', () => {
    if (isListening) {
        recognition.stop();
        return;
    }
    try {
        recognition.start();
    } catch(e) {
        console.log("Already started recording");
    }
});

recognition.onstart = () => {
    isListening = true;
    startBtn.classList.add('listening');
    startBtn.querySelector('.btn-text').innerText = 'Stop Listening';
    transcriptDisplay.innerText = "Listening to you...";
    responseDisplay.innerText = "...";
};

recognition.onend = () => {
    isListening = false;
    startBtn.classList.remove('listening');
    startBtn.querySelector('.btn-text').innerText = 'Start Talking';
};

recognition.onresult = async (event) => {
    const transcript = event.results[0][0].transcript;
    transcriptDisplay.innerText = transcript;
    
    responseDisplay.innerText = "Thinking...";
    
    try {
        // Send transcribed text to our backend to hit the RAG pipeline!
        const res = await fetch('http://localhost:3000/vapi/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ text: transcript })
        });
        
        const data = await res.json();
        
        if (data.response) {
            responseDisplay.innerText = data.response;
            speakResponseLightly(data.response);
        } else {
            responseDisplay.innerText = "Error: " + JSON.stringify(data);
        }
    } catch (error) {
        responseDisplay.innerText = "Network error connecting to Backend API.";
        console.error(error);
    }
};

recognition.onerror = (event) => {
    transcriptDisplay.innerText = "Error occurred in recognition: " + event.error;
};

// Extremely simple browser TTS fallback
function speakResponseLightly(text) {
    const synth = window.speechSynthesis;
    // Cancel any ongoing speaking
    synth.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'hi-IN'; // Speak it back in Hindi ideally
    utterance.rate = 1.0;
    synth.speak(utterance);
}

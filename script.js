
// =================================
// DAVID AI - MAIN JAVASCRIPT
// =================================

let recognition;
let isListening = false;
let isThinking = false;

// =================================
// VOICE SETTINGS
// =================================

function speak(text) {
  if (!("speechSynthesis" in window)) return;

  window.speechSynthesis.cancel();

  const voices = window.speechSynthesis.getVoices();

  const englishVoice =
    voices.find(v => v.lang === "en-001") ||
    voices.find(v => v.lang === "en-GB") ||
    voices.find(v => v.lang === "en-US") ||
    voices.find(v => v.lang.startsWith("en"));

  const speech = new SpeechSynthesisUtterance(text);

  if (englishVoice) speech.voice = englishVoice;

  speech.lang = "en-001";
  speech.rate = 0.92;
  speech.pitch = 0.85;
  speech.volume = 1;

  window.speechSynthesis.speak(speech);
}

// =================================
// CHAT DISPLAY
// =================================

function addMessage(text, type) {
  const chat = document.getElementById("chat");

  if (!chat) return;

  const message = document.createElement("div");
  message.className = "message " + type;
  message.textContent = text;

  chat.appendChild(message);
  chat.scrollTop = chat.scrollHeight;
}

// =================================
// DATE AND TIME
// =================================

function getCurrentTime() {
  return new Date().toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit"
  });
}

function getCurrentDate() {
  return new Date().toLocaleDateString([], {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric"
  });
}

// =================================
// LOCAL COMMANDS
// =================================

function getResponse(command) {
  const text = command.toLowerCase().trim();

  if (
    text.includes("open google")
  ) {
    window.open("https://www.google.com", "_blank");
    return "Opening Google.";
  }

  if (
    text.includes("open youtube")
  ) {
    window.open("https://www.youtube.com", "_blank");
    return "Opening YouTube.";
  }

  if (text.includes("open calculator")) {
    return "Please open your phone calculator manually.";
  }

  if (text.includes("what time") || text === "time") {
    return "The current time is " + getCurrentTime();
  }

  if (text.includes("what date") || text === "date") {
    return "Today is " + getCurrentDate();
  }

  return null;
}

// =================================
// REAL AI CONNECTION
// =================================

async function askDavidAI(message) {
  const response = await fetch("/.netlify/functions/chat", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      message: message
    })
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.error || "The AI service is unavailable."
    );
  }

  if (!data.reply) {
    throw new Error("DAVID AI returned an empty answer.");
  }

  return data.reply;
}

// =================================
// SEND MESSAGE
// =================================

async function sendMessage() {
  const input = document.getElementById("userInput");
  const status = document.getElementById("status");

  if (!input || isThinking) return;

  const command = input.value.trim();

  if (!command) return;

  addMessage(command, "user");
  input.value = "";

  // Check local phone commands first
  const localResponse = getResponse(command);

  if (localResponse !== null) {
    addMessage(localResponse, "ai");
    speak(localResponse);
    return;
  }

  // Send other questions to the real AI
  isThinking = true;

  if (status) {
    status.textContent = "DAVID AI is thinking...";
  }

  try {
    const reply = await askDavidAI(command);

    addMessage(reply, "ai");
    speak(reply);

  } catch (error) {
    const errorMessage =
      "I couldn't connect to my AI brain. " +
      error.message;

    addMessage(errorMessage, "ai");

  } finally {
    isThinking = false;

    if (status) {
      status.textContent = "System Ready";
    }
  }
}

// =================================
// VOICE RECOGNITION
// =================================

function startListening() {
  const SpeechRecognition =
    window.SpeechRecognition ||
    window.webkitSpeechRecognition;

  if (!SpeechRecognition) {
    const message =
      "Voice recognition is not supported by this browser.";

    addMessage(message, "ai");
    speak(message);
    return;
  }

  if (isListening && recognition) {
    recognition.stop();
    return;
  }

  recognition = new SpeechRecognition();

  recognition.lang = "en-US";
  recognition.continuous = false;
  recognition.interimResults = false;

  recognition.onstart = function() {
    isListening = true;

    const status = document.getElementById("status");

    if (status) status.textContent = "Listening...";
  };

  recognition.onresult = function(event) {
    const spokenText = event.results[0][0].transcript;
    const input = document.getElementById("userInput");

    if (input) {
      input.value = spokenText;
      sendMessage();
    }
  };

  recognition.onerror = function() {
    const status = document.getElementById("status");

    if (status) {
      status.textContent = "Voice error. Try again.";
    }
  };

  recognition.onend = function() {
    isListening = false;

    const status = document.getElementById("status");

    if (status) {
      status.textContent = "System Ready";
    }
  };

  recognition.start();
}

// =================================
// ENTER KEY SUPPORT
// =================================

document.addEventListener("DOMContentLoaded", function() {
  const input = document.getElementById("userInput");

  if (input) {
    input.addEventListener("keydown", function(event) {
      if (event.key === "Enter") {
        sendMessage();
      }
    });
  }

  const status = document.getElementById("status");

  if (status) {
    status.textContent = "System Ready";
  }

  if ("speechSynthesis" in window) {
    window.speechSynthesis.getVoices();
  }
});

// =================================
// AVAILABLE VOICES
// =================================

function showAvailableVoices() {
  if (!("speechSynthesis" in window)) return;

  const voices = speechSynthesis.getVoices();

  console.log("Available DAVID AI voices:");

  voices.forEach((voice, index) => {
    console.log(
      index + ": " + voice.name + " (" + voice.lang + ")"
    );
  });
}

if ("speechSynthesis" in window) {
  speechSynthesis.onvoiceschanged = showAvailableVoices;
  showAvailableVoices();
}

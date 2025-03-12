export const startListening = (setSearchTerm, setCurrentPage, fetchUsers, setIsListening) => {
  if (!("webkitSpeechRecognition" in window) && !("SpeechRecognition" in window)) {
    alert("Speech recognition is not supported in this browser.");
    return;
  }

  setIsListening(true);
  const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
  recognition.continuous = true; // Keep listening
  recognition.interimResults = true; // Enable real-time updates
  recognition.lang = "en-US";

  recognition.onresult = (event) => {
    let transcript = "";
    for (let i = event.resultIndex; i < event.results.length; i++) {
      transcript += event.results[i][0].transcript; // Append spoken words in real-time
    }

    setSearchTerm(transcript); // Update search field live
    setCurrentPage(1);
  };

  recognition.onerror = (event) => {
    console.error("Speech recognition error:", event.error);
    setIsListening(false);
  };

  recognition.onend = () => {
    setIsListening(false);
  };

  recognition.start();
};

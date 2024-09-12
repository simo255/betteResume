import { sendGeminiApiCall, sendMistralApiCall } from './api.js';


chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.html) {
        // Process the entire HTML page here
    }
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'makeAPICall') {
        const apiKey = request.apiKey;
        const resume = request.resume;
        const jobOffer = request.jobOffer;
        const selectedLLM = request.selectedLLM;

        handleTailorResume(apiKey, resume, jobOffer, selectedLLM);
    }
  });

  
  async function handleTailorResume(apiKey, resume, jobOffer, selectedLLM) {
    let tailoredResume = "";

    const response = selectedLLM === "Mistral" 
        ? await sendMistralApiCall(apiKey, resume, jobOffer.description)
        : await sendGeminiApiCall(apiKey, resume.text, jobOffer.description);

    if (!response.status) {
        chrome.runtime.sendMessage({ "api_error": response.message || "Unknown error" });
        return;
    }

    tailoredResume = response.latexCode || "";
    const latexMatch = tailoredResume.match(/```latex([\s\S]*?)```/);
    const latexCode = latexMatch ? latexMatch[1].trim() : "";

    if (latexCode) {
        chrome.storage.local.set({ "tailoredResume": { text: latexCode, url: jobOffer.url } });
        chrome.runtime.sendMessage({ "tailoredResume": latexCode });
    }
}

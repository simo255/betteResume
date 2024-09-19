import { sendGeminiApiCall, sendMistralApiCall, generateCoverLetterMistral } from './helper/api.js';
import { saveData } from './helper/resume-helper.js';
import { AppStatus } from './helper/constants.js';

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.html) {

    }
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "tailor") {
        handleTailorResume(request.jobOffer, request.selectedLLM);
    } 
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "coverLetter") {
        handleCoverLetter(request.jobOffer, request.selectedLLM);
    } 
});

async function handleCoverLetter(jobOffer) {

    chrome.storage.local.set({ currentAppStatus: AppStatus.COVER_LETTER_API_CALL });
    const response = selectedLLM === "Mistral"
        ? await generateCoverLetterMistral(jobOffer.description)
        : console.log("Gemini API not implemented yet");

    if (!response.status) {
        chrome.runtime.sendMessage({ "api_error": response.message || AppStatus.ERROR_COVER_LETTER });
        chrome.storage.local.set({ currentAppStatus: AppStatus.ERROR_COVER_LETTER });
        return;
    }

    const coverLetter = response.coverLetter || "";

    if (!coverLetter) {
        chrome.storage.local.set({ currentAppStatus: AppStatus.ERROR_COVER_LETTER });
        return;
    }

    saveUserResume("", coverLetter);
    chrome.action.setBadgeText({ text: 'Rdy' });
    chrome.runtime.sendMessage({ "coverLetterDone": coverLetter });
    chrome.storage.local.set({ currentAppStatus: AppStatus.TAILORED_COVER_LETTER });
}


async function handleTailorResume(jobOffer, selectedLLM) {
    let tailoredResume = "";

    chrome.storage.local.set({ currentAppStatus: AppStatus.RESUME_API_CALL });
    const response = selectedLLM === "Mistral"
        ? await sendMistralApiCall(jobOffer)
        : await sendGeminiApiCall(jobOffer);

    if (!response.status) {
        chrome.runtime.sendMessage({ "api_error": response.message || AppStatus.ERROR_RESUME });
        chrome.storage.local.set({ currentAppStatus: AppStatus.ERROR_RESUME });
        return;
    }

    tailoredResume = response.latexCode || "";
    const latexMatch = tailoredResume.match(/```latex([\s\S]*?)```/);
    const latexCode = latexMatch ? latexMatch[1].trim() : "";

    if (!latexCode) {
        chrome.storage.local.set({ currentAppStatus: AppStatus.ERROR_RESUME });
        return;
    }

    saveData(latexCode, "");
    chrome.action.setBadgeText({ text: 'Rdy' });
    chrome.runtime.sendMessage({ "tailoredResume": latexCode });
    chrome.storage.local.set({ currentAppStatus: AppStatus.TAILORED_RESUME });
}


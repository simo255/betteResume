import { sendGeminiApiCall, sendMistralApiCall } from './helper/api.js';
import { saveResumeList } from './helper/resume-helper.js';
import { AppStatus } from './helper/constants.js';


chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
    if (message.action === "saveAppState") {
        const url = message.url;

        chrome.storage.local.get([url], (result) => {
            if (result[url]) {
                chrome.storage.local.set({ currentAppStatus: AppStatus.SAVED_JOB_OFFER });
                console.log("Saved job offer detected!");
            } else {
                chrome.storage.local.set({ currentAppStatus: AppStatus.NEW_JOB_OFFER });
                console.log("New job offer detected!");
            }
        });
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
    chrome.storage.local.set({ currentAppStatus: AppStatus.API_CALL });
    const response = selectedLLM === "Mistral"
        ? await sendMistralApiCall(apiKey, resume, jobOffer.description)
        : await sendGeminiApiCall(apiKey, resume.text, jobOffer.description);

    if (!response.status) {
        chrome.runtime.sendMessage({ "api_error": response.message || AppStatus.ERROR });
        return;
    }

    tailoredResume = response.latexCode || "";
    const latexMatch = tailoredResume.match(/```latex([\s\S]*?)```/);
    const latexCode = latexMatch ? latexMatch[1].trim() : "";

    if (latexCode) {

        saveResumeList(jobOffer.url, latexCode);
        chrome.action.setBadgeText({ text: 'Rdy' });
        chrome.runtime.sendMessage({ "tailoredResume": latexCode });
        chrome.storage.local.set({ currentAppStatus: AppStatus.TAILORED_RESUME });
    }
}


async function returnIfUrlSaved(url) {
    return new Promise((resolve) => {
        chrome.storage.local.get([url], (result) => {
            resolve(result.url);
        });
    });
}
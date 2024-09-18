import { sendGeminiApiCall, sendMistralApiCall } from './helper/api.js';
import { saveResumeList } from './helper/resume-helper.js';
import { AppStatus } from './helper/constants.js';


chrome.tabs.onActivated.addListener(getCurrentTabInfo)

async function getCurrentTabInfo() {
    chrome.storage.local.get("currentAppStatus", async (result) => {
        if (result.currentAppStatus !== AppStatus.API_CALL) {
            const tabInfo = await chrome.tabs.query({ active: true, lastFocusedWindow: true })
            const url = tabInfo[0].url
            saveNewAppState(url)
        }
    });

}


chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
    if (message.action === "saveAppState") {
        const url = message.url ? message.url : sender.tab.url;
        saveNewAppState(url);
    }
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    const apiKey = request.apiKey;
    const resume = request.resume;
    const jobOffer = request.jobOffer;
    const selectedLLM = request.selectedLLM;

    if (request.action === 'tailor') {
        handleTailorResume(apiKey, resume, jobOffer, selectedLLM);
    } else if (request.action === 'coverLetter') {

    }
});

async function handleTailorCoverLetter(apiKey, coverLetter, jobOffer, selectedLLM) {
    let tailoredCoverLetter = "";
    chrome.storage.local.set({ currentAppStatus: AppStatus.API_CALL });
    const response = selectedLLM === "Mistral"
        ? await sendMistralApiCall(apiKey, coverLetter, jobOffer.description)
        : await sendGeminiApiCall(apiKey, coverLetter.text, jobOffer.description);

    if (!response.status) {
        chrome.runtime.sendMessage({ "api_error": response.message || AppStatus.ERROR });
        chrome.storage.local.set({ currentAppStatus: AppStatus.ERROR });
        return;
    }

    tailoredCoverLetter = response.latexCode || "";
    const latexMatch = tailoredCoverLetter.match(/```latex([\s\S]*?)```/);
    const latexCode = latexMatch ? latexMatch[1].trim() : "";

    if (!latexCode) {
        chrome.storage.local.set({ currentAppStatus: AppStatus.ERROR });
        return;
    }

    saveResumeList(jobOffer.url, latexCode);
    chrome.action.setBadgeText({ text: 'Rdy' });
    chrome.runtime.sendMessage({ "tailoredResume": latexCode });
    chrome.storage.local.set({ currentAppStatus: AppStatus.TAILORED_RESUME });
}


async function handleTailorResume(apiKey, resume, jobOffer, selectedLLM) {
    let tailoredResume = "";
    chrome.storage.local.set({ currentAppStatus: AppStatus.API_CALL });
    const response = selectedLLM === "Mistral"
        ? await sendMistralApiCall(apiKey, resume, jobOffer.description)
        : await sendGeminiApiCall(apiKey, resume.text, jobOffer.description);

    if (!response.status) {
        chrome.runtime.sendMessage({ "api_error": response.message || AppStatus.ERROR });
        chrome.storage.local.set({ currentAppStatus: AppStatus.ERROR });
        return;
    }

    tailoredResume = response.latexCode || "";
    const latexMatch = tailoredResume.match(/```latex([\s\S]*?)```/);
    const latexCode = latexMatch ? latexMatch[1].trim() : "";

    if (!latexCode) {
        chrome.storage.local.set({ currentAppStatus: AppStatus.ERROR });
        return;
    }

    saveResumeList(jobOffer.url, latexCode);
    chrome.action.setBadgeText({ text: 'Rdy' });
    chrome.runtime.sendMessage({ "tailoredResume": latexCode });
    chrome.storage.local.set({ currentAppStatus: AppStatus.TAILORED_RESUME });
}

function saveNewAppState(url) {
    chrome.storage.local.get([url], (result) => {
        const appStatus = result[url] ? AppStatus.SAVED_JOB_OFFER : AppStatus.NEW_JOB_OFFER;
        chrome.storage.local.set({ currentAppStatus: appStatus });
    });
}

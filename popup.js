import { getApiKey, saveApiKey } from './key_management/api_key_management.js';
import { getUserResume, saveUserResume, getData } from './helper/resume-helper.js';
import { AppStatus } from './helper/constants.js';


let jobDescription = "";

const apiKeyInput = document.getElementById("apiKey");
const resumeInput = document.getElementById("latexResume");

const editApiKeyButton = document.getElementById("editApiKey");
const saveApiKeyButton = document.getElementById("saveApiKey");
const editResumeButton = document.getElementById("editResume");
const saveResumeButton = document.getElementById("saveResume");
const statusMessage = document.getElementById('status');

const tailorResumeButton = document.getElementById("tailorResume");

const coverLetterButton = document.getElementById("coverLetter");

const settingIcon = document.getElementById("settings");

document.addEventListener('DOMContentLoaded', async () => {
    getPageData();

    chrome.action.setBadgeText({ text: '' });

    const resume = await getUserResume();
    const apiKey = await getApiKey(document.getElementById('apiSelection').value); // Get the API key for the selected LLM

    const apiContainer = document.getElementById('apiKeyContainer');
    const resumeContainer = document.getElementById('resumeContainer');


    settingIcon.addEventListener('click', () => {
        const isHidden = apiContainer.classList.contains("hidden") || resumeContainer.classList.contains("hidden");
        toggleSettings(!isHidden, resume, apiKey);
    });


    editApiKeyButton.addEventListener("click", async () => {
        apiKeyInput.classList.remove("hidden");
        apiKeyInput.value = await getApiKey(document.getElementById('apiSelection').value);
        saveApiKeyButton.classList.remove("hidden");
        editApiKeyButton.classList.add("hidden");
    });

    saveApiKeyButton.addEventListener("click", () => {
        const newApiKey = apiKeyInput.value;
        if (newApiKey) {
            saveApiKey(document.getElementById('apiSelection').value, newApiKey);
            apiKeyInput.classList.add("hidden");
            saveApiKeyButton.classList.add("hidden");
            editApiKeyButton.classList.remove("hidden");
            statusMessage.innerText = "API Key saved successfully!";

        }
    });

    editResumeButton.addEventListener("click", async () => {
        resumeInput.classList.remove("hidden");
        resumeInput.value = await getUserResume();
        saveResumeButton.classList.remove("hidden");
        editResumeButton.classList.add("hidden");
    });

    saveResumeButton.addEventListener("click", async () => {
        const newResume = resumeInput.value;
        if (newResume) {
            saveUserResume(newResume);
            resumeInput.classList.add("hidden");
            saveResumeButton.classList.add("hidden");
            editResumeButton.classList.remove("hidden");
            statusMessage.innerText = "Resume saved successfully!";
        }
    });


    tailorResumeButton.addEventListener('click', async () => {
        sendLLMRequest("tailor");
    });


    coverLetterButton.addEventListener('click', () => {
        sendLLMRequest("coverLetter");
    });



    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
        if (message.tailoredResume) {
            document.getElementById('latexCode').value = "data:application/x-tex;base64," + btoa(message.tailoredResume);
            document.getElementById('open-overleaf').classList.remove("hidden");
            tailorResumeButton.removeAttribute("disabled");

        } else if (message.api_error) {
            const tailoredResume = getData().resume;
            if (tailoredResume) {
                document.getElementById('latexCode').value = "data:application/x-tex;base64," + btoa(tailoredResume);
                document.getElementById('open-overleaf').classList.remove("hidden");
            }
            statusMessage.innerText = message.api_error;
        }


    });

    chrome.storage.local.get(['currentAppStatus'], (result) => {

        switch (result.currentAppStatus) {
            case AppStatus.TAILORED_RESUME:
                const tailoredResume = getData().resume;
                document.getElementById('latexCode').value = "data:application/x-tex;base64," + btoa(tailoredResume);
                document.getElementById('open-overleaf').classList.remove("hidden");
                tailorResumeButton.removeAttribute("disabled");
                coverLetterButton.removeAttribute("disabled");
                break;
            case AppStatus.RESUME_API_CALL || AppStatus.COVER_LETTER_API_CALL:
                tailorResumeButton.setAttribute("disabled", "true");
                coverLetterButton.setAttribute("disabled", "true");
                break;
            case AppStatus.ERROR_RESUME || AppStatus.ERROR_COVER_LETTER:
                tailorResumeButton.removeAttribute("disabled");
            case AppStatus.TAILORED_COVER_LETTER:
                coverLetterButton.removeAttribute("disabled");
                break;

        }
    });
});


function getPageData() {

    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs.length === 0) {
            console.error("No active tabs found");
            return;
        }
        chrome.tabs.sendMessage(tabs[0].id, { action: "getText" }, (response) => {
            if (response && response.text) {
                console.log("Page Text:", response.text);
                jobDescription = response.text;
            } else {
                console.error("No response from content script");
            }

        });
    });

}

async function sendLLMRequest(requestType) {
    const apiKey = await getApiKey(document.getElementById('apiSelection').value);
    const resume = await getUserResume();

    if (!apiKey) {
        statusMessage.innerText = "Please save your API Key first!";
        return;
    }

    if (!resume) {
        statusMessage.innerText = "Please save your resume before!";
        return;
    }

    if (!jobDescription) {
        statusMessage.innerText = "Failed to extract job description!";
        return;
    }

    chrome.runtime.sendMessage({ action: requestType, selectedLLM: document.getElementById('apiSelection').value, jobOffer: jobDescription });
}


chrome.storage.onChanged.addListener((changes, namespace) => {
    for (let [key, { oldValue, newValue }] of Object.entries(changes)) {
        if (key === 'currentAppStatus') {
            statusMessage.innerText = newValue;
            switch (newValue) {
                case AppStatus.TAILORED_RESUME:
                    const tailoredResume = getData().resume;
                    document.getElementById('latexCode').value = "data:application/x-tex;base64," + btoa(tailoredResume);
                    document.getElementById('open-overleaf').classList.remove("hidden");
                    tailorResumeButton.removeAttribute("disabled");
                    coverLetterButton.removeAttribute("disabled");
                    break;
                case AppStatus.RESUME_API_CALL || AppStatus.COVER_LETTER_API_CALL:
                    tailorResumeButton.setAttribute("disabled", "true");
                    coverLetterButton.setAttribute("disabled", "true");
                    break;
                case AppStatus.ERROR_RESUME || AppStatus.ERROR_COVER_LETTER:
                    tailorResumeButton.removeAttribute("disabled");
                    coverLetterButton.removeAttribute("disabled");
                case AppStatus.TAILORED_COVER_LETTER:
                    coverLetterButton.removeAttribute("disabled");
                    tailorResumeButton.removeAttribute("disabled");
                    break;
            }

        }
    }
});



function toggleSettings(hide, resume, apiKey) {

    const apiKeyInput = document.getElementById("apiKey");
    const resumeInput = document.getElementById("latexResume");
    const apiContainer = document.getElementById('apiKeyContainer');
    const resumeContainer = document.getElementById('resumeContainer');

    const editApiKeyButton = document.getElementById("editApiKey");
    const saveApiKeyButton = document.getElementById("saveApiKey");
    const editResumeButton = document.getElementById("editResume");
    const saveResumeButton = document.getElementById("saveResume");

    if (!apiKey && !resume) {
        saveApiKeyButton.classList.remove("hidden");
        saveResumeButton.classList.remove("hidden");
        apiKeyInput.classList.remove("hidden");
        resumeInput.classList.remove("hidden");
    } else {
        if (apiKey) {
            editApiKeyButton.classList.remove("hidden");
            saveApiKeyButton.classList.add("hidden");
            apiKeyInput.classList.add("hidden");
        } else {
            saveApiKeyButton.classList.remove("hidden");
            apiKeyInput.classList.remove("hidden");
        }

        if (resume) {
            editResumeButton.classList.remove("hidden");
            saveResumeButton.classList.add("hidden");
            resumeInput.classList.add("hidden");
        } else {
            saveResumeButton.classList.remove("hidden");
            resumeInput.classList.remove("hidden");
        }
    }

    if (hide) {
        apiContainer.classList.add("hidden");
        resumeContainer.classList.add("hidden");
    } else {
        apiContainer.classList.remove("hidden");
        resumeContainer.classList.remove("hidden");
    }
}
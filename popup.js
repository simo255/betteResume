import { getApiKey, saveApiKey } from './key_management/api_key_management.js';
import { sendGeminiApiCall, sendMistralApiCall } from './api.js';

let jobDescription = ""

let selectedLLM = "Mistral"

document.addEventListener('DOMContentLoaded', async () => {
    getPageHTML();

    const apiKeyInput = document.getElementById("apiKey");
    const resumeInput = document.getElementById("latexResume");

    const editApiKeyButton = document.getElementById("editApiKey");
    const saveApiKeyButton = document.getElementById("saveApiKey");
    const editResumeButton = document.getElementById("editResume");
    const saveResumeButton = document.getElementById("saveResume");
    const statusMessage = document.getElementById('status');

    const tailorResumeButton = document.getElementById("tailorResume");


    const resume = await getSavedResume();
    const apiKey = await getApiKey();


    if (!apiKey && !resume) {
        saveApiKeyButton.classList.remove("hidden");
        saveResumeButton.classList.remove("hidden");
        apiKeyInput.classList.remove("hidden");
        resumeInput.classList.remove("hidden");
    } else {
        if (apiKey) {
            editApiKeyButton.classList.remove("hidden");
        } else {
            saveApiKeyButton.classList.remove("hidden");
            apiKeyInput.classList.remove("hidden");
        }

        if (resume) {
            editResumeButton.classList.remove("hidden");
        } else {
            saveResumeButton.classList.remove("hidden");
            resumeInput.classList.remove("hidden");
        }
    }

    const apiSelection = document.getElementById('apiSelection');

    apiSelection.addEventListener('change', (event) => {
        const selectedApi = event.target.value;
        selectedLLM = selectedApi;

    });

    editApiKeyButton.addEventListener("click", async () => {
        apiKeyInput.classList.remove("hidden");
        apiKeyInput.value = await getApiKey()
        saveApiKeyButton.classList.remove("hidden");
        editApiKeyButton.classList.add("hidden");
    });

    saveApiKeyButton.addEventListener("click", () => {
        const newApiKey = apiKeyInput.value;
        if (newApiKey) {
            saveApiKey(newApiKey);
            apiKeyInput.classList.add("hidden");
            saveApiKeyButton.classList.add("hidden");
            editApiKeyButton.classList.remove("hidden");
            statusMessage.innerText = "API Key saved successfully!";
        }
    });

    editResumeButton.addEventListener("click", async () => {
        resumeInput.classList.remove("hidden");
        resumeInput.value = await getSavedResume();
        saveResumeButton.classList.remove("hidden");
        editResumeButton.classList.add("hidden");
    });

    saveResumeButton.addEventListener("click", async () => {
        const newResume = resumeInput.value;
        if (newResume) {
            saveResume(newResume);
            resumeInput.classList.add("hidden");
            saveResumeButton.classList.add("hidden");
            editResumeButton.classList.remove("hidden");
            statusMessage.innerText = "Resume saved successfully!";

        }
    });

    tailorResumeButton.addEventListener('click', async () => {
        statusMessage.innerText = "Tailoring resume...";

        const apiKey = await getApiKey();
        const resume = await getSavedResume();

        if (!apiKey) document.getElementById('status').innerText = "Please save your API Key first!";
        else if (!resume) document.getElementById('status').innerText = "Please save your resume before !";
        else if (!jobDescription) document.getElementById('status').innerText = "Failed to extract job description!";
        else await handleTailorResume(apiKey, resume, jobDescription);
    });

});

async function handleTailorResume(apiKey, resumeText, jobDescription) {
    let tailoredResume = ""

    if (selectedLLM === "Mistral") {
        tailoredResume = await sendMistralApiCall(apiKey, resumeText, jobDescription);
    }
    else {
        tailoredResume = await sendGeminiApiCall(apiKey, resumeText, jobDescription);
    }
    console.log("Tailored Resume:", tailoredResume);

    const latexCode = tailoredResume.match(/```latex([\s\S]*?)```/)[1].trim();

    document.getElementById('latexCode').value = "data:application/x-tex;base64," + btoa(latexCode);


    if (latexCode) {
        document.getElementById('status').innerText = "Your resume has been tailored successfully!";
        document.getElementById('open-overleaf').classList.remove("hidden");
    } else {
        document.getElementById('status').innerText = "Failed to tailor resume.";
    }

}

async function saveResume(resumeText) {
    if (resumeText) {
        return new Promise((resolve) => {
            chrome.storage.local.set({ resume: resumeText }, () => {
                resolve();
            });
        });
    }
}

async function getSavedResume() {
    return new Promise((resolve) => {
        chrome.storage.local.get(['resume'], (result) => {
            resolve(result.resume);
        });
    });
}


function getPageHTML() {

    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs.length === 0) {
            console.error("No active tabs found");
            return;
        }

        chrome.tabs.sendMessage(tabs[0].id, { action: "getText" }, (response) => {
            if (chrome.runtime.lastError) {
                document.getElementById('status').innerText = "An error occurred, please refresh the page and try again.";
            } else {
                if (response && response.text) {
                    console.log("Page Text:", response.text);
                    jobDescription = response.text;
                } else {
                    console.error("No response from content script");
                }
            }
        });
    });

}

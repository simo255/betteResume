import { getApiKey, saveApiKey } from './key_management/api_key_management.js';
import { sendApiCall } from './api.js';

let jobDescription = ""

document.addEventListener('DOMContentLoaded', async () => {
    getPageHTML();

    const apiKeyInput = document.getElementById("apiKey");
    const resumeInput = document.getElementById("latexResume");
    const saveBothButton = document.getElementById("saveBoth");
    const tailorResumeButton = document.getElementById("tailorResume");
    const editApiKeyButton = document.getElementById("editApiKey");
    const saveApiKeyButton = document.getElementById("saveApiKey");
    const editResumeButton = document.getElementById("editResume");
    const saveResumeButton = document.getElementById("saveResume");
    const statusMessage = document.getElementById('status');

    const resume = await getSavedResume();
    const apiKey = await getApiKey();

    function hideAllInputs() {
        apiKeyInput.classList.add("hidden");
        resumeInput.classList.add("hidden");
        saveApiKeyButton.classList.add("hidden");
        saveResumeButton.classList.add("hidden");
        saveBothButton.classList.add("hidden");
    }


    if (!apiKey && !resume) {

        saveBothButton.classList.remove("hidden");
        apiKeyInput.classList.remove("hidden");
        resumeInput.classList.remove("hidden");

    } else {
        tailorResumeButton.classList.remove("hidden");

        if (apiKey) {

            editApiKeyButton.classList.remove("hidden");
        }

        if (resume) {

            editResumeButton.classList.remove("hidden");
        }
    }

    // Save both API key and resume
    saveBothButton.addEventListener("click", () => {
        const apiKeyValue = apiKeyInput.value;
        const resumeValue = resumeInput.value;

        if (apiKeyValue && resumeValue) {

            saveApiKey(apiKey);
            saveResume(resumeValue);
            hideAllInputs();
            tailorResumeButton.classList.remove("hidden");
            editApiKeyButton.classList.remove("hidden");
            editResumeButton.classList.remove("hidden");
            statusMessage.innerText = "API Key and Resume saved successfully!";
        } else {
            statusMessage.innerText = "Please enter a valid API Key.";
        }
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
        await handleTailorResume();
        statusMessage.innerText = "Tailoring resume...";
    });

});

async function handleTailorResume() {

    const apiKey = await getApiKey();
    if (!apiKey) {
        document.getElementById('status').innerText = "Please enter your API Key first!";
        return;
    }

    const resumeText = await getSavedResume();
    if (!resumeText) {
        document.getElementById('status').innerText = "Please paste your resume in LaTeX format!";
        document.getElementById('latexResume').classList.remove("hidden");
        document.getElementById('saveResume').classList.remove("hidden");
        return;
    }


    if (!jobDescription) {
        document.getElementById('status').innerText = "Failed to extract job description!";
        return;
    }

    const tailoredResume = await sendApiCall(apiKey, resumeText, jobDescription);

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
                console.error("Error sending message:", chrome.runtime.lastError.message);
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

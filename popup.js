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
        // Show the unified button if neither API key nor resume are set
        saveBothButton.classList.remove("hidden");
        apiKeyInput.classList.remove("hidden");
        resumeInput.classList.remove("hidden");

    } else {
        tailorResumeButton.classList.remove("hidden");

        if (apiKey) {
            // Show "Edit API Key" button
            editApiKeyButton.classList.remove("hidden");
        }

        if (resume) {
            // Show "Edit Resume" button
            editResumeButton.classList.remove("hidden");
        }
    }

    // Save both API key and resume
    saveBothButton.addEventListener("click", async () => {
        const apiKeyValue = apiKeyInput.value;
        const resumeValue = resumeInput.value;

        if (apiKeyValue && resumeValue) {
            // Save both to local storage
            await saveApiKey(apiKey);
            await saveResume(); // Save the resume if provided
            hideAllInputs();
            tailorResumeButton.classList.remove("hidden");
            editApiKeyButton.classList.remove("hidden");
            editResumeButton.classList.remove("hidden");
            document.getElementById('status').innerText = "API Key and Resume saved successfully!";
        } else {
            document.getElementById('status').innerText = "Please enter a valid API Key.";
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
    });

});

async function handleTailorResume() {
    try {
        const apiKey = await getApiKey();
        if (!apiKey) {
            document.getElementById('status').innerText = "Please enter your API Key first!";
            return;
        }

        const resumeText = await getSavedResume();
        if (!resumeText) {
            document.getElementById('status').innerText = "Please paste your resume in LaTeX format!";
            return;
        }

        showLoadingWheel(true);

        if (!jobDescription) {
            document.getElementById('status').innerText = "Failed to extract job description!";
            showLoadingWheel(false);
            return;
        }

        const tailoredResume = await sendApiCall(apiKey, resumeText, jobDescription);

        if (tailoredResume) {
            downloadFile('tailored_resume.tex', tailoredResume);
            document.getElementById('status').innerText = "Your resume has been tailored successfully!";
        } else {
            document.getElementById('status').innerText = "Failed to tailor resume.";
        }
        showLoadingWheel(false);
    } catch (e) {
        console.error("Error in tailoring resume:", e);
        document.getElementById('status').innerText = `Error: ${e.message}`;
        showLoadingWheel(false);
    }
}

function showLoadingWheel(show) {
    const loadingWheel = document.getElementById('loadingWheel');
    loadingWheel.style.display = show ? 'block' : 'none';
}


function downloadFile(filename, content) {
    const blob = new Blob([content], { type: 'application/x-tex' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
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

// Request the HTML from the content script
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
                    document.getElementById('textContent').textContent = response.text;
                } else {
                    console.error("No response from content script");
                }
            }
        });
    });

}


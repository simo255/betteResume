import { getApiKey, saveApiKey } from './key_management/api_key_management.js';
import { getResumeList, saveResumeList, getUserResume, saveUserResume } from './resume-helper.js';


let jobOffer = { description: "", url: "" };

document.addEventListener('DOMContentLoaded', async () => {
    getPageData();

    const apiKeyInput = document.getElementById("apiKey");
    const resumeInput = document.getElementById("latexResume");

    const editApiKeyButton = document.getElementById("editApiKey");
    const saveApiKeyButton = document.getElementById("saveApiKey");
    const editResumeButton = document.getElementById("editResume");
    const saveResumeButton = document.getElementById("saveResume");
    const statusMessage = document.getElementById('status');

    const tailorResumeButton = document.getElementById("tailorResume");


    const resume = await GetUserResume();
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


    editApiKeyButton.addEventListener("click", async () => {
        apiKeyInput.classList.remove("hidden");
        apiKeyInput.value = await getApiKey();
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

    const tailoredResume = await getResumeList(jobOffer.url);

    if (tailoredResume) {
        document.getElementById('latexCode').value = "data:application/x-tex;base64," + btoa(tailoredResume);
        document.getElementById('open-overleaf').classList.remove("hidden");
        document.getElementById('status').innerText = "It will open the last tailored resume for this job offer";
        tailorResumeButton.innerText = "Tailor Resume again";
    } else {
        document.getElementById('open-overleaf').classList.add("hidden");
        tailorResumeButton.innerText = "Tailor Resume";

    }

    tailorResumeButton.addEventListener('click', async () => {

        if (!apiKey) {
            document.getElementById('status').innerText = "Please save your API Key first!";
            return;
        }

        if (!resume) {
            document.getElementById('status').innerText = "Please save your resume before!";
            return;
        }

        if (!jobOffer) {
            document.getElementById('status').innerText = "Failed to extract job description!";
            return;
        }

        const selectedLLM = document.getElementById('apiSelection').value;

        document.getElementById('open-overleaf').classList.add("hidden");
        saveResumeList(jobOffer.url, "");

        chrome.runtime.sendMessage({ action: "makeAPICall", apiKey, resume, jobOffer, selectedLLM });

        statusMessage.innerText = "Tailoring resume...";

    });

    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
        if (message.tailoredResume) {
            document.getElementById('latexCode').value = "data:application/x-tex;base64," + btoa(message.tailoredResume);
            document.getElementById('open-overleaf').classList.remove("hidden");
            document.getElementById('status').innerText = "Your resume has been tailored successfully!";
            
        } else if (message.api_error) {
            document.getElementById('open-overleaf').classList.add("hidden");
            document.getElementById('status').innerText = message.api_error;

            if (tailoredResume) {
                document.getElementById('latexCode').value = "data:application/x-tex;base64," + btoa(tailoredResume);
                document.getElementById('open-overleaf').classList.remove("hidden");
            }
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

            if (response && response.text && response.url) {
                jobOffer.description = response.text;
                jobOffer.url = response.url;
            } else {
                document.getElementById('status').innerText = "An error occurred, please refresh the page and try again.";

            }

        });
    });

}

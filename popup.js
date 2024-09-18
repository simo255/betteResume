import { getApiKey, saveApiKey } from './key_management/api_key_management.js';
import { getResumeList, saveResumeList, getUserResume, saveUserResume } from './helper/resume-helper.js';
import { AppStatus } from './helper/constants.js';


let jobOffer = { description: "", url: "" };

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
          statusMessage.innerText = "Your resume has been tailored successfully!";
            tailorResumeButton.removeAttribute("disabled");

        } else if (message.api_error) {
            const tailoredResume = getResumeList(jobOffer.url);

            if (tailoredResume) {
                document.getElementById('latexCode').value = "data:application/x-tex;base64," + btoa(tailoredResume);
                document.getElementById('open-overleaf').classList.remove("hidden");
            }
          statusMessage.innerText = message.api_error;
        }


    });


    chrome.storage.local.get(['currentAppStatus'], (result) => {
        console.log("Current app status: ", result.currentAppStatus);
        switch (result.currentAppStatus) {
            case AppStatus.NEW_JOB_OFFER:
                statusMessage.innerText = "New job offer detected!";
                break;
            case AppStatus.SAVED_JOB_OFFER || AppStatus.TAILORED_RESUME:
                const tailoredResume = getResumeList(jobOffer.url);
                document.getElementById('latexCode').value = "data:application/x-tex;base64," + btoa(tailoredResume);
                document.getElementById('open-overleaf').classList.remove("hidden");
                tailorResumeButton.removeAttribute("disabled");
              statusMessage.innerText = "It will open the last tailored resume for this job offer";
                tailorResumeButton.innerText = "Tailor Resume again";
                break;
            case AppStatus.API_CALL:
                statusMessage.innerText = "Tailoring resume ...";
                tailorResumeButton.setAttribute("disabled", "true");
                break;
            case AppStatus.ERROR:
                statusMessage.innerText = "An error occurred!";
                tailorResumeButton.removeAttribute("disabled");

                break;
        }
    });

});


function getPageData() {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        chrome.tabs.sendMessage(tabs[0].id, { action: "getText" }, (response) => {

            if (response && response.text && response.url) {
                jobOffer.description = response.text;
                jobOffer.url = response.url;
            } else {
              statusMessage.innerText = "An error occurred, please refresh the page and try again.";
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

    if (!jobOffer) {
      statusMessage.innerText = "Failed to extract job description!";
        return;
    }


    if (requestType === "tailor") {
        document.getElementById('open-overleaf').classList.add("hidden");

        saveResumeList(jobOffer.url, "");
        statusMessage.innerText = "Tailoring resume...";
        document.getElementById("tailorResume").setAttribute("disabled", "true");

    } else if (requestType === "coverLetter") {
      statusMessage.innerText = "Generating cover letter...";
        document.getElementById("coverLetter").setAttribute("disabled", "true");
    }

    chrome.runtime.sendMessage({ action: requestType, selectedLLM: document.getElementById('apiSelection').value, jobOffer: jobOffer.description });
}



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
import { getApiKey, saveApiKey } from './key_management/api_key_management.js';
import { sendApiCall } from './api.js';


document.addEventListener('DOMContentLoaded', async () => {
    try {
        const apiKey = await getApiKey();

        if (apiKey) {
            document.getElementById('apiKeyContainer').classList.add('hidden');
            document.getElementById('resumeContainer').classList.remove('hidden');
            document.getElementById('tailorResume').classList.remove('hidden');
            document.getElementById('editKey').classList.remove('hidden');
        } else {
            document.getElementById('tailorResume').classList.add('hidden');
            document.getElementById('editKey').classList.add('hidden');
            document.getElementById('resumeContainer').classList.add('hidden');
        }

        document.getElementById('saveKey').addEventListener('click', async () => {
            const apiKey = document.getElementById('apiKey').value;
            await saveApiKey(apiKey);
        });

        document.getElementById('editKey').addEventListener('click', () => {
            document.getElementById('apiKeyContainer').classList.remove('hidden');
            document.getElementById('tailorResume').classList.add('hidden');
            document.getElementById('editKey').classList.add('hidden');
        });

        document.getElementById('tailorResume').addEventListener('click', async () => {
            await handleTailorResume();
        });
    } catch (error) {
        console.error("Error initializing DOMContentLoaded handler:", error);
    }
});


async function handleTailorResume() {
    try {
        const apiKey = await getApiKey();
        if (!apiKey) {
            document.getElementById('status').innerText = "Please enter your API Key first!";
            return;
        }

        // Get the LaTeX resume text from the textarea
        const resumeText = document.getElementById('latexResume').value.trim();
        if (!resumeText) {
            document.getElementById('status').innerText = "Please paste your resume in LaTeX format!";
            return;
        } else {
            document.getElementById('status').innerText = "Resume data received!";
        }

        showLoadingWheel(true);  // Show loading wheel

        const jobDescription = await extractJobDescription();
        if (!jobDescription) {
            document.getElementById('status').innerText = "Failed to extract job description!";
            showLoadingWheel(false);
            return;
        } else {
            document.getElementById('status').innerText = "Job description extracted!";
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

async function extractJobDescription() {
    try {
        console.log("Extracting full page content...");

        const pageContent = document.body.innerText;  // Selects the entire page content
        if (pageContent) {
            return pageContent;
        } else {
            throw new Error("Page content not found");
        }
    } catch (e) {
        console.error("Error extracting page content:", e);
        throw e;
    }
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

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.jobDescription) {
        console.log("Received job description:", message.jobDescription);
        // Handle job description here
    }
});

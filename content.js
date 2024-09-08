chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.jobDescription) {
        console.log("Received job description:", message.jobDescription);
        // Process the job description or send a response back
    }
});

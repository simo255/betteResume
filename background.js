chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.html) {
        console.log('Extracted HTML:', message.html);
        // Process the entire HTML page here
    }
});
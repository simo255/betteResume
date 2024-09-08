// Confirm the content script is running
console.log("Content script is running");

// Send the text content of the page
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "getText") {
      // Extract text content from the body of the page
      sendResponse({ text: document.body.innerText });
      console.log("Text content sent");
      console.log(document.body.innerText);
    }
  });
  
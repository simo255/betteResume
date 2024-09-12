// Confirm the content script is running
console.log("Content script is running");

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "getText") {
      sendResponse({ text: document.body.innerText, url: window.location.href });
      }
  });
  
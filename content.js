// Confirm the content script is running
console.log("Content script is running");
const url = window.location.href;

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "getText") {
    sendResponse({ text: document.body.innerText, url: url });

  }
}
);

chrome.runtime.sendMessage({ action: "saveAppState", url: url });



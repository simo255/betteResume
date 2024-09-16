// Confirm the content script is running
console.log("Content script is running");
const url = window.location.href;

chrome.runtime.sendMessage({ action: "saveAppState" });

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "getText") {
    sendResponse({ text: document.body.innerText, url: url });

  }
}
);




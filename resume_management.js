function saveResumeList(url, latexCode) {
    chrome.storage.local.set({ [url]: latexCode }, () => {
        console.log('Resume saved successfully!');
    });
}

function getResumeList(url) {
    return new Promise((resolve, reject) => {
        chrome.storage.local.get([url], (result) => {
            if (chrome.runtime.lastError) {
                reject(new Error(chrome.runtime.lastError));
            } else {
                resolve(result[url] || null);
            }
        });
    });
}

export { saveResumeList, getResumeList };
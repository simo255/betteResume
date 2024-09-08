import { generateKey, exportKey, importKey, encryptData, decryptData } from './crypto.js';


async function saveApiKey(apiKey) {
    try {
        const key = await generateKey();
        const exportedKey = await exportKey(key);
        const { iv, encryptedData } = await encryptData(key, apiKey);
        const storageData = { apiKeyIv: iv, apiKeyEncryptedData: encryptedData, encryptionKey: exportedKey };

        chrome.storage.sync.set({ storageData }, () => {
            document.getElementById('status').innerText = "API Key saved securely!";
        });
    } catch (e) {
        console.error("Saving API Key failed:", e);
        document.getElementById('status').innerText = `Error: ${e.message}`;
    }
}

function getApiKey() {
    return new Promise((resolve, reject) => {
        chrome.storage.sync.get('storageData', async (result) => {
            if (chrome.runtime.lastError) {
                return reject(chrome.runtime.lastError);
            }

            if (result.storageData) {
                try {
                    const { apiKeyIv, apiKeyEncryptedData, encryptionKey } = result.storageData;
                    const key = await importKey(encryptionKey);
                    const decryptedApiKey = await decryptData(key, apiKeyIv, apiKeyEncryptedData);
                    resolve(decryptedApiKey);
                } catch (error) {
                    reject(error);
                }
            } else {
                resolve(null);
            }
        });
    });
}

export {
    saveApiKey,
    getApiKey,
};
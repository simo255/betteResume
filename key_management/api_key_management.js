import { generateKey, exportKey, importKey, encryptData, decryptData } from './crypto.js';

async function saveApiKey(serviceName, apiKey) {
    try {
        const key = await generateKey();
        const exportedKey = await exportKey(key);
        const { iv, encryptedData } = await encryptData(key, apiKey);
        const storageData = { apiKeyIv: iv, apiKeyEncryptedData: encryptedData, encryptionKey: exportedKey };

        chrome.storage.sync.get('apiKeys', (result) => {
            const apiKeys = result.apiKeys || {};
            apiKeys[serviceName] = storageData;

            chrome.storage.sync.set({ apiKeys }, () => {
                document.getElementById('status').innerText = `API Key for ${serviceName} saved securely!`;
            });
        });
    } catch (e) {
        console.error("Saving API Key failed:", e);
        document.getElementById('status').innerText = `Error: ${e.message}`;
    }
}

function getApiKey(serviceName) {
    return new Promise((resolve, reject) => {
        chrome.storage.sync.get('apiKeys', async (result) => {
            if (chrome.runtime.lastError) {
                return reject(chrome.runtime.lastError);
            }

            const apiKeys = result.apiKeys || {};
            const storageData = apiKeys[serviceName];

            if (storageData) {
                try {
                    const { apiKeyIv, apiKeyEncryptedData, encryptionKey } = storageData;
                    const key = await importKey(encryptionKey);
                    const decryptedApiKey = await decryptData(key, apiKeyIv, apiKeyEncryptedData);
                    resolve(decryptedApiKey);
                } catch (error) {
                    reject(error);
                }
            } else {
                resolve(null);  // API key for the service not found
            }
        });
    });
}

export {
    saveApiKey,
    getApiKey,
};

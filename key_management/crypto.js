
async function generateKey() {
    return await crypto.subtle.generateKey(
        {
            name: "AES-GCM",
            length: 256,
        },
        true,
        ["encrypt", "decrypt"]
    );
}

async function exportKey(key) {
    const exported = await crypto.subtle.exportKey('jwk', key);
    return {
        ...exported,
        kty: 'oct', 
    };
}

async function importKey(jwk) {
    return await crypto.subtle.importKey(
        'jwk',
        jwk,
        {
            name: "AES-GCM",
            length: 256,
        },
        true,
        ["encrypt", "decrypt"]
    );
}

async function encryptData(key, data) {
    const encoder = new TextEncoder();
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const encodedData = encoder.encode(data);

    try {
        const encryptedData = await crypto.subtle.encrypt(
            {
                name: "AES-GCM",
                iv: iv,
            },
            key,
            encodedData
        );

        return {
            iv: Array.from(new Uint8Array(iv)),
            encryptedData: Array.from(new Uint8Array(encryptedData)),
        };
    } catch (e) {
        console.error("Encryption failed:", e);
        throw e;
    }
}

async function decryptData(key, iv, encryptedData) {
    const decoder = new TextDecoder();
    const ivArray = new Uint8Array(iv);
    const encryptedArray = new Uint8Array(encryptedData);

    try {
        const decryptedData = await crypto.subtle.decrypt(
            {
                name: "AES-GCM",
                iv: ivArray,
            },
            key,
            encryptedArray
        );

        return decoder.decode(decryptedData);
    } catch (e) {
        console.error("Decryption failed:", e);
        throw e;
    }
}

export {
    generateKey,
    exportKey,
    importKey,
    encryptData,
    decryptData,
};
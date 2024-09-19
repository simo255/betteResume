
async function saveUserResume(resume) {
    if (resume) {
        return new Promise((resolve) => {
            chrome.storage.local.set({ resume: resume }, () => {
                resolve();
            });
        });
    }
}

async function getUserResume() {
    return new Promise((resolve) => {
        chrome.storage.local.get(['resume'], (result) => {
            resolve(result.resume);
        });
    });
}

async function saveData(resume, coverLetter) {
    return new Promise((resolve) => {
        chrome.storage.local.get(['userData'], (data) => {
            const currentResume = data.userData || {};
            
            const updatedResume = {
                resume: resume || currentResume.resume,
                coverLetter: coverLetter || currentResume.coverLetter
            };

            chrome.storage.local.set({ userData: updatedResume }, () => {
                resolve();
            });
        });
    });
}


async function getData() {
    return new Promise((resolve) => {
        chrome.storage.local.get(['userData'], (result) => {
            resolve(result.userData);
        });
    });
}


export {saveData, getData, saveUserResume, getUserResume};
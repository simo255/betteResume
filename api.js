async function sendApiCall(apiKey, resumeText, jobDescription) {

    const apiUrl = "https://api.mistral.ai/v1/chat/completions";
    const model = "open-mistral-nemo-2407";
    const systemContent = "This is the job description : " + jobDescription + "you have to generate a resume for a job application. You will generate a new resume for me using the appropriate keywords for a better match. Add the keywords inside the experience, education and projects sections of the resume. If the keywords are not present in the resume, add them in the appropriate sections. The resume must be in LaTeX format. You have to answer with the whole code directly, without saying anything else.";
    const userPrompt = "This is my resume : " + resumeText + " . Make sure it's a one page format. If you find useless informations, that has nothing to do with the job application, dont add it to the resume. Don't add any comments."
    try {
        const response = await fetch(apiUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: model,
                temperature: 0.4,
                messages: [
                    {
                        role: "system",
                        content: systemContent
                    },
                    {
                        role: "user",
                        content: userPrompt
                    }

                ]
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error("API call failed:", errorText);
            document.getElementById('status').innerText = `Error: ${errorText}`;

            throw new Error(`API call failed with status: ${response.status}`);
        }

        const data = await response.json();
        if (data.choices && data.choices.length > 0) {
            return data.choices[0].message.content;
        } else {
            throw new Error("No choices found in API response");
        }
    } catch (error) {
        console.error("Error fetching tailored resume:", error.message);
        document.getElementById('status').innerText = `Error: ${error.message}`;
        return null;
    }
}

export { sendApiCall };
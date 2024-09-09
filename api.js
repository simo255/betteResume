
async function sendMistralApiCall(apiKey, resumeText, jobDescription) {

    const apiUrl = "https://api.mistral.ai/v1/chat/completions";
    const model = "open-mistral-nemo-2407";
    const systemContent = getSystemContent(jobDescription);
    const userPrompt = "This is my resume : " + resumeText + "\n . Make sure it's a one page format. Don't add any comments while answering"
    const prefix = "```latex";
    try {
        const response = await fetch(apiUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: model,
                temperature: 0.7,
                messages: [
                    {
                        role: "system",
                        content: systemContent
                    },
                    {
                        role: "user",
                        content: userPrompt
                    },
                    {
                        role: "assistant",
                        prefix: true,
                        content: prefix
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



async function sendGeminiApiCall(apiKey, resumeText, jobDescription) {
    const data = {
        "contents": [{
            "parts": [{ "text": "This is my resume : " + resumeText + "\n . Make sure it's a one page format. Don't add any comments while answering" }]
        }],
        "system_instruction": {
            "parts": { "text": getSystemContent(jobDescription) }
        },
        "generationConfig": {
            "temperature": 1.4,
        }
    }

    const options = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    };
    try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

        const response = await fetch(url, options);
        const json = await response.json();
        const latexCode = json.candidates[0].content.parts[0].text;
        return latexCode;
    } catch (error) {
        console.error('error:' + error);
    }
}

function getSystemContent(jobDescription) {
    const stmt0 = "You are  a Talent Acquisition Specialist, you have to select the best candidate for a job application, you have received a resume from a candidate, but it's not tailored to the job description, you have to generate a new resume for the candidate.";
    const stmt1 = "This is the job description : " + jobDescription + ", You have to generate a resume for this job application.";
    const stmt3 = "You will generate a new resume for me using the appropriate keywords for a better match.";
    const stmt16 = "According to my resume infos, you have to find a way to make it more relevant to the job description. As if I truly have the experience and the skills required for the job.";
    const stmt5 = "if some informations are not really relevant, you can skip it, or at least add some bullet points that may fit to the job description.";
    const stmt4 = "Add the keywords inside the experience, education and projects sections of my resume. Make them in bold format.";
    const stmt6 = "The resume must be in LaTeX format.";
    const stmt9 = "Make sure it's a one page format, the length of the answer can be up to 6500 characters, without spaces, but not less than 5500, this is mandatory.";
    const stmt11 = "If my resume has a skills section, don't add the keywords if it's already present in other sections. YOU have to add only the missing keywords in the skills section.";
    const stmt14 = "Your answer must be in the following format : ```latex Your answer ```.";
    return stmt0 + stmt1 + stmt3 + stmt4 + stmt6 + stmt9 + stmt11 + stmt14 + stmt16 + stmt5;
}



export { sendMistralApiCall, sendGeminiApiCall };
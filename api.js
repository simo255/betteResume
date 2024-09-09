async function sendApiCall(apiKey, resumeText, jobDescription) {

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

function getSystemContent(jobDescription) {
    const stmt0 = "You are  a Talent Acquisition Specialist, you have to select the best candidate for a job application, you have received a resume from a candidate, but it's not tailored to the job description, you have to generate a new resume for the candidate.";
    const stmt1 = "This is the job description : " + jobDescription + ", You have to generate a resume for this job application.";
    const stmt3 = "You will generate a new resume for me using the appropriate keywords for a better match.";
    const stmt4 = "Add the keywords inside the experience, education and projects sections of my resume. Make them in bold format.";
    const stmt5 = "If the keywords were not present in my resume, add them in the appropriate experience detail.";
    const stmt6 = "The resume must be in LaTeX format.";
    const stmt8 = "If the experience and education in my resume is not relevant to the job description, keep the work experience but change the details, these details must be related to the job description and have the keywords.";
    const stmt9 = "Make sure it's a one page format, the length of the answer can be up to 6500 characters, without spaces, but not less than 5500, this is mandatory.";
    const stmt10 = "if a keyword is present in my resume and the job description, You have to give more details about it in the resume that you will generate.";
    const stmt11 = "If my resume has a skills section, don't add the keywords if it's already present in other sections. YOU have to add only the missing keywords in the skills section.";
    const stmt12 = "### for example, if the job description is asking for a software engineer with experience in Angular, You have to talk about Angular, TypeScript, JavaScript, html, css, and other related technologies in the resume that you will generate.";
    const stmt14 = "Your answer must be in the following format : ```latex Your answer ```";
    const stmt13 = " If the job description is asking for a software engineer with experience in Python, You have to talk about FastApi, Pycharm, Data visualization, and other related technologies in the resume that you will generate. ###";
    const stmt15 = "in the skill section, do not add the keywords if it's already mentioned.";
    return stmt0 + stmt1 + stmt10 + stmt3 + stmt4 + stmt5 + stmt6 + stmt9 + stmt8 + stmt11 + stmt12 + stmt13 + stmt14 + stmt15;
}



export { sendApiCall };
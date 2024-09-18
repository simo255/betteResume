
import { INSTRUCTION, USER_PROMPT } from "./constants.js";
import { getApiKey } from "../key_management/api_key_management.js";
import { getUserResume } from "./resume-helper.js";

async function sendMistralApiCall(jobDescription) {
    const apiKey = await getApiKey("Mistral");
    const resume = await getUserResume();
    console.log("aloalolo");

    const apiUrl = "https://api.mistral.ai/v1/chat/completions";
    const model = "open-mistral-nemo-2407";
    const prefix = "```latex";
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
                    content: INSTRUCTION
                },
                {
                    role: "system",
                    content: `This is the job description : ${jobDescription}, You have to generate a resume for this job application.`
                },
                {
                    role: "user",
                    content: `This is my resume : ${resume}`
                },
                {
                    role: "user",
                    content: USER_PROMPT
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
        return { "status": false, "message": errorText };
    }

    const data = await response.json();
    if (data.choices && data.choices.length > 0) {
        const latexCode = data.choices[0].message.content;

        return { "status": true, "latexCode": latexCode };

    } else {
        return { "status": false, "message": "No response from Mistral API" };
    }

}



async function sendGeminiApiCall(jobDescription) {
    const apiKey = await getApiKey("Gemini");
    const resume = await getUserResume();

    const data = {
        system_instruction: {
            parts: [{ "text": INSTRUCTION },
            { "text": `This is the job description : ${jobDescription}, You have to generate a resume for this job application.` }]
        },
        contents: [{
            parts: [{ "text": `This is my resume : ${resume}` }, { "text": USER_PROMPT }]
        }],
     
        "generationConfig": {
            "temperature": 1.4,
        }
    }

    const options = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    };

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    const response = await fetch(url, options);
    const json = await response.json();
    if (json.error) {
        return { "status": false, "message": json.error.message };
    } else {
        const latexCode = json.candidates[0].content.parts[0].text;
        return { "status": true, "latexCode": latexCode };
    }

}


export { sendMistralApiCall, sendGeminiApiCall };
const INSTRUCTION_RESUME = `
    You are  a Talent Acquisition Specialist, you have to select the best candidate for a job application, you have received a resume from a candidate, but it's not tailored to the job description, you have to generate a new resume for the candidate. 
   
    You will generate a new resume for me using the appropriate keywords for a better match. 
    According to my resume infos, you have to find a way to make it more relevant to the job description. As if I truly have the experience and the skills required for the job.
    if some informations are not really relevant, you can skip it, or at least add some bullet points that may fit to the job description. 
    Add the keywords inside the experience, education and projects sections of my resume. Make them in bold format.
    The resume must be in LaTeX format. Make sure it's a one page format, the length of the answer can be up to 6500 characters, without spaces, but not less than 5500, this is mandatory.
    If my resume has a skills section, don't add the keywords if it's already present in other sections. YOU have to add only the missing keywords in the skills section.
    `

const INSTRUCTION_COVER_LETTER = `
    You are a Talent Acquisition Specialist, you have to select the best candidate for a job application, you have received a cover letter from a candidate, but it's not tailored to the job description, you have to generate a new cover letter for the candidate.
    You will generate a new cover letter for me using the appropriate keywords for a better match.
    According to my resume infos, you have to find a way to make it more relevant to the job description. As if I truly have the experience and the skills required for the job.
    if some informations are not really relevant, you can skip it, or at least add some bullet points that may fit to the job description.
    Add the keywords inside the cover letter. Make them in bold format.
    `


const USER_PROMPT = `Try to replace some points by situations that may fit to the job description, that i could have done during my previous experiences.
    Make sure you don't repeat the same keywords, try to find some synonyms or other ways to express the same idea.
    `


const AppStatus = {
    GENERATING_RESUME: 'Generating resume',
    RESUME_API_CALL: 'Using AI to generate resume',
    TAILORED_RESUME: 'Resume generated !',
    ERROR_RESUME: 'an error occurred while generating the resume',
    
    GENERATING_COVER_LETTER: 'Generating cover letter ...',
    COVER_LETTER_API_CALL: 'Using AI to generate cover letter ...',
    TAILORED_COVER_LETTER: 'Cover letter generated !',
    ERROR_COVER_LETTER: 'an error occurred while generating the cover letter',
}

export { INSTRUCTION_RESUME, USER_PROMPT, AppStatus, INSTRUCTION_COVER_LETTER }
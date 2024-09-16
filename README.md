![image](https://github.com/simo255/betteResume/blob/main/icons/icon128.png)

# betteResume

**betteResume** is a Chrome extension designed to simplify the process of tailoring your resume for job applications. It reads job offers from a web page, makes an API call to Mistral AI or Gemini using a user-provided API key, and opens it in Overleaf for further edits. Each generated resume can be retrieved if you're on the job offer website.

## Features

- **Extract Job Offers:** Reads job offers from a web page.
- **Server-less app:** Everything is stored locally in your computer, the only calls to a server are the LLM's API ( There's no other way, right ?)
- **Generate Resume with AI:** Uses Mistral's nano model API or Gemini flash 1.5 LLM to tailor your resume based on job offers.
- **API Key encryption** Uses AES-GCM 256 to store securely the API key in extension's storage.
- **Resume management** Each generated resume is associated to the webpage of the job offer. Open the job link and your resume will be retrieved !
- **Output Formats:** Opens the resume directly in Overleaf website
- **Resume Input:** Allows you to paste your resume in LaTeX format.

## Installation

1. Clone the repository:

    ```bash
    git clone https://github.com/simo255/betteResume.git
    ```

2. Navigate to the directory:

    ```bash
    cd betteResume
    ```

3. Load the extension into Chrome:
   - Go to `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked" and select the directory containing the extension files



## Usage

1. Click on the extension icon in Chrome.
2. Paste your resume in LaTeX format into the designated field (if not saved previously).
3. Enter or edit your Mistral API key (if not saved previously).
4. Click the 'Tailor Resume' button.
5. The extension will process the job offer, tailor your resume. Click on Open in overleaf button to open the latex file in Overleaf.

![image](https://github.com/user-attachments/assets/8ed7861e-1d18-4bce-8b14-78103cbc0a0e)

![image](https://github.com/user-attachments/assets/729b5dc1-3a61-44e6-85c7-123d38ff978f)

![image](https://github.com/user-attachments/assets/ef713fa9-f24e-4c0c-afdb-dfdb2a10bfc8)






## Roadmap

- **Upcoming Features:**
  - Upload your resume as a pdf file directly, instead of copy/paste
  - Ability to select other LLMs based on user choice. - added Gemini, more to come !
  - Improved error handling and user notifications.
  - Generate Cover letters.
  - Better UI/UX

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.


Feel free to adjust any details to better match your project’s specifics or your preferences!

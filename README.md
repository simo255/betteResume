![image](https://github.com/simo255/betteResume/blob/main/icons/icon128.png)

# betteResume

**betteResume** is a Chrome extension designed to simplify the process of tailoring your resume for job applications. It reads job offers from a web page, makes an API call to Mistral AI or Gemini using a user-provided API key, and opens it in Overleaf for further edits.

## Features

- **Extract Job Offers:** Reads job offers from a web page.
- **Generate Resume with AI:** Uses Mistral's nano model API or Gemini flash 1.5 LLM to tailor your resume based on job offers.
- **API Key encryption** Uses AES-GCM 256 to store securely the API key in extension's storage.
- **Output Formats:** Opens the resume directly in Overleaf website
- **Resume Input:** Allows you to paste your resume in LaTeX format for tailoring.

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

   ![image](https://github.com/user-attachments/assets/3bcef3e8-65f5-47a1-8484-bbd40c672b26)

   ![image](https://github.com/user-attachments/assets/77fcf86b-c4e9-41c7-bdbd-557cc6b48ada)




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

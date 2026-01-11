 Bloom-Taxonomy-Coach-V1-

  A lightweight, AI-powered question validator designed to help educators align their assessments with Bloom's Taxonomy.  
  
**Bloom Coach (V1)** focuses on accuracy and clarity. It helps you:  
1.  **Diagnose** the correct Bloom level of your question (ignoring typos).  
2.  **Refine** the phrasing to improve clarity and professionalism.  
  
⚠️ **Important:** This tool requires a valid API Key to function. It does not work offline.  
  
## ✨ Features  
  
*   **Smart Diagnosis:** Determines Bloom Level (Remember, Understand, Apply, etc.) based on cognitive verbs, ignoring typos or poor grammar.  
*   **Refine Mode:** Fixes spelling, grammar, and phrasing while keeping the intended Bloom Level unchanged.  
*   **Multi-Model Support:** Works with OpenAI (GPT-4), Anthropic (Claude), and Google Vertex (Gemini) models via a unified endpoint.  
*   **Zero Dependency:** Built with pure HTML, CSS, and JavaScript. No build tools required.  
*   **Privacy Focused:** API Keys are stored locally in your browser's LocalStorage and never sent to third parties other than the API provider.  
  
## 🚀 Prerequisites & Setup  
  
Since this app connects to an AI service, you need an **API Key**.  
  
### How to Get an API Key (Free Options)  
  
To use this tool for free, you can get API keys from the following providers:  
  
1.  **Google AI (Gemini):**  
    *   **Status:** **Generous Free Tier.**  
    *   How to get: Go to [Google AI Studio](https://aistudio.google.com/), create an API key. Google provides a generous free monthly quota that resets, making this the best option for testing.  
  
2.  **Anthropic (Claude):**  
    *   **Status:** **Free Trial Credits.**  
    *   How to get: Sign up at [Anthropic Console](https://console.anthropic.com/). New users usually receive free credits to test their models.  
  
3.  **OpenAI (ChatGPT):**  
    *   **Status:** **Pay-as-you-go.**  
    *   How to get: [OpenAI Platform](https://platform.openai.com/). Usually requires a prepaid balance, but widely supported.  
  
### Configuring the Endpoint  
  
**By default**, `app.js` is configured to send requests through a gateway (Zenmux) which allows using multiple providers with a standard OpenAI-format payload.  
  
**If you obtained your API key directly from a provider (e.g., from Google AI Studio or OpenAI Platform) instead of using a gateway:**  
You must open `app.js` in a text editor and change the `API_URL` constant at the top of the file to match the specific provider's direct endpoint.  
  
*   **For OpenAI:** Change `API_URL` to `https://api.openai.com/v1/chat/completions`  
*   **For Google:** (Note: Requires custom payload code changes not supported in V1, use gateway instead).  
  

  
## 📚 Usage Guide  
  
### 1. Diagnose Mode  
*   **Goal:** Identify Bloom Level and find errors.  
*   **Input:** Paste your draft question.  
*   **Example:** *"Calculate teh standard deviation of the following dataset..."*  
*   **Result:**  
    *   **Level:** Apply (Correctly identified despite typos).  
    *   **Flags:** "Typos found: 'teh', 'missing dataset'".  
    *   **Redraft:** Corrected version of the sentence.  
  
### 2. Refine Mode  
*   **Goal:** Improve the quality of the question.  
*   **Input:** Paste a valid question.  
*   **Result:**  
    *   **Level:** (Remains the same as input).  
    *   **Redraft:** A more professional, clear version of the question.  
  
## 🛠 Technical Details  
  
*   **Frontend:** Vanilla JavaScript (ES6+), CSS3, HTML5.  
*   **API Endpoint:** Defaults to `https://zenmux.ai/api/v1/chat/completions`.  
*   **Data Handling:** Uses `localStorage` to persist API keys and preferences locally. No database required.  
  


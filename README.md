# VerifAI

<p align="center">
  <img src="icons/icon128.png" alt="VerifAI Logo" width="100" height="100">
</p>

<p align="center">
  <strong>AI-Powered News Credibility Checker</strong><br>
  A Chrome extension that analyzes news articles for credibility using AI.
</p>

## Features

- 🔍 **One-Click Analysis** — Analyze any news article with a single click
- 🤖 **AI-Powered** — Uses advanced language models to evaluate content
- ✅ **Credibility Verdict** — Get a clear credible/not credible assessment
- 📋 **Detailed Explanations** — Understand why an article is or isn't trustworthy
- ⚠️ **Issue Highlighting** — See specific problems identified in the content
- 🎨 **Modern UI** — Clean, animated interface with dark theme

## Usage

1. Navigate to any news article (NYT, BBC, CNN, etc.)
2. Click the VerifAI extension icon
3. Click "Analyze This Page"
4. View the credibility assessment and explanation

## Project Structure

```
VerifAI/
├── manifest.json           # Chrome extension configuration
├── config.js               # API key (gitignored)
├── config.example.js       # API key template
├── popup/
│   ├── popup.html          # Extension popup UI
│   ├── popup.css           # Styles and animations
│   └── popup.js            # Popup logic and API communication
├── scripts/
│   ├── background.js       # Service worker, handles API calls
│   └── content.js          # Extracts article content from pages
└── icons/
    ├── icon16.png          # Toolbar icon
    ├── icon48.png          # Extension management icon
    └── icon128.png         # Chrome Web Store icon
```

## Tech Stack

- **Frontend**: Vanilla HTML, CSS, JavaScript
- **AI Model**: Llama 3.3 70B via Groq API
- **Platform**: Chrome Extension (Manifest V3)

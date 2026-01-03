// Background service worker - handles OpenAI API calls

import CONFIG from '../config.js';

const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'analyzeCredibility') {
    analyzeCredibility(request.data)
      .then(sendResponse)
      .catch(err => sendResponse({ error: err.message }));
    
    // Return true to indicate async response
    return true;
  }
});

async function analyzeCredibility(articleData) {
  const apiKey = CONFIG.OPENAI_API_KEY;
  
  if (!apiKey || apiKey === 'your-openai-api-key-here') {
    throw new Error('OpenAI API key not set. Add your key to config.js');
  }

  const prompt = buildPrompt(articleData);

  const response = await fetch(OPENAI_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are a fact-checking assistant that analyzes news articles for credibility. 
You evaluate articles based on:
- Source reputation
- Presence of verifiable facts and citations
- Balanced reporting vs. sensationalism
- Logical consistency
- Misleading or false claims
- Clickbait or manipulative language

Respond ONLY with valid JSON in this exact format:
{
  "credible": true or false,
  "explanation": "A brief 1-2 sentence summary of why the article is or isn't credible",
  "issues": ["Issue 1", "Issue 2"] // Array of specific problems found. Empty array if credible.
}`
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.3,
      max_tokens: 500
    })
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error?.message || `API error: ${response.status}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;

  if (!content) {
    throw new Error('No response from OpenAI');
  }

  // Parse the JSON response
  try {
    // Remove markdown code blocks if present
    const cleanedContent = content
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim();
    
    return JSON.parse(cleanedContent);
  } catch (e) {
    throw new Error('Failed to parse AI response');
  }
}

function buildPrompt(articleData) {
  let prompt = `Analyze this article for credibility:\n\n`;
  
  prompt += `SOURCE: ${articleData.siteName || articleData.hostname}\n`;
  prompt += `URL: ${articleData.url}\n`;
  
  if (articleData.title) {
    prompt += `TITLE: ${articleData.title}\n`;
  }
  
  if (articleData.author) {
    prompt += `AUTHOR: ${articleData.author}\n`;
  }
  
  if (articleData.date) {
    prompt += `DATE: ${articleData.date}\n`;
  }
  
  prompt += `\nARTICLE CONTENT:\n${articleData.content || 'No content extracted'}`;
  
  return prompt;
}

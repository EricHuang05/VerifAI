// Wait for intro animation to complete, then show main content
document.addEventListener('DOMContentLoaded', () => {
  const intro = document.getElementById('intro');
  const mainContent = document.getElementById('main-content');

  setTimeout(() => {
    mainContent.classList.remove('hidden');
  }, 800);

  setTimeout(() => {
    intro.style.display = 'none';
  }, 1200);
});

const analyzeBtn = document.getElementById('analyze-btn');
const btnText = analyzeBtn.querySelector('.btn-text');
const resultsDiv = document.getElementById('results');
const verdictDiv = document.getElementById('verdict');
const verdictIcon = verdictDiv.querySelector('.verdict-icon');
const verdictText = verdictDiv.querySelector('.verdict-text');
const explanationDiv = document.getElementById('explanation');
const issuesDiv = document.getElementById('issues');
const errorP = document.getElementById('error');

analyzeBtn.addEventListener('click', async () => {
  // Reset UI
  setLoading(true);
  hideError();
  hideResults();

  try {
    // Get the active tab
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    if (!tab?.id) {
      throw new Error('No active tab found');
    }

    // Inject content script and extract article content
    const extractionResults = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ['scripts/content.js']
    });

    const articleData = extractionResults[0]?.result;

    if (!articleData || !articleData.content) {
      throw new Error('Could not extract article content. Is this a news article?');
    }

    // Send to background script for API analysis
    const response = await chrome.runtime.sendMessage({
      action: 'analyzeCredibility',
      data: articleData
    });

    if (response.error) {
      throw new Error(response.error);
    }

    // Display results
    displayResults(response);

  } catch (err) {
    showError(err.message);
  } finally {
    setLoading(false);
  }
});

function setLoading(loading) {
  analyzeBtn.disabled = loading;
  btnText.textContent = loading ? 'Analyzing...' : 'Analyze This Page';
  analyzeBtn.classList.toggle('loading', loading);
}

function displayResults(response) {
  resultsDiv.classList.remove('hidden');
  
  const isCredible = response.credible;
  
  // Set verdict
  verdictDiv.className = `verdict ${isCredible ? 'credible' : 'not-credible'}`;
  verdictIcon.textContent = isCredible ? '✓' : '!';
  verdictText.textContent = isCredible ? 'Credible' : 'Not Credible';
  
  // Set explanation
  explanationDiv.textContent = response.explanation || '';
  
  // Set issues (if any)
  issuesDiv.innerHTML = '';
  if (response.issues && response.issues.length > 0) {
    response.issues.forEach((issue, index) => {
      const issueEl = document.createElement('div');
      issueEl.className = 'issue-item';
      issueEl.textContent = issue;
      issueEl.style.animationDelay = `${(index + 1) * 0.1}s`;
      issuesDiv.appendChild(issueEl);
    });
  }
}

function hideResults() {
  resultsDiv.classList.add('hidden');
}

function showError(message) {
  errorP.textContent = message;
  errorP.classList.remove('hidden');
}

function hideError() {
  errorP.classList.add('hidden');
}

const analyzeBtn = document.getElementById('analyze-btn');
const btnText = analyzeBtn.querySelector('.btn-text');
const spinner = analyzeBtn.querySelector('.spinner');
const resultsDiv = document.getElementById('results');
const verdictDiv = document.getElementById('verdict');
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

    // Send to background script for OpenAI analysis
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
  btnText.textContent = loading ? 'Analyzing...' : 'Analyze Page';
  spinner.classList.toggle('hidden', !loading);
}

function displayResults(response) {
  resultsDiv.classList.remove('hidden');
  
  const isCredible = response.credible;
  
  // Set verdict
  verdictDiv.textContent = isCredible ? '✓ Credible' : '⚠ Not Credible';
  verdictDiv.className = `verdict ${isCredible ? 'credible' : 'not-credible'}`;
  
  // Set explanation
  explanationDiv.textContent = response.explanation || '';
  
  // Set issues (if any)
  issuesDiv.innerHTML = '';
  if (response.issues && response.issues.length > 0) {
    response.issues.forEach(issue => {
      const issueEl = document.createElement('div');
      issueEl.className = 'issue-item';
      issueEl.textContent = issue;
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

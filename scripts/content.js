// Extracts article content from the page
// This is an IIFE that returns the extracted data immediately
(() => {
  const TITLE_SELECTORS = [
    'h1[class*="headline"]',
    'h1[class*="title"]',
    'article h1',
    '.post-title',
    '.entry-title',
    'h1'
  ];

  const CONTENT_SELECTORS = [
    'article[class*="article"]',
    'article[class*="story"]',
    'article[class*="post"]',
    '[class*="article-body"]',
    '[class*="story-body"]',
    '[class*="post-content"]',
    '[class*="entry-content"]',
    '[itemprop="articleBody"]',
    'article',
    '.article',
    '.story',
    'main'
  ];

  const AUTHOR_SELECTORS = [
    '[rel="author"]',
    '[class*="author-name"]',
    '[class*="byline"]',
    '[itemprop="author"]',
    '.author',
    '.byline'
  ];

  const DATE_SELECTORS = [
    'time[datetime]',
    '[class*="publish"]',
    '[class*="date"]',
    '[itemprop="datePublished"]'
  ];

  function extractText(selectors) {
    for (const selector of selectors) {
      const el = document.querySelector(selector);
      if (el) {
        return el.innerText?.trim() || null;
      }
    }
    return null;
  }

  function extractContent() {
    for (const selector of CONTENT_SELECTORS) {
      const el = document.querySelector(selector);
      if (el) {
        // Get all paragraph text within the article
        const paragraphs = el.querySelectorAll('p');
        if (paragraphs.length > 0) {
          const text = Array.from(paragraphs)
            .map(p => p.innerText?.trim())
            .filter(t => t && t.length > 20) // Filter out short/empty paragraphs
            .join('\n\n');
          
          if (text.length > 100) {
            return text;
          }
        }
        
        // Fallback to full innerText if paragraphs didn't work
        const fullText = el.innerText?.trim();
        if (fullText && fullText.length > 100) {
          return fullText;
        }
      }
    }
    return null;
  }

  function extractDate() {
    // Try to get datetime attribute first
    const timeEl = document.querySelector('time[datetime]');
    if (timeEl) {
      return timeEl.getAttribute('datetime') || timeEl.innerText?.trim();
    }
    return extractText(DATE_SELECTORS);
  }

  function extractMetaTags() {
    const getMeta = (name) => {
      const el = document.querySelector(`meta[property="${name}"], meta[name="${name}"]`);
      return el?.getAttribute('content') || null;
    };

    return {
      ogTitle: getMeta('og:title'),
      ogDescription: getMeta('og:description'),
      ogSiteName: getMeta('og:site_name'),
      description: getMeta('description')
    };
  }

  // Main extraction
  const meta = extractMetaTags();
  
  const articleData = {
    url: window.location.href,
    hostname: window.location.hostname,
    title: extractText(TITLE_SELECTORS) || meta.ogTitle || document.title,
    content: extractContent(),
    author: extractText(AUTHOR_SELECTORS),
    date: extractDate(),
    siteName: meta.ogSiteName || window.location.hostname,
    description: meta.ogDescription || meta.description
  };

  // Truncate content if it's too long (to stay within API limits)
  if (articleData.content && articleData.content.length > 15000) {
    articleData.content = articleData.content.substring(0, 15000) + '...';
  }

  return articleData;
})();

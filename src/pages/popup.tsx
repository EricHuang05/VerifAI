import { useState, useEffect } from 'react'
import '../styles/popup.css'

function Popup() {
  const [url, setUrl] = useState('')
  const [isChecking, setIsChecking] = useState(false)
  const [result, setResult] = useState<'trustworthy' | 'untrustworthy' | null>(null)

  // Auto-populate with current tab URL when popup opens
  useEffect(() => {
    chrome.tabs?.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]?.url) {
        setUrl(tabs[0].url)
      }
    })
  }, [])

  const checkWebsite = async () => {
    setIsChecking(true)
    setResult(null)

    try {
      // TODO: Replace with actual API call
      // Simulating API call
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // Mock result - randomly choose trustworthy or untrustworthy
      const isTrustworthy = Math.random() > 0.5
      setResult(isTrustworthy ? 'trustworthy' : 'untrustworthy')
      
    } catch (error) {
      console.error('Error checking website:', error)
    } finally {
      setIsChecking(false)
    }
  }

  return (
    <div className="container">
      <h1>VerifAI</h1>
      
      <input
        type="text"
        className="url-input"
        placeholder="Enter URL"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
      />
      
      <button 
        className="check-button"
        onClick={checkWebsite}
        disabled={isChecking || !url}
      >
        {isChecking ? 'Checking...' : 'Check Website'}
      </button>
      
      {result && (
        <div className={`result-box ${result}`}>
          {result === 'trustworthy' ? 'Trustworthy' : 'Untrustworthy'}
        </div>
      )}
    </div>
  )
}

export default Popup
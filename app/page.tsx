// File: app/page.tsx
'use client'

import { useState } from 'react'
import styles from './page.module.css'

interface ThinkingStep {
  label: string;
  content: string;
}

interface AIResponse {
  thinking: ThinkingStep[];
  conclusion: string;
}

export default function Home() {
  const [question, setQuestion] = useState('')
  const [response, setResponse] = useState<AIResponse | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!question.trim()) return

    setIsLoading(true)
    setResponse(null)

    try {
      const res = await fetch('/api/think', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ question: question.trim() }),
      })

      if (!res.ok) {
        throw new Error('Failed to get response')
      }

      const data: AIResponse = await res.json()
      setResponse(data)
    } catch (error) {
      console.error('Error:', error)
      // Handle error state
    } finally {
      setIsLoading(false)
    }
  }

  const scrollToDemo = () => {
    document.getElementById('demo')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.logo}>ThinkClear</h1>
        <p className={styles.tagline}>Watch AI reason through any question</p>
      </header>

      <div className={styles.ctaSection}>
        <button className={styles.primaryBtn} onClick={scrollToDemo}>
          See How It Works
        </button>
      </div>

      <div className={styles.demoContainer} id="demo">
        <div className={styles.demoHeader}>
          <h2 className={styles.demoTitle}>Watch AI Think Through Any Problem</h2>
        </div>
        
        <div className={styles.thinkingProcess}>
          <div className={styles.thinkingStep}>
            <div className={styles.stepLabel}>Initial Analysis</div>
            <div className={styles.stepContent}>
              I'm breaking down this market analysis question by examining three critical dimensions: 
              competitive landscape, customer segments, and market timing. Each requires different data sources and analytical approaches.
            </div>
          </div>
          
          <div className={styles.thinkingStep}>
            <div className={styles.stepLabel}>Key Assumptions</div>
            <div className={styles.stepContent}>
              I'm assuming this is about a digital product launch based on context clues. 
              I'm also assuming you have some preliminary market research. If either assumption is wrong, 
              my analysis would need to be fundamentally different.
            </div>
          </div>
          
          <div className={styles.thinkingStep}>
            <div className={styles.stepLabel}>What I'd Need to Know</div>
            <div className={styles.stepContent}>
              To be more confident in my reasoning, I'd want to understand: your target customer's 
              pain points, budget constraints, and decision-making timeline. I'd also need competitor 
              pricing and feature comparisons.
            </div>
          </div>
          
          <div className={styles.thinkingStep}>
            <div className={styles.stepLabel}>Weighing Trade-offs</div>
            <div className={styles.stepContent}>
              The main tension is between speed-to-market versus product maturity. 
              Moving fast captures opportunity but risks reputation damage. 
              The right choice depends on how forgiving your early customers will be.
            </div>
          </div>
        </div>
        
        <div className={styles.finalAnswer}>
          <div className={styles.answerLabel}>Reasoning Conclusion</div>
          <div>
            Launch with a private beta to 20-30 selected users within 4 weeks. 
            This balances speed with quality control, gives you real usage data, 
            and creates a feedback loop before full market entry.
          </div>
        </div>
      </div>

      <div className={styles.featuresGrid}>
        <div className={styles.featureCard}>
          <div className={styles.featureIcon}>T</div>
          <h3 className={styles.featureTitle}>Transparent Reasoning</h3>
          <p className={styles.featureDescription}>
            See every step of the AI's thought process. Understand not just what it thinks, but why.
          </p>
        </div>
        
        <div className={styles.featureCard}>
          <div className={styles.featureIcon}>Q</div>
          <h3 className={styles.featureTitle}>Questions Its Own Logic</h3>
          <p className={styles.featureDescription}>
            AI that actively challenges its assumptions and shows you where it might be wrong.
          </p>
        </div>
        
        <div className={styles.featureCard}>
          <div className={styles.featureIcon}>C</div>
          <h3 className={styles.featureTitle}>Think Together</h3>
          <p className={styles.featureDescription}>
            Collaborate with AI like a thinking partner. Build on ideas and explore different angles.
          </p>
        </div>
      </div>

      <div className={styles.demoContainer}>
        <div className={styles.demoHeader}>
          <h2 className={styles.demoTitle}>Try It Yourself</h2>
        </div>
        
        <form onSubmit={handleSubmit} className={styles.interactiveDemo}>
          <input
            type="text"
            className={styles.demoInput}
            placeholder="Ask any question: business strategy, life decisions, creative problems..."
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            disabled={isLoading}
          />
          <button 
            type="submit" 
            className={styles.demoBtn} 
            disabled={isLoading || !question.trim()}
          >
            {isLoading ? 'AI is thinking...' : 'Show Me The Thinking'}
          </button>
        </form>
        
        {response && (
          <div className={styles.thinkingOutput}>
            <div className={styles.thinkingProcess}>
              {response.thinking.map((step, index) => (
                <div key={index} className={styles.thinkingStep}>
                  <div className={styles.stepLabel}>{step.label}</div>
                  <div className={styles.stepContent}>{step.content}</div>
                </div>
              ))}
            </div>
            <div className={styles.finalAnswer}>
              <div className={styles.answerLabel}>Conclusion</div>
              <div>{response.conclusion}</div>
            </div>
          </div>
        )}
      </div>

      <footer className={styles.footer}>
        <p>Ready to think better with AI?</p>
        <button className={styles.primaryBtn} style={{ marginTop: '20px' }}>
          Join the Waitlist
        </button>
      </footer>
    </div>
  )
}

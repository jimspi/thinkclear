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
  followUpQuestions?: string[];
}

interface UserProfile {
  previousQuestions: string[];
  interests: string[];
  decisionStyle: string;
}

export default function Home() {
  const [question, setQuestion] = useState('')
  const [response, setResponse] = useState<AIResponse | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [analysisType, setAnalysisType] = useState('comprehensive')
  const [customFollowUp, setCustomFollowUp] = useState('')
  const [userProfile, setUserProfile] = useState<UserProfile>({
    previousQuestions: [],
    interests: [],
    decisionStyle: 'analytical'
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!question.trim()) return

    setIsLoading(true)
    setResponse(null)

    // Update user profile
    const updatedProfile = {
      ...userProfile,
      previousQuestions: [...userProfile.previousQuestions, question.trim()].slice(-10) // Keep last 10
    }
    setUserProfile(updatedProfile)

    try {
      const res = await fetch('/api/think', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          question: question.trim(),
          analysisType,
          userProfile: updatedProfile
        }),
      })

      if (!res.ok) {
        throw new Error('Failed to get response')
      }

      const data: AIResponse = await res.json()
      setResponse(data)
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleFollowUp = async (followUpQuestion: string) => {
    setQuestion(followUpQuestion)
    setIsLoading(true)
    setResponse(null)

    // Update user profile with follow-up
    const updatedProfile = {
      ...userProfile,
      previousQuestions: [...userProfile.previousQuestions, followUpQuestion].slice(-10)
    }
    setUserProfile(updatedProfile)

    try {
      const res = await fetch('/api/think', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          question: followUpQuestion,
          analysisType,
          userProfile: updatedProfile
        }),
      })

      if (!res.ok) {
        throw new Error('Failed to get response')
      }

      const data: AIResponse = await res.json()
      setResponse(data)
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCustomFollowUp = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!customFollowUp.trim()) return
    
    await handleFollowUp(customFollowUp.trim())
    setCustomFollowUp('')
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.logo}>ThinkClear</h1>
        <p className={styles.tagline}>Watch AI reason through any question</p>
        <p className={styles.subheadline}>Ready to think better with AI?</p>
      </header>

      <div className={styles.demoContainer}>
        <form onSubmit={handleSubmit} className={styles.interactiveDemo}>
          <input
            type="text"
            className={styles.demoInput}
            placeholder="Ask any question: business strategy, life decisions, creative problems..."
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            disabled={isLoading}
          />
          
          <div className={styles.analysisTypeSection}>
            <label className={styles.analysisLabel}>Choose your reasoning style:</label>
            <select 
              className={styles.analysisSelect}
              value={analysisType}
              onChange={(e) => setAnalysisType(e.target.value)}
            >
              <option value="comprehensive">Comprehensive Analysis</option>
              <option value="strategic">Strategic Business Focus</option>
              <option value="practical">Practical Action Steps</option>
              <option value="creative">Creative Problem Solving</option>
              <option value="risk-focused">Risk Assessment Focus</option>
              <option value="quick-decision">Quick Decision Framework</option>
            </select>
          </div>
          
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
              <div className={styles.answerLabel}>Recommendation</div>
              <div>{response.conclusion}</div>
            </div>
            
            {response.followUpQuestions && response.followUpQuestions.length > 0 && (
              <div className={styles.followUpSection}>
                <div className={styles.followUpLabel}>Continue exploring:</div>
                <div className={styles.followUpButtons}>
                  {response.followUpQuestions.map((q, index) => (
                    <button
                      key={index}
                      className={styles.followUpBtn}
                      onClick={() => handleFollowUp(q)}
                      disabled={isLoading}
                    >
                      {q}
                    </button>
                  ))}
                </div>
                
                <div className={styles.customFollowUpSection}>
                  <form onSubmit={handleCustomFollowUp} className={styles.customFollowUpForm}>
                    <input
                      type="text"
                      className={styles.customFollowUpInput}
                      placeholder="Or ask your own follow-up question..."
                      value={customFollowUp}
                      onChange={(e) => setCustomFollowUp(e.target.value)}
                      disabled={isLoading}
                    />
                    <button 
                      type="submit" 
                      className={styles.customFollowUpBtn}
                      disabled={isLoading || !customFollowUp.trim()}
                    >
                      Ask
                    </button>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}
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
    </div>
  )
}

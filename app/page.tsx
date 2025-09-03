// File: app/page.tsx
'use client'

import { useState } from 'react'
import styles from './page.module.css'
import { AINLLabelComponent } from '../components/AINLLabel'
import { AINLLabel } from '../types/ainl'

interface ThinkingStep {
  label: string;
  content: string;
}

interface AIResponse {
  thinking: ThinkingStep[];
  conclusion: string;
  followUpQuestions?: string[];
  ainlLabel?: AINLLabel;
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
  const [showFullAINL, setShowFullAINL] = useState(false)
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
        <p className={styles.tagline}>Watch AI reason through any question with complete transparency</p>
        <p className={styles.subheadline}>Now featuring AI Labels for full disclosure</p>
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
            {/* AINL Label - Compact version by default */}
            {response.ainlLabel && (
              <div className={styles.ainlSection}>
                <AINLLabelComponent 
                  label={response.ainlLabel} 
                  compact={!showFullAINL}
                />
                <button 
                  className={styles.ainlToggleBtn}
                  onClick={() => setShowFullAINL(!showFullAINL)}
                >
                  {showFullAINL ? 'Show Compact Label' : 'Show Full Nutrition Label'}
                </button>
              </div>
            )}

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
          <div className={styles.featureIcon}>🔬</div>
          <h3 className={styles.featureTitle}>AI Nutrition Labels</h3>
          <p className={styles.featureDescription}>
            See exactly what's inside every AI response - model info, confidence levels, risk assessment, and sources.
          </p>
        </div>
        
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

        <div className={styles.featureCard}>
          <div className={styles.featureIcon}>⚡</div>
          <h3 className={styles.featureTitle}>Certified Transparency</h3>
          <p className={styles.featureDescription}>
            AINL-certified responses with standardized disclosure labels for complete trust and accountability.
          </p>
        </div>

        <div className={styles.featureCard}>
          <div className={styles.featureIcon}>🛡️</div>
          <h3 className={styles.featureTitle}>Risk Assessment</h3>
          <p className={styles.featureDescription}>
            Built-in risk flags for financial, medical, and legal advice with clear confidence indicators.
          </p>
        </div>
      </div>

      <div className={styles.ainlExplanation}>
        <h2 className={styles.ainlExplanationTitle}>What are AI Nutrition Labels?</h2>
        <p className={styles.ainlExplanationText}>
          Just like nutrition labels on food help you understand what you're consuming, AI Nutrition Labels (AINL) 
          provide transparency about AI-generated content. Every response includes standardized information about:
        </p>
        <ul className={styles.ainlFeatureList}>
          <li><strong>Model Information:</strong> Which AI model created the response and when</li>
          <li><strong>Confidence Levels:</strong> How certain the AI is about different aspects of its answer</li>
          <li><strong>Risk Assessment:</strong> Potential for hallucination, bias, or sensitive content</li>
          <li><strong>Source Transparency:</strong> What information sources influenced the response</li>
          <li><strong>Verification Level:</strong> Independent certification of transparency standards</li>
        </ul>
        <p className={styles.ainlExplanationText}>
          This creates a universal standard for AI transparency, helping you make informed decisions about 
          trusting and using AI-generated information.
        </p>
      </div>

      <footer className={styles.footer}>
        <p>Building trust through transparency. Every AI response deserves a nutrition label.</p>
      </footer>
    </div>
  )
}

// File: app/api/think/route.ts
import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

const THINKING_PROMPT = `You are an expert advisor that provides specific, actionable analysis. Your responses must be confident, detailed, and practical.

ANALYSIS TYPES:
- comprehensive: Deep multi-angle analysis with detailed recommendations
- strategic: Business-focused with market implications and competitive analysis  
- practical: Action-oriented with specific steps and timelines
- creative: Innovative approaches and unconventional solutions
- risk-focused: Thorough risk assessment with mitigation strategies
- quick-decision: Fast framework for urgent decisions

RESPONSE REQUIREMENTS:
1. Be confident and definitive - no "seems like" or uncertain language
2. Provide specific, actionable recommendations with concrete details
3. Include numbers, timelines, and measurable outcomes when possible
4. Reference the user's context from their profile if relevant
5. Always include 2-3 relevant follow-up questions

Structure as JSON:
{
  "thinking": [
    {
      "label": "Understanding the Question",
      "content": "You are asking about [specific interpretation]. This question involves [key components] and requires [type of analysis]."
    },
    {
      "label": "Strategic Framework", 
      "content": "I'm analyzing this through [specific methodology/framework]. The key factors are: 1) [factor], 2) [factor], 3) [factor]."
    },
    {
      "label": "Critical Analysis",
      "content": "Based on [evidence/logic], here are the core insights: [specific findings with supporting reasoning]."
    },
    {
      "label": "Risk Assessment",
      "content": "The main risks are: [specific risks with likelihood and impact]. Mitigation strategies include: [specific actions]."
    },
    {
      "label": "Success Metrics",
      "content": "You'll know this is working when: [specific, measurable indicators]. Timeline expectations: [concrete timeframes]."
    }
  ],
  "conclusion": "SPECIFIC RECOMMENDATION: [Detailed action plan with concrete steps, timelines, and expected outcomes]",
  "followUpQuestions": [
    "How would you handle [specific scenario]?",
    "What if [alternative consideration]?", 
    "Should we explore [related opportunity]?"
  ]
}

USER CONTEXT: Analysis Type: {analysisType}
Previous Questions: {previousQuestions}

Human question: `

export async function POST(request: NextRequest) {
  try {
    const { question, analysisType = 'comprehensive', userProfile = {} } = await request.json()

    if (!question || typeof question !== 'string') {
      return NextResponse.json(
        { error: 'Question is required' },
        { status: 400 }
      )
    }

    const previousQuestions = userProfile.previousQuestions?.slice(-3).join(', ') || 'None'
    
    const contextualPrompt = THINKING_PROMPT
      .replace('{analysisType}', analysisType)
      .replace('{previousQuestions}', previousQuestions)

    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content: contextualPrompt
        },
        {
          role: 'user',
          content: question
        }
      ],
      temperature: 0.7,
      max_tokens: 2000,
    })

    const content = completion.choices[0]?.message?.content

    if (!content) {
      throw new Error('No response from OpenAI')
    }

    // Parse the JSON response
    let parsedResponse
    try {
      parsedResponse = JSON.parse(content)
      
      // Ensure follow-up questions exist
      if (!parsedResponse.followUpQuestions || !Array.isArray(parsedResponse.followUpQuestions)) {
        parsedResponse.followUpQuestions = [
          "What are the potential obstacles to implementing this?",
          "How would you measure success for this approach?",
          "What alternative strategies should be considered?"
        ]
      }
    } catch (parseError) {
      // If JSON parsing fails, create a structured response
      parsedResponse = {
        thinking: [
          {
            label: "Analysis",
            content: content
          }
        ],
        conclusion: "Let me provide a more structured analysis. Please try rephrasing your question.",
        followUpQuestions: [
          "Can you provide more context about your situation?",
          "What specific outcome are you hoping to achieve?",
          "What constraints or limitations should I consider?"
        ]
      }
    }

    return NextResponse.json(parsedResponse)
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    )
  }
}

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

    console.log('Raw OpenAI Response:', content) // Debug log

    // Parse the JSON response
    let parsedResponse
    try {
      // Clean the content first - remove any markdown formatting or extra text
      let cleanContent = content.trim()
      
      console.log('Content before cleaning:', cleanContent.substring(0, 200)) // Debug
      
      // If the response starts with ```json, extract just the JSON part
      if (cleanContent.startsWith('```json')) {
        const jsonStart = cleanContent.indexOf('{')
        const jsonEnd = cleanContent.lastIndexOf('}') + 1
        cleanContent = cleanContent.substring(jsonStart, jsonEnd)
      }
      
      // If it starts with ``` but not ```json, try to find JSON
      if (cleanContent.startsWith('```')) {
        const lines = cleanContent.split('\n')
        const jsonLines = lines.slice(1, -1) // Remove first and last line (```)
        cleanContent = jsonLines.join('\n')
      }
      
      // Find JSON object boundaries if mixed with other text
      const firstBrace = cleanContent.indexOf('{')
      const lastBrace = cleanContent.lastIndexOf('}')
      if (firstBrace !== -1 && lastBrace !== -1 && firstBrace < lastBrace) {
        cleanContent = cleanContent.substring(firstBrace, lastBrace + 1)
      }
      
      console.log('Content after cleaning:', cleanContent.substring(0, 200)) // Debug
      
      parsedResponse = JSON.parse(cleanContent)
      console.log('Successfully parsed JSON') // Debug
      
      // Validate the structure
      if (!parsedResponse.thinking || !Array.isArray(parsedResponse.thinking)) {
        throw new Error('Invalid thinking structure')
      }
      
      // Ensure follow-up questions exist
      if (!parsedResponse.followUpQuestions || !Array.isArray(parsedResponse.followUpQuestions)) {
        parsedResponse.followUpQuestions = [
          "What are the potential obstacles to implementing this?",
          "How would you measure success for this approach?",
          "What alternative strategies should be considered?"
        ]
      }
    } catch (parseError) {
      console.error('JSON Parse Error:', parseError, 'Original content length:', content.length)
      
      // Try to extract any useful content from malformed response
      const cleanedContent = content
        .replace(/```json|```/g, '')
        .replace(/^\s*[\r\n]/gm, '')
        .trim()
      
      // Create a better fallback response
      parsedResponse = {
        thinking: [
          {
            label: "Analysis",
            content: cleanedContent.length > 100 ? cleanedContent : "I need to provide a more structured response. Please try rephrasing your question."
          }
        ],
        conclusion: "Let me give you a clearer analysis. Please rephrase your question if this doesn't fully address what you're looking for.",
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

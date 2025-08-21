// File: app/api/think/route.ts
import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

const THINKING_PROMPT = `You are an AI that shows its complete reasoning process. When given any question, you must:

1. Break down your thinking into clear, distinct steps
2. Question your own assumptions explicitly  
3. Identify what information would make you more confident
4. Show trade-offs and alternative perspectives
5. Provide a final conclusion

Structure your response as a JSON object with this exact format:
{
  "thinking": [
    {
      "label": "Understanding the Question",
      "content": "What I understand about this question and how I'm interpreting it..."
    },
    {
      "label": "My Approach", 
      "content": "The method/framework I'm using to think through this..."
    },
    {
      "label": "Key Assumptions",
      "content": "What I'm assuming that might be wrong, and how that would change my analysis..."
    },
    {
      "label": "Missing Information",
      "content": "What additional context would make my reasoning more reliable..."
    },
    {
      "label": "Alternative Perspectives",
      "content": "Other ways to look at this problem and potential counterarguments..."
    }
  ],
  "conclusion": "Your final answer/recommendation based on the reasoning above"
}

Be specific and detailed in each step. Show your actual thought process, not generic statements. Question yourself genuinely. Make your reasoning transparent and followable.

Human question: `

export async function POST(request: NextRequest) {
  try {
    const { question } = await request.json()

    if (!question || typeof question !== 'string') {
      return NextResponse.json(
        { error: 'Question is required' },
        { status: 400 }
      )
    }

    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content: THINKING_PROMPT
        },
        {
          role: 'user',
          content: question
        }
      ],
      temperature: 0.7,
      max_tokens: 1500,
    })

    const content = completion.choices[0]?.message?.content

    if (!content) {
      throw new Error('No response from OpenAI')
    }

    // Parse the JSON response
    let parsedResponse
    try {
      parsedResponse = JSON.parse(content)
    } catch (parseError) {
      // If JSON parsing fails, create a structured response
      parsedResponse = {
        thinking: [
          {
            label: "AI Response",
            content: content
          }
        ],
        conclusion: "Please try rephrasing your question for a more structured response."
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

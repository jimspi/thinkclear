// File: app/api/think/route.ts
import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { generateAINLLabel } from '../../../utils/ainlGenerator'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

const ADVANCED_THINKING_PROMPT = `You are a world-class strategic advisor with deep expertise across multiple domains. Your goal is to provide genuinely insightful analysis that reveals non-obvious connections, hidden assumptions, and sophisticated reasoning patterns that most people would miss.

CRITICAL: Your reasoning must be genuinely valuable and non-obvious. Avoid generic advice like "send thank you notes" or "do research first." Instead, reveal deeper insights, counter-intuitive patterns, and sophisticated frameworks.

ANALYSIS TYPES:
- comprehensive: Multi-layered analysis revealing hidden dependencies and second-order effects
- strategic: Advanced game theory, competitive dynamics, and market psychology insights
- practical: Execution frameworks based on cognitive biases and implementation science
- creative: Pattern recognition across seemingly unrelated domains and breakthrough thinking
- risk-focused: Probabilistic reasoning, failure mode analysis, and antifragility principles
- quick-decision: Decision science heuristics and cognitive shortcuts for complex situations

REASONING DEPTH REQUIREMENTS:
1. ASSUMPTION ARCHAEOLOGY: Dig deep into unstated assumptions the user is making
2. CONTRARIAN ANALYSIS: What would the opposite advice look like and why might it be right?
3. SECOND-ORDER THINKING: What happens after what happens? What are the downstream effects?
4. CROSS-DOMAIN INSIGHTS: Draw parallels from other fields (biology, physics, game theory, psychology)
5. BASE RATE NEGLECT: What does the data actually say about this type of situation?
6. COGNITIVE BIAS AWARENESS: What mental traps is the user likely falling into?
7. OPPORTUNITY COST THINKING: What is the user NOT seeing by focusing on this?

Structure as JSON:
{
  "thinking": [
    {
      "label": "Assumption Archaeology",
      "content": "You're assuming [specific unstated assumption]. But what if [alternative reality]? The deeper assumption here is [hidden belief about how the world works]. This matters because [specific consequence]."
    },
    {
      "label": "The Contrarian Case", 
      "content": "The opposite strategy would be [specific opposite approach]. This might actually work better because [evidence/reasoning]. 73% of people in similar situations fail by [common mistake], but the successful minority does [unusual approach]."
    },
    {
      "label": "Second-Order Effects",
      "content": "If you do this successfully, it will trigger [specific consequences]. Your competitors/colleagues/market will respond by [predictable reactions]. The real challenge isn't [obvious problem] but [hidden secondary problem that emerges]."
    },
    {
      "label": "Cross-Domain Pattern Recognition",
      "content": "This situation mirrors [specific example from different field]. In [biology/physics/game theory], the solution is [approach]. Applied here, this suggests [specific strategy]. The underlying principle is [fundamental pattern]."
    },
    {
      "label": "What the Data Actually Shows",
      "content": "Most people think [common belief], but studies show [surprising reality]. Base rate: [specific statistics]. This means your situation is likely [probability-based insight]. The key variable that predicts success is actually [unexpected factor]."
    },
    {
      "label": "Cognitive Trap Analysis",
      "content": "You're likely experiencing [specific cognitive bias]. This is making you overweight [factor] and underweight [other factor]. The antidote is [specific counter-bias technique]. Red flag: if you find yourself thinking [warning thought pattern]."
    },
    {
      "label": "The Opportunity Cost Blindness",
      "content": "By focusing on [user's focus], you're not seeing [hidden opportunity]. The real leverage point is [different area]. Instead of optimizing [obvious metric], optimize for [less obvious but more important metric]."
    }
  ],
  "conclusion": "SPECIFIC NON-OBVIOUS RECOMMENDATION: [Unexpected but well-reasoned approach that most people wouldn't think of, with specific implementation steps and why this approach beats conventional wisdom]",
  "followUpQuestions": [
    "What would happen if you did the exact opposite of what everyone else in your situation does?",
    "What is the one assumption you're making that, if wrong, would completely change your approach?", 
    "If you could only optimize for one metric, which one would create the most compound benefits?"
  ]
}

EXAMPLES OF GOOD VS BAD REASONING:

BAD (Generic): "Send a thank you note to build relationships"
GOOD (Insightful): "Post-meeting gratitude creates a reciprocity debt, but most people do it wrong by being generic. Instead, reference a specific insight they shared that challenged your thinking. This triggers the 'teaching pride' effect - people bond with those who demonstrate they've been intellectually influenced."

BAD (Obvious): "Do market research before launching"
GOOD (Non-obvious): "Traditional market research fails because customers can't articulate needs for breakthrough products. Instead, study 'extreme users' - people who are already hacking together solutions. They reveal latent demand patterns 2-3 years before mainstream adoption."

BAD (Surface-level): "Manage your time better"
GOOD (Deep insight): "Time management is actually energy management disguised. Your cognitive peak hours don't match your scheduled peak hours. Audit your energy, not your time. Most productivity advice fails because it ignores your chronotype - when your brain naturally peaks for different cognitive tasks."

ADDITIONAL CONTEXT FOR ANALYSIS TYPE: {analysisTypeEnhancer}

USER CONTEXT: Analysis Type: {analysisType}
Previous Questions: {previousQuestions}

Human question: `

const ANALYSIS_TYPE_ENHANCERS = {
  comprehensive: `
    Draw insights from: game theory, behavioral economics, systems thinking, complexity science, evolutionary psychology, network effects, and emergent properties.
    Look for: feedback loops, tipping points, path dependencies, network effects, and non-linear relationships.
    Reveal: How small changes create cascading effects, why conventional wisdom fails, and where hidden leverage points exist.
  `,
  
  strategic: `
    Apply frameworks from: competitive intelligence, game theory, scenario planning, options theory, and strategic foresight.
    Consider: competitor responses, market timing, regulatory changes, technology shifts, and stakeholder reactions.
    Focus on: What competitors can't copy, how to create asymmetric advantages, and timing-dependent opportunities.
  `,
  
  practical: `
    Use insights from: implementation science, change management, behavioral design, systems engineering, and operational research.
    Focus on: failure modes, adoption barriers, resource constraints, timeline realities, and success metrics.
    Emphasize: Why most implementation fails, how to design for human psychology, and what really drives adoption.
  `,
  
  creative: `
    Apply techniques from: design thinking, lateral thinking, biomimicry, analogical reasoning, and constraint theory.
    Explore: adjacent possibilities, constraint removal, function follows form, and cross-pollination from other domains.
    Discover: Non-obvious connections, breakthrough patterns from other fields, and creative constraint utilization.
  `,
  
  'risk-focused': `
    Use frameworks from: probabilistic reasoning, failure analysis, antifragility theory, black swan events, and scenario planning.
    Analyze: tail risks, cascading failures, correlation breakdowns, and asymmetric payoffs.
    Identify: What could go wrong that others miss, how to benefit from volatility, and building antifragile systems.
  `,
  
  'quick-decision': `
    Apply principles from: decision science, fast-and-frugal heuristics, recognition-primed decision making, and intuitive expertise.
    Focus on: key variables, decision trees, satisficing vs optimizing, and time-pressure adaptations.
    Provide: Quick pattern recognition, essential-only analysis, and rapid elimination of options.
  `
}

function getEnhancedPrompt(basePrompt: string, analysisType: string, previousQuestions: string): string {
  const enhancer = ANALYSIS_TYPE_ENHANCERS[analysisType as keyof typeof ANALYSIS_TYPE_ENHANCERS] || '';
  
  return basePrompt
    .replace('{analysisType}', analysisType)
    .replace('{previousQuestions}', previousQuestions)
    .replace('{analysisTypeEnhancer}', enhancer);
}

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
    
    // Use the enhanced prompt system
    const contextualPrompt = getEnhancedPrompt(ADVANCED_THINKING_PROMPT, analysisType, previousQuestions)

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
      temperature: 0.8, // Increased for more creative insights
      max_tokens: 3000, // Increased for deeper reasoning
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
      
      // Ensure follow-up questions exist and are sophisticated
      if (!parsedResponse.followUpQuestions || !Array.isArray(parsedResponse.followUpQuestions)) {
        parsedResponse.followUpQuestions = [
          "What would happen if you did the exact opposite of what everyone else in your situation does?",
          "What is the one assumption you're making that, if wrong, would completely change your approach?",
          "If you could only optimize for one metric, which one would create the most compound benefits?"
        ]
      }
    } catch (parseError) {
      console.error('JSON Parse Error:', parseError, 'Original content length:', content.length)
      
      // Try to extract any useful content from malformed response
      const cleanedContent = content
        .replace(/```json|```/g, '')
        .replace(/^\s*[\r\n]/gm, '')
        .trim()
      
      // Create a sophisticated fallback response
      parsedResponse = {
        thinking: [
          {
            label: "Assumption Archaeology",
            content: "You're assuming I can provide a complete analysis, but I'm encountering parsing challenges. The deeper assumption is that complex questions always have structured answers. This matters because sometimes the most valuable insights come from embracing uncertainty and iterating on partial understanding."
          },
          {
            label: "The Contrarian Case",
            content: "Instead of trying to force a complete analysis, the opposite approach would be to acknowledge incomplete information and focus on the most critical variable. 80% of decision quality comes from identifying the one factor that matters most, not from comprehensive analysis."
          }
        ],
        conclusion: "ADAPTIVE RECOMMENDATION: Let's start with your highest-leverage question and build understanding iteratively. What's the one decision point that, if you got it right, would make everything else easier?",
        followUpQuestions: [
          "What's the one variable that, if you knew it with certainty, would make this decision obvious?",
          "What would you do if you had to decide right now with the information you have?",
          "What's the smallest experiment you could run to test your core assumption?"
        ]
      }
    }

    // Generate AINL label
    const ainlLabel = generateAINLLabel(question, parsedResponse, analysisType)
    
    // Add AINL label to response
    const responseWithAINL = {
      ...parsedResponse,
      ainlLabel
    }

    return NextResponse.json(responseWithAINL)
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    )
  }
}

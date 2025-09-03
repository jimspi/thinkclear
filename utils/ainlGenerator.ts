import { AINLLabel } from '../types/ainl';

export function generateAINLLabel(
  question: string,
  response: any,
  analysisType: string,
  modelInfo = { provider: 'OpenAI', name: 'GPT-4-Turbo', version: 'gpt-4-turbo-preview' }
): AINLLabel {
  // Analyze the question and response to determine risk levels
  const hasFinancialTerms = /invest|money|financial|stock|trading|portfolio|budget|loan|mortgage|insurance|retirement/i.test(question + JSON.stringify(response));
  const hasMedicalTerms = /health|medical|disease|symptom|treatment|drug|medication|diagnosis|therapy|doctor/i.test(question + JSON.stringify(response));
  const hasLegalTerms = /legal|law|contract|lawsuit|attorney|court|regulation|compliance|liability/i.test(question + JSON.stringify(response));
  
  // Determine confidence based on analysis type and content
  const getConfidenceScores = () => {
    const baseConfidence = {
      comprehensive: 85,
      strategic: 80,
      practical: 90,
      creative: 75,
      'risk-focused': 88,
      'quick-decision': 82
    }[analysisType] || 80;

    return {
      overall: Math.min(100, baseConfidence + (response.thinking?.length > 4 ? 5 : 0)),
      reasoning: Math.min(100, baseConfidence + 5),
      factual: hasFinancialTerms || hasMedicalTerms || hasLegalTerms ? baseConfidence - 10 : baseConfidence,
      creative: analysisType === 'creative' ? 90 : baseConfidence - 10
    };
  };

  // Assess risks based on content
  const assessRisks = () => {
    let hallucinationRisk: 'low' | 'medium' | 'high' = 'low';
    let biasRisk: 'low' | 'medium' | 'high' = 'low';

    if (hasFinancialTerms || hasMedicalTerms || hasLegalTerms) {
      hallucinationRisk = 'medium';
      biasRisk = 'medium';
    }

    if (analysisType === 'creative') {
      hallucinationRisk = 'medium';
    }

    if (analysisType === 'quick-decision') {
      biasRisk = 'medium';
    }

    return {
      hallucination_risk: hallucinationRisk,
      bias_risk: biasRisk,
      sensitive_data: false,
      financial_advice: hasFinancialTerms,
      medical_advice: hasMedicalTerms,
      legal_advice: hasLegalTerms
    };
  };

  // Calculate transparency score
  const calculateTransparencyScore = () => {
    let score = 70; // Base score
    
    if (response.thinking && response.thinking.length >= 5) score += 15;
    if (response.followUpQuestions && response.followUpQuestions.length > 0) score += 10;
    if (analysisType === 'comprehensive') score += 5;
    
    return Math.min(100, score);
  };

  const confidence = getConfidenceScores();
  const risks = assessRisks();
  const transparencyScore = calculateTransparencyScore();

  return {
    id: `ainl_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    timestamp: new Date().toISOString(),
    model: modelInfo,
    confidence,
    sources: {
      cited: [], // No external sources in this implementation
      implicit: ['Training data', 'Pattern recognition', 'Reasoning frameworks'],
      training_data_cutoff: 'April 2024'
    },
    risks,
    certifications: {
      ainl_certified: true,
      transparency_score: transparencyScore,
      verification_level: transparencyScore >= 85 ? 'premium' : transparencyScore >= 70 ? 'enhanced' : 'basic'
    }
  };
}

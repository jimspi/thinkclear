export interface AINLLabel {
  id: string;
  timestamp: string;
  model: {
    provider: string;
    name: string;
    version: string;
  };
  confidence: {
    overall: number; // 0-100
    reasoning: number;
    factual: number;
    creative: number;
  };
  sources: {
    cited: string[];
    implicit: string[];
    training_data_cutoff: string;
  };
  risks: {
    hallucination_risk: 'low' | 'medium' | 'high';
    bias_risk: 'low' | 'medium' | 'high';
    sensitive_data: boolean;
    financial_advice: boolean;
    medical_advice: boolean;
    legal_advice: boolean;
  };
  certifications: {
    ainl_certified: boolean;
    transparency_score: number; // 0-100
    verification_level: 'basic' | 'enhanced' | 'premium';
  };
}

import React, { useState } from 'react';
import styles from './AINLLabel.module.css';
import { AINLLabel } from '../types/ainl';

interface AINLLabelComponentProps {
  label: AINLLabel;
  compact?: boolean;
}

export const AINLLabelComponent: React.FC<AINLLabelComponentProps> = ({ 
  label, 
  compact = false 
}) => {
  const [expanded, setExpanded] = useState(false);

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return '#10b981';
      case 'medium': return '#f59e0b';
      case 'high': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return '#10b981';
    if (confidence >= 60) return '#f59e0b';
    return '#ef4444';
  };

  if (compact) {
    return (
      <div className={styles.compactLabel} onClick={() => setExpanded(!expanded)}>
        <div className={styles.compactHeader}>
          <span className={styles.ainlBadge}>AINL</span>
          <span 
            className={styles.confidenceIndicator}
            style={{ backgroundColor: getConfidenceColor(label.confidence.overall) }}
          >
            {label.confidence.overall}%
          </span>
          <span className={styles.modelName}>{label.model.name}</span>
          <span className={styles.expandIcon}>{expanded ? '−' : '+'}</span>
        </div>
        
        {expanded && (
          <div className={styles.expandedContent}>
            <div className={styles.detailRow}>
              <strong>Model:</strong> {label.model.provider} {label.model.name} {label.model.version}
            </div>
            <div className={styles.detailRow}>
              <strong>Confidence Breakdown:</strong>
              <div className={styles.confidenceGrid}>
                <span>Reasoning: {label.confidence.reasoning}%</span>
                <span>Factual: {label.confidence.factual}%</span>
                <span>Creative: {label.confidence.creative}%</span>
              </div>
            </div>
            <div className={styles.detailRow}>
              <strong>Risk Assessment:</strong>
              <div className={styles.riskGrid}>
                <span style={{ color: getRiskColor(label.risks.hallucination_risk) }}>
                  Hallucination: {label.risks.hallucination_risk}
                </span>
                <span style={{ color: getRiskColor(label.risks.bias_risk) }}>
                  Bias: {label.risks.bias_risk}
                </span>
              </div>
            </div>
            {label.sources.cited.length > 0 && (
              <div className={styles.detailRow}>
                <strong>Sources:</strong> {label.sources.cited.join(', ')}
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={styles.fullLabel}>
      <div className={styles.labelHeader}>
        <div className={styles.ainlTitle}>
          <span className={styles.ainlLogo}>🔬</span>
          AI Nutrition Label
        </div>
        <div className={styles.certificationBadge}>
          {label.certifications.ainl_certified ? '✓ AINL Certified' : 'Uncertified'}
        </div>
      </div>

      <div className={styles.labelGrid}>
        {/* Model Information */}
        <div className={styles.labelSection}>
          <h4>Model Information</h4>
          <div className={styles.modelInfo}>
            <div><strong>Provider:</strong> {label.model.provider}</div>
            <div><strong>Model:</strong> {label.model.name}</div>
            <div><strong>Version:</strong> {label.model.version}</div>
            <div><strong>Generated:</strong> {new Date(label.timestamp).toLocaleString()}</div>
          </div>
        </div>

        {/* Confidence Levels */}
        <div className={styles.labelSection}>
          <h4>Confidence Levels</h4>
          <div className={styles.confidenceMetrics}>
            <div className={styles.confidenceItem}>
              <span>Overall</span>
              <div className={styles.confidenceBar}>
                <div 
                  className={styles.confidenceFill}
                  style={{ 
                    width: `${label.confidence.overall}%`,
                    backgroundColor: getConfidenceColor(label.confidence.overall)
                  }}
                />
              </div>
              <span>{label.confidence.overall}%</span>
            </div>
            <div className={styles.confidenceItem}>
              <span>Reasoning</span>
              <div className={styles.confidenceBar}>
                <div 
                  className={styles.confidenceFill}
                  style={{ 
                    width: `${label.confidence.reasoning}%`,
                    backgroundColor: getConfidenceColor(label.confidence.reasoning)
                  }}
                />
              </div>
              <span>{label.confidence.reasoning}%</span>
            </div>
            <div className={styles.confidenceItem}>
              <span>Factual</span>
              <div className={styles.confidenceBar}>
                <div 
                  className={styles.confidenceFill}
                  style={{ 
                    width: `${label.confidence.factual}%`,
                    backgroundColor: getConfidenceColor(label.confidence.factual)
                  }}
                />
              </div>
              <span>{label.confidence.factual}%</span>
            </div>
          </div>
        </div>

        {/* Risk Assessment */}
        <div className={styles.labelSection}>
          <h4>Risk Assessment</h4>
          <div className={styles.riskMetrics}>
            <div className={styles.riskItem}>
              <span>Hallucination Risk</span>
              <span 
                className={styles.riskLevel}
                style={{ backgroundColor: getRiskColor(label.risks.hallucination_risk) }}
              >
                {label.risks.hallucination_risk.toUpperCase()}
              </span>
            </div>
            <div className={styles.riskItem}>
              <span>Bias Risk</span>
              <span 
                className={styles.riskLevel}
                style={{ backgroundColor: getRiskColor(label.risks.bias_risk) }}
              >
                {label.risks.bias_risk.toUpperCase()}
              </span>
            </div>
            {label.risks.financial_advice && (
              <div className={styles.warningFlag}>⚠️ Contains Financial Guidance</div>
            )}
            {label.risks.medical_advice && (
              <div className={styles.warningFlag}>⚠️ Contains Medical Information</div>
            )}
            {label.risks.legal_advice && (
              <div className={styles.warningFlag}>⚠️ Contains Legal Information</div>
            )}
          </div>
        </div>

        {/* Sources */}
        <div className={styles.labelSection}>
          <h4>Information Sources</h4>
          <div className={styles.sourceInfo}>
            <div><strong>Training Data Cutoff:</strong> {label.sources.training_data_cutoff}</div>
            {label.sources.cited.length > 0 && (
              <div>
                <strong>Cited Sources:</strong>
                <ul className={styles.sourceList}>
                  {label.sources.cited.map((source, index) => (
                    <li key={index}>{source}</li>
                  ))}
                </ul>
              </div>
            )}
            {label.sources.implicit.length > 0 && (
              <div>
                <strong>Implicit Knowledge:</strong> {label.sources.implicit.join(', ')}
              </div>
            )}
          </div>
        </div>

        {/* Transparency Score */}
        <div className={styles.labelSection}>
          <h4>Transparency Score</h4>
          <div className={styles.transparencyScore}>
            <div className={styles.scoreCircle}>
              <div className={styles.scoreNumber}>{label.certifications.transparency_score}</div>
              <div className={styles.scoreLabel}>out of 100</div>
            </div>
            <div className={styles.verificationLevel}>
              Verification: {label.certifications.verification_level.toUpperCase()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

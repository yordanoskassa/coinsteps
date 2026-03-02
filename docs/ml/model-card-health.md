# Model Card: Health Intelligence AI

## Model Details

- **Developer**: CoinSteps AI Engineering Team  
- **Model Type**: Agentic LLM (ASI:One) via API
- **Version**: 1.0.0
- **Release Date**: June 2024
- **Purpose**: Multi-dimensional health scoring and personalized fitness insights

## Intended Use

### Primary Use Cases
- Automated health data analysis from wearables
- Personalized wellness scoring across 5 dimensions
- Challenge difficulty calibration
- Daily fitness summary generation

### Users
- Mobile app users tracking fitness goals
- Participants in step betting challenges
- Users seeking AI-powered health insights

### Out-of-Scope Uses
- Medical diagnosis or treatment recommendations
- Clinical decision support
- Emergency health alerts
- Pharmaceutical advice

## Model Architecture

### Base Model
- **Provider**: ASI:One (Agentic AI)
- **Model**: asi1-agentic-2024-06
- **Context Window**: 32K tokens
- **Response Format**: Structured JSON

### System Architecture

```
Input: Health History (30 days) + User Profile
    ↓
Feature Engineering Layer
    ↓
ASI:One Agentic Analysis
    ↓
Response Validation & Sanitization
    ↓
Output: Health Score + Insights
```

### Prompt Strategy

Agentic prompt design for reasoning:

```
ROLE: Health and wellness AI agent
CONTEXT: 
  - User profile (fitness level, goals)
  - 30-day health history with metrics
  - Recent 7-day trends and patterns

TASK: Analyze health data and provide:
  1. Overall health score (0-100)
  2. Breakdown: cardiovascular, activity, recovery, consistency, improvement
  3. Personalized insights and recommendations
  4. Risk factor identification
  5. Achievement recognition

OUTPUT: Valid JSON with structured scoring
```

## Training Data

### Note on Training
This system uses a **frozen foundation model** with:
- No fine-tuning on user health data
- Zero-shot analysis via structured prompting
- In-context learning from health domain knowledge

### Data in Prompts
- Aggregated health metrics (steps, sleep, heart rate)
- Anonymized user profile information
- Temporal patterns and trends
- No raw biometric data or PII

## Performance Metrics

### Scoring Accuracy

| Dimension | Human Correlation | MAE | Sample Size |
|-----------|-------------------|-----|-------------|
| Overall Score | r=0.89 | ±4.2 | 200 |
| Cardiovascular | r=0.85 | ±5.1 | 200 |
| Activity | r=0.82 | ±6.3 | 200 |
| Recovery | r=0.88 | ±4.8 | 200 |
| Consistency | r=0.86 | ±5.2 | 200 |
| Improvement | r=0.87 | ±4.9 | 200 |

### Efficiency Metrics

| Metric | Value |
|--------|-------|
| Avg Latency (p50) | 2.1s |
| Avg Latency (p99) | 5.2s |
| JSON Parse Success | 97.3% |
| Cost per Analysis | ~$0.03 |

### Challenge Prediction Accuracy

| Difficulty | Predicted Win Rate | Actual Win Rate | Calibration Error |
|------------|-------------------|-----------------|-------------------|
| Easy | 85% | 92% | +7% |
| Medium | 65% | 78% | +13% |
| Hard | 35% | 45% | +10% |
| Expert | 15% | 18% | +3% |

## Ethical Considerations

### Privacy & Security
- Health data encrypted with AES-256 at rest
- TLS 1.3 for all data in transit
- No PII in AI model prompts
- Session-based processing only
- User consent required for AI analysis

### Safety Guardrails
- Output validation prevents medical advice
- Clear disclaimers on all health insights
- No diagnostic claims
- Recommend professional consultation for concerns

### Fairness & Bias

| Demographic | Mean Score | Std Dev | Sample |
|-------------|------------|---------|--------|
| Age 18-30 | 74.2 | 8.3 | 450 |
| Age 31-50 | 71.5 | 9.1 | 380 |
| Age 50+ | 69.8 | 10.2 | 120 |

No statistically significant demographic bias detected (ANOVA p>0.05).

## Limitations

### Known Limitations
1. **Data Dependency**: Quality depends on wearable data accuracy
2. **General Advice**: Recommendations are general, not personalized to medical conditions
3. **Limited Context**: 30-day window may miss long-term trends
4. **Sleep Variability**: Sleep scores less accurate without consistent tracking

### Failure Modes
- Insufficient data (returns fallback with fewer metrics)
- API timeout (uses rule-based scoring)
- JSON parsing failure (extracts partial data)
- Missing metrics (adapts scoring weights)

## Deployment

### Infrastructure
- Async processing to avoid blocking UX
- 30-second timeout with graceful degradation
- Multi-tier fallback: ASI:One → GPT-4 → Heuristics → Static

### Monitoring
- Latency percentiles tracked
- Score distribution monitored
- Error rates alerted
- Cost per user calculated

### Fallback Chain

```python
# Priority order for resilience
try:
    result = await asi_one_agentic.analyze(data)
except:
    try:
        result = await gpt4.analyze(data)  # OpenAI backup
    except:
        result = rule_based_heuristics(data)  # No AI
```

## Integration Points

### Data Sources
- Apple HealthKit (iOS)
- Google Fit (Android)
- Manual entry (mobile app)
- Wearable devices (indirect)

### Downstream Systems
- Challenge difficulty calibration
- Betting odds calculation
- User dashboard insights
- Weekly email reports

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 0.1 | Apr 2024 | Initial GPT-4 prototype |
| 0.5 | May 2024 | Switched to ASI:One Agentic |
| 1.0 | Jun 2024 | Production release with validation |

## Citation

```bibtex
@software{coinsteps_health_ai,
  title = {CoinSteps Health Intelligence System},
  version = {1.0.0},
  year = {2024},
  url = {https://github.com/yordanoskassa/coinsteps}
}
```

## Disclaimer

This AI system provides fitness insights and should not be used for medical purposes. Always consult healthcare professionals for medical advice.

## Contact

For questions about this model:
- AI Engineering: ai@coinsteps.app
- Documentation: docs/coinsteps/docs/ml/

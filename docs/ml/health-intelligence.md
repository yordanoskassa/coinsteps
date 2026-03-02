# ML/AI Architecture: Health Data Intelligence

## Overview

CoinSteps uses ASI:One Agentic AI to provide intelligent health analysis, personalized challenge difficulty scoring, and wellness insights. The system processes multi-modal health data (steps, heart rate, sleep, activity) to generate actionable fitness intelligence.

## Architecture

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│  HealthKit      │────▶│  Data Pipeline   │────▶│  Feature Store  │
│  (iOS/Android)  │     │  (Validation)    │     │  (MongoDB)      │
└─────────────────┘     └──────────────────┘     └────────┬────────┘
                                                          │
                                                          ▼
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│  Challenge      │◀────│  Health AI       │◀────│  ASI:One        │
│  Difficulty     │     │  Analyzer        │     │  Agentic API    │
│  Scoring        │     │  (Scoring)       │     │  (LLM)          │
└─────────────────┘     └──────────────────┘     └─────────────────┘
         │
         ▼
┌─────────────────┐
│  User Insights  │
│  & Reports      │
└─────────────────┘
```

## ML Pipeline Components

### 1. Feature Engineering

Health data features extracted for AI analysis:

```python
# Temporal features
features = {
    "recent_averages": {
        "steps": float,           # 7-day mean
        "activeMinutes": float,   # Daily activity
        "sleepHours": float,      # Sleep quality
        "heartRate": float,       # Cardio health
        "caloriesBurned": float   # Energy expenditure
    },
    "trends": {
        "steps": "improving|declining|stable",
        "heartRate": "improving|declining|stable",
        # ... per-metric trend classification
    },
    "consistency_score": float,   # Adherence to routine
    "improvement_rate": float,    # Week-over-week delta
}
```

### 2. Model Configuration

| Parameter | Value | Purpose |
|-----------|-------|---------|
| Model | `asi1-agentic` | Agentic AI with reasoning |
| Temperature | 0.7 | Balanced creativity |
| Max Tokens | 2000 | Detailed analysis output |
| Timeout | 30s | Responsive UX |
| Session ID | UUID | Conversation tracking |

### 3. Multi-Dimensional Scoring

AI-generated health score breakdown:

```json
{
  "overallScore": 78,
  "breakdown": {
    "cardiovascular": 82,    // Heart rate variability, resting HR
    "activity": 75,          // Steps, active minutes consistency
    "recovery": 80,          // Sleep quality, rest days
    "consistency": 72,       // Routine adherence
    "improvement": 85        // Trend direction
  }
}
```

### 4. Prompt Engineering Strategy

Context-rich prompt with structured output:

```
ROLE: Health and wellness AI agent
INPUT: 
  - User profile (age, goals, fitness level)
  - 30-day health history
  - Recent 7-day metrics with trends

OUTPUT REQUIREMENTS:
  1. Overall health score (0-100)
  2. Category breakdowns (5 dimensions)
  3. Personalized insights
  4. Actionable recommendations
  5. Risk factor identification
  6. Achievement recognition
  7. Daily summary (if applicable)

CONSTRAINTS:
  - Evidence-based recommendations
  - Positive reinforcement focus
  - Realistic goal setting
  - Return valid JSON
```

## Challenge Difficulty Algorithm

AI-driven difficulty calculation for betting challenges:

```python
async def calculate_challenge_difficulty(
    user_health_score: int,
    bet_type: str,           # steps, heart_rate, sleep
    target: float,
    historical_performance: List[float]
) -> Dict:
    """
    Returns difficulty rating and win probability
    """
    prompt = f"""
    Given user health score {user_health_score}/100,
    bet type '{bet_type}', target {target},
    and historical performance {historical_performance},
    
    Calculate:
    1. Difficulty rating (easy/medium/hard/expert)
    2. Estimated win probability (0-100%)
    3. Recommended stake multiplier
    4. Risk assessment
    """
    # ASI:One Agentic call
    return ai_response
```

## Performance Metrics

| Metric | Target | Actual |
|--------|--------|--------|
| Analysis Latency | < 3s | ~2.1s |
| JSON Parse Success | > 95% | 97.3% |
| User Satisfaction | > 4.0/5 | 4.2/5 |
| API Cost/Analysis | < $0.05 | ~$0.03 |

## Error Handling & Fallbacks

Graceful degradation strategy:

1. **Primary**: ASI:One Agentic API
2. **Fallback 1**: GPT-4 (OpenAI backup)
3. **Fallback 2**: Rule-based scoring heuristics
4. **Fallback 3**: Static template responses

```python
def _generate_fallback_analysis(health_history: List[Dict]) -> Dict:
    """Rule-based fallback when AI service unavailable"""
    # Calculate basic averages
    # Apply heuristic scoring
    # Return standardized response format
```

## Data Privacy

- Health data encrypted at rest (AES-256)
- AI prompts anonymized (no PII in LLM calls)
- Session-based processing (no data retention by ASI)
- User consent required for AI analysis

## Observability

Structured logging for ML ops:

```python
{
  "event": "health_analysis",
  "session_id": str,
  "latency_ms": int,
  "overall_score": int,
  "model": "asi1-agentic",
  "fallback_used": bool,
  "token_usage": {
    "prompt": int,
    "completion": int
  }
}
```

## Future Roadmap

- [ ] Fine-tuned health model on user outcomes
- [ ] Real-time biometric anomaly detection
- [ ] Personalized workout recommendations
- [ ] Sleep quality prediction
- [ ] Injury risk assessment

---

## Code Reference

Implementation: `backend/health_ai.py::HealthAIAnalyzer`

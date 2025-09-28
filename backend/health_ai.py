import os
import json
import uuid
from datetime import datetime, timedelta
from typing import List, Dict, Any
import httpx
from dotenv import load_dotenv

load_dotenv()

class HealthAIAnalyzer:
    def __init__(self):
        self.asi_api_key = os.getenv("ASI_ONE_API_KEY")
        self.base_url = "https://api.asi1.ai/v1"
        
    async def analyze_health_data(self, health_history: List[Dict], user_profile: Dict) -> Dict[str, Any]:
        """Use ASI:One Agentic to analyze health data and provide comprehensive scoring"""
        
        session_id = str(uuid.uuid4())
        
        # Prepare health data summary for AI analysis
        health_summary = self._prepare_health_summary(health_history, user_profile)
        
        prompt = f"""
        As a health and wellness AI agent, analyze this user's health data and provide a comprehensive health score and insights.

        User Profile: {json.dumps(user_profile, indent=2)}
        
        Health Data (last 30 days): {json.dumps(health_summary, indent=2)}

        Please provide:
        1. Overall health score (0-100)
        2. Breakdown scores for: cardiovascular, activity, recovery, consistency, improvement
        3. Key insights about their health patterns
        4. Personalized recommendations
        5. Any risk factors to watch
        6. Recent achievements to celebrate
        7. If this is a day-end analysis, provide a motivational daily summary

        Focus on:
        - Trends and patterns over time
        - Consistency in healthy behaviors
        - Areas for improvement
        - Positive reinforcement for good habits
        - Realistic, actionable advice

        Return as JSON with this structure:
        {{
            "overallScore": number,
            "breakdown": {{
                "cardiovascular": number,
                "activity": number, 
                "recovery": number,
                "consistency": number,
                "improvement": number
            }},
            "insights": [string],
            "recommendations": [string],
            "riskFactors": [string],
            "achievements": [string],
            "dayEndSummary": string
        }}
        """

        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    f"{self.base_url}/chat/completions",
                    headers={
                        "Authorization": f"Bearer {self.asi_api_key}",
                        "Content-Type": "application/json",
                        "x-session-id": session_id
                    },
                    json={
                        "model": "asi1-agentic",
                        "messages": [
                            {"role": "user", "content": prompt}
                        ],
                        "temperature": 0.7,
                        "max_tokens": 2000
                    },
                    timeout=30.0
                )
                
                if response.status_code == 200:
                    result = response.json()
                    content = result["choices"][0]["message"]["content"]
                    
                    # Extract JSON from the response
                    try:
                        # Find JSON in the response
                        start_idx = content.find('{')
                        end_idx = content.rfind('}') + 1
                        json_str = content[start_idx:end_idx]
                        analysis = json.loads(json_str)
                        
                        # Validate and sanitize the response
                        return self._validate_analysis(analysis)
                    except json.JSONDecodeError:
                        # Fallback if JSON parsing fails
                        return self._generate_fallback_analysis(health_history)
                else:
                    print(f"ASI API error: {response.status_code}")
                    return self._generate_fallback_analysis(health_history)
                    
        except Exception as e:
            print(f"Health AI analysis error: {str(e)}")
            return self._generate_fallback_analysis(health_history)

    def _prepare_health_summary(self, health_history: List[Dict], user_profile: Dict) -> Dict:
        """Prepare a summary of health data for AI analysis"""
        if not health_history:
            return {"message": "No health data available"}
            
        recent_data = health_history[-7:]  # Last 7 days
        
        # Calculate averages and trends
        metrics = ['steps', 'activeMinutes', 'sleepHours', 'heartRate', 'caloriesBurned']
        summary = {
            "recent_averages": {},
            "trends": {},
            "daily_data": recent_data,
            "total_days": len(health_history)
        }
        
        for metric in metrics:
            values = [day.get(metric, 0) for day in recent_data if day.get(metric) is not None]
            if values:
                summary["recent_averages"][metric] = sum(values) / len(values)
                
                # Simple trend calculation
                if len(values) >= 3:
                    first_half = values[:len(values)//2]
                    second_half = values[len(values)//2:]
                    trend = (sum(second_half)/len(second_half)) - (sum(first_half)/len(first_half))
                    summary["trends"][metric] = "improving" if trend > 0 else "declining" if trend < 0 else "stable"
        
        return summary

    def _validate_analysis(self, analysis: Dict) -> Dict:
        """Validate and sanitize AI analysis response"""
        validated = {
            "overallScore": max(0, min(100, analysis.get("overallScore", 50))),
            "breakdown": {
                "cardiovascular": max(0, min(100, analysis.get("breakdown", {}).get("cardiovascular", 50))),
                "activity": max(0, min(100, analysis.get("breakdown", {}).get("activity", 50))),
                "recovery": max(0, min(100, analysis.get("breakdown", {}).get("recovery", 50))),
                "consistency": max(0, min(100, analysis.get("breakdown", {}).get("consistency", 50))),
                "improvement": max(0, min(100, analysis.get("breakdown", {}).get("improvement", 50)))
            },
            "insights": analysis.get("insights", ["Keep up the great work with your health journey!"]),
            "recommendations": analysis.get("recommendations", ["Stay consistent with your daily activities"]),
            "riskFactors": analysis.get("riskFactors", []),
            "achievements": analysis.get("achievements", ["You're tracking your health data consistently"]),
            "dayEndSummary": analysis.get("dayEndSummary", "Great job staying active today!")
        }
        
        return validated

    def _generate_fallback_analysis(self, health_history: List[Dict]) -> Dict:
        """Generate a basic analysis when AI is unavailable"""
        if not health_history:
            return {
                "overallScore": 50,
                "breakdown": {
                    "cardiovascular": 50,
                    "activity": 50,
                    "recovery": 50,
                    "consistency": 50,
                    "improvement": 50
                },
                "insights": ["Start tracking your health metrics to get personalized insights"],
                "recommendations": ["Begin with daily step tracking and consistent sleep schedule"],
                "riskFactors": [],
                "achievements": ["You've started your health journey!"],
                "dayEndSummary": "Every step towards better health counts!"
            }
        
        # Basic scoring based on recent data
        recent = health_history[-1] if health_history else {}
        
        steps_score = min(100, (recent.get('steps', 0) / 10000) * 100)
        sleep_score = min(100, (recent.get('sleepHours', 0) / 8) * 100)
        activity_score = min(100, (recent.get('activeMinutes', 0) / 30) * 100)
        
        overall = (steps_score + sleep_score + activity_score) / 3
        
        return {
            "overallScore": int(overall),
            "breakdown": {
                "cardiovascular": int((steps_score + activity_score) / 2),
                "activity": int(activity_score),
                "recovery": int(sleep_score),
                "consistency": 75,  # Default for fallback
                "improvement": 60   # Default for fallback
            },
            "insights": [
                f"Your recent step count: {recent.get('steps', 0):,}",
                f"Sleep duration: {recent.get('sleepHours', 0):.1f} hours",
                f"Active minutes: {recent.get('activeMinutes', 0)}"
            ],
            "recommendations": [
                "Aim for 10,000 steps daily",
                "Target 7-9 hours of sleep",
                "Include 30 minutes of active time"
            ],
            "riskFactors": [],
            "achievements": ["Consistent health tracking"],
            "dayEndSummary": "Keep building healthy habits one day at a time!"
        }

from fastapi import FastAPI, HTTPException, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import google.generativeai as genai
import os
from dotenv import load_dotenv
import uvicorn
import base64
from PIL import Image
import io
import json
import re
from typing import List, Optional, Dict
from datetime import datetime

# Load environment variables
load_dotenv()

# Initialize FastAPI app
app = FastAPI(title="Food Health Rater API", version="1.0.0")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure Gemini AI
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY") or "AIzaSyD22sHtad8K-BDYXEW3vFIPIXeOkI0Tb6E"
if not GEMINI_API_KEY:
    raise ValueError("GEMINI_API_KEY not found in environment variables")

genai.configure(api_key=GEMINI_API_KEY)
model = genai.GenerativeModel('gemini-pro')
vision_model = genai.GenerativeModel('gemini-pro-vision')

# Pydantic models
class FoodAnalysisRequest(BaseModel):
    food_name: str
    description: Optional[str] = None
    ingredients: Optional[List[str]] = None
    serving_size: Optional[str] = None
    brand: Optional[str] = None

class NutritionScores(BaseModel):
    fiber_score: int  # 0-20 points
    protein_score: int  # 0-15 points
    healthy_fats_score: int  # 0-15 points
    vitamins_minerals_score: int  # 0-15 points
    antioxidants_score: int  # 0-10 points
    sugar_penalty: int  # 0 to -25 points
    sodium_penalty: int  # 0 to -15 points
    processing_penalty: int  # 0 to -20 points
    additives_penalty: int  # 0 to -15 points

class FoodAnalysisResponse(BaseModel):
    food_name: str
    health_score: int  # Overall score 0-100
    nutrition_scores: NutritionScores
    analysis: str
    recommendations: List[str]
    nutritional_highlights: Dict[str, str]
    health_benefits: List[str]
    health_concerns: List[str]
    better_alternatives: List[str]
    portion_advice: str
    analyzed_at: str

class HealthScoreCalculator:
    """Calculate comprehensive health scores based on nutritional factors"""
    
    @staticmethod
    def calculate_fiber_score(fiber_per_serving: float, serving_size: str = "100g") -> int:
        """
        Calculate fiber score (0-20 points)
        Excellent: 10g+ = 20 pts
        Good: 5-10g = 15 pts  
        Fair: 3-5g = 10 pts
        Poor: 1-3g = 5 pts
        Very poor: <1g = 0 pts
        """
        if fiber_per_serving >= 10:
            return 20
        elif fiber_per_serving >= 5:
            return 15
        elif fiber_per_serving >= 3:
            return 10
        elif fiber_per_serving >= 1:
            return 5
        else:
            return 0
    
    @staticmethod
    def calculate_protein_score(protein_per_serving: float, food_type: str) -> int:
        """
        Calculate protein score (0-15 points)
        Varies by food type - higher expectations for protein sources
        """
        if "meat" in food_type.lower() or "fish" in food_type.lower():
            # High protein foods
            if protein_per_serving >= 25:
                return 15
            elif protein_per_serving >= 20:
                return 12
            elif protein_per_serving >= 15:
                return 8
            else:
                return 4
        else:
            # General foods
            if protein_per_serving >= 15:
                return 15
            elif protein_per_serving >= 10:
                return 12
            elif protein_per_serving >= 5:
                return 8
            elif protein_per_serving >= 2:
                return 4
            else:
                return 0
    
    @staticmethod
    def calculate_sugar_penalty(sugar_content: float, total_carbs: float) -> int:
        """
        Calculate sugar penalty (0 to -25 points)
        Based on added sugars and sugar percentage of carbs
        """
        if sugar_content <= 2:
            return 0
        elif sugar_content <= 5:
            return -3
        elif sugar_content <= 10:
            return -8
        elif sugar_content <= 20:
            return -15
        else:
            return -25
    
    @staticmethod
    def calculate_sodium_penalty(sodium_mg: float) -> int:
        """
        Calculate sodium penalty (0 to -15 points)
        Based on daily value percentage
        """
        daily_limit = 2300  # mg
        percentage = (sodium_mg / daily_limit) * 100
        
        if percentage <= 5:
            return 0
        elif percentage <= 15:
            return -3
        elif percentage <= 30:
            return -8
        else:
            return -15

def create_detailed_prompt(request: FoodAnalysisRequest) -> str:
    """Create a comprehensive prompt for nutritional analysis"""
    
    base_prompt = f"""
    As a certified nutritionist and food scientist, analyze this food item comprehensively:

    FOOD DETAILS:
    - Name: {request.food_name}
    - Description: {request.description or "Not provided"}
    - Ingredients: {', '.join(request.ingredients) if request.ingredients else "Not specified"}
    - Serving Size: {request.serving_size or "Standard serving"}
    - Brand: {request.brand or "Generic"}

    ANALYSIS REQUIREMENTS:
    Provide a detailed nutritional analysis and rate this food out of 100 points using this scoring system:

    POSITIVE POINTS (up to 75 points):
    1. Fiber Content (0-20 points):
       - 10g+ fiber = 20 points
       - 5-10g = 15 points
       - 3-5g = 10 points
       - 1-3g = 5 points
       - <1g = 0 points

    2. Protein Quality (0-15 points):
       - Complete proteins, bioavailability
       - Amount per serving relative to food type

    3. Healthy Fats (0-15 points):
       - Omega-3s, monounsaturated fats
       - Absence of trans fats

    4. Vitamins & Minerals (0-15 points):
       - Micronutrient density
       - Bioavailable forms

    5. Antioxidants & Phytonutrients (0-10 points):
       - Natural antioxidants, polyphenols
       - Anti-inflammatory compounds

    NEGATIVE POINTS (penalties):
    6. Added Sugars (-25 to 0 points):
       - High sugar content penalty
       - Artificial sweeteners consideration

    7. Sodium Content (-15 to 0 points):
       - Based on daily value percentage

    8. Processing Level (-20 to 0 points):
       - Ultra-processed foods penalty
       - Preservation methods

    9. Additives & Chemicals (-15 to 0 points):
       - Artificial colors, flavors, preservatives
       - Known harmful substances

    RESPONSE FORMAT (JSON):
    {{
        "food_name": "{request.food_name}",
        "health_score": [calculated total 0-100],
        "nutrition_scores": {{
            "fiber_score": [0-20],
            "protein_score": [0-15], 
            "healthy_fats_score": [0-15],
            "vitamins_minerals_score": [0-15],
            "antioxidants_score": [0-10],
            "sugar_penalty": [0 to -25],
            "sodium_penalty": [0 to -15],
            "processing_penalty": [0 to -20],
            "additives_penalty": [0 to -15]
        }},
        "analysis": "[detailed 200-300 word analysis explaining the scoring]",
        "recommendations": [
            "3-5 specific actionable recommendations for improvement or optimal consumption"
        ],
        "nutritional_highlights": {{
            "best_aspect": "[strongest nutritional feature]",
            "main_concern": "[biggest nutritional concern]",
            "key_nutrients": "[3-4 important nutrients with amounts]",
            "daily_value_highlights": "[significant daily value percentages]"
        }},
        "health_benefits": [
            "List 3-5 specific health benefits supported by the nutrients present"
        ],
        "health_concerns": [
            "List 2-4 potential health concerns or risks"
        ],
        "better_alternatives": [
            "Suggest 3-4 healthier alternatives or modifications"
        ],
        "portion_advice": "[optimal serving size and frequency recommendations]"
    }}

    IMPORTANT: Base your analysis on established nutritional science. Be specific about nutrient amounts when possible. Consider the food in context of a balanced diet.
    """
    
    return base_prompt

@app.get("/")
async def root():
    return {
        "message": "Food Health Rater API is running!",
        "version": "1.0.0",
        "endpoints": {
            "analyze_food": "/analyze-food",
            "analyze_image": "/analyze-food-image",
            "health_check": "/health"
        }
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.utcnow().isoformat()}

@app.post("/analyze-food", response_model=FoodAnalysisResponse)
async def analyze_food(request: FoodAnalysisRequest):
    """
    Analyze food healthiness with comprehensive nutritional scoring
    """
    try:
        # Create detailed prompt
        prompt = create_detailed_prompt(request)
        
        # Get response from Gemini
        response = model.generate_content(prompt)
        response_text = response.text
        
        # Parse JSON response
        parsed_data = parse_ai_response(response_text, request.food_name)
        
        # Add timestamp
        parsed_data["analyzed_at"] = datetime.utcnow().isoformat()
        
        return FoodAnalysisResponse(**parsed_data)
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error analyzing food: {str(e)}")

@app.post("/analyze-food-image", response_model=FoodAnalysisResponse)
async def analyze_food_image(file: UploadFile = File(...)):
    """
    Analyze food from an uploaded image with comprehensive health scoring
    """
    try:
        # Validate file type
        if not file.content_type.startswith('image/'):
            raise HTTPException(status_code=400, detail="File must be an image")
        
        # Read and process the uploaded image
        contents = await file.read()
        image = Image.open(io.BytesIO(contents))
        
        # Convert to RGB if necessary
        if image.mode != 'RGB':
            image = image.convert('RGB')
        
        # Create comprehensive image analysis prompt
        prompt = """
        As a certified nutritionist and food scientist, analyze this food image comprehensively.

        IDENTIFICATION TASK:
        1. Identify all visible food items in the image
        2. Estimate portion sizes and ingredients
        3. Assess preparation methods and cooking styles
        4. Note any visible nutritional indicators (whole grains, vegetables, etc.)

        SCORING SYSTEM (same as text analysis):
        Rate the overall healthiness out of 100 points:

        POSITIVE POINTS (up to 75):
        - Fiber content (0-20): Visible whole grains, vegetables, fruits
        - Protein quality (0-15): Lean meats, legumes, quality sources
        - Healthy fats (0-15): Nuts, seeds, avocado, olive oil
        - Vitamins/minerals (0-15): Colorful vegetables, leafy greens
        - Antioxidants (0-10): Berries, dark vegetables, spices

        NEGATIVE POINTS (penalties):
        - Sugar content (-25 to 0): Sweet items, desserts, drinks
        - Sodium (-15 to 0): Processed foods, restaurant items
        - Processing level (-20 to 0): Packaged foods, fried items
        - Additives (-15 to 0): Artificial colors, preservatives

        RESPONSE FORMAT (JSON):
        {
            "food_name": "[identified food name]",
            "health_score": [0-100],
            "nutrition_scores": {
                "fiber_score": [0-20],
                "protein_score": [0-15],
                "healthy_fats_score": [0-15],
                "vitamins_minerals_score": [0-15],
                "antioxidants_score": [0-10],
                "sugar_penalty": [0 to -25],
                "sodium_penalty": [0 to -15],
                "processing_penalty": [0 to -20],
                "additives_penalty": [0 to -15]
            },
            "analysis": "[detailed analysis of what you see and its nutritional implications]",
            "recommendations": ["specific recommendations based on the food"],
            "nutritional_highlights": {
                "best_aspect": "[strongest nutritional feature visible]",
                "main_concern": "[biggest concern from what you see]",
                "key_nutrients": "[nutrients you can infer from visible ingredients]",
                "daily_value_highlights": "[estimated nutritional value]"
            },
            "health_benefits": ["benefits based on visible ingredients"],
            "health_concerns": ["concerns based on preparation/ingredients"],
            "better_alternatives": ["healthier preparation or ingredient suggestions"],
            "portion_advice": "[recommended portion size based on what you see]"
        }
        """
        
        # Get response from Gemini Vision
        response = vision_model.generate_content([prompt, image])
        response_text = response.text
        
        # Parse JSON response
        parsed_data = parse_ai_response(response_text, "Food from Image")
        
        # Add timestamp
        parsed_data["analyzed_at"] = datetime.utcnow().isoformat()
        
        return FoodAnalysisResponse(**parsed_data)
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error analyzing food image: {str(e)}")

def parse_ai_response(response_text: str, fallback_name: str) -> dict:
    """Parse AI response with robust error handling"""
    
    # Try to extract JSON from response
    json_match = re.search(r'\{.*\}', response_text, re.DOTALL)
    
    if json_match:
        try:
            data = json.loads(json_match.group())
            
            # Validate and set defaults for required fields
            parsed_data = {
                "food_name": data.get('food_name', fallback_name),
                "health_score": max(0, min(100, data.get('health_score', 50))),
                "nutrition_scores": validate_nutrition_scores(data.get('nutrition_scores', {})),
                "analysis": data.get('analysis', 'Nutritional analysis completed using AI assessment.'),
                "recommendations": data.get('recommendations', ["Consult a registered dietitian for personalized advice"]),
                "nutritional_highlights": data.get('nutritional_highlights', {
                    "best_aspect": "Moderate nutritional value",
                    "main_concern": "Analysis needed",
                    "key_nutrients": "Various nutrients present",
                    "daily_value_highlights": "Moderate contribution to daily values"
                }),
                "health_benefits": data.get('health_benefits', ["Provides calories and nutrients"]),
                "health_concerns": data.get('health_concerns', ["Consider portion size"]),
                "better_alternatives": data.get('better_alternatives', ["Add vegetables", "Choose whole grain options"]),
                "portion_advice": data.get('portion_advice', "Follow recommended serving sizes")
            }
            
            return parsed_data
            
        except json.JSONDecodeError:
            pass
    
    # Fallback response if JSON parsing fails
    return create_fallback_response(fallback_name, response_text)

def validate_nutrition_scores(scores: dict) -> dict:
    """Validate and clean nutrition scores"""
    
    default_scores = {
        "fiber_score": 0,
        "protein_score": 0,
        "healthy_fats_score": 0,
        "vitamins_minerals_score": 0,
        "antioxidants_score": 0,
        "sugar_penalty": 0,
        "sodium_penalty": 0,
        "processing_penalty": 0,
        "additives_penalty": 0
    }
    
    # Validate each score within its range
    validated_scores = {}
    for key, default in default_scores.items():
        value = scores.get(key, default)
        
        if 'penalty' in key:
            # Penalties should be negative or zero
            validated_scores[key] = max(-50, min(0, value))
        else:
            # Positive scores
            max_vals = {
                "fiber_score": 20,
                "protein_score": 15,
                "healthy_fats_score": 15,
                "vitamins_minerals_score": 15,
                "antioxidants_score": 10
            }
            validated_scores[key] = max(0, min(max_vals.get(key, 15), value))
    
    return validated_scores

def create_fallback_response(food_name: str, raw_response: str) -> dict:
    """Create a fallback response when JSON parsing fails"""
    
    return {
        "food_name": food_name,
        "health_score": 50,
        "nutrition_scores": {
            "fiber_score": 5,
            "protein_score": 5,
            "healthy_fats_score": 5,
            "vitamins_minerals_score": 5,
            "antioxidants_score": 5,
            "sugar_penalty": -5,
            "sodium_penalty": -5,
            "processing_penalty": -5,
            "additives_penalty": -5
        },
        "analysis": raw_response[:500] + "..." if len(raw_response) > 500 else raw_response,
        "recommendations": [
            "Consider consulting a registered dietitian",
            "Balance this food with nutrient-dense options",
            "Pay attention to portion sizes"
        ],
        "nutritional_highlights": {
            "best_aspect": "Contains essential nutrients",
            "main_concern": "Detailed analysis needed",
            "key_nutrients": "Various macronutrients present",
            "daily_value_highlights": "Contributes to daily nutritional needs"
        },
        "health_benefits": ["Provides energy and nutrients"],
        "health_concerns": ["Monitor portion sizes"],
        "better_alternatives": ["Add fresh vegetables", "Choose whole food options"],
        "portion_advice": "Follow standard serving size recommendations"
    }

@app.get("/nutrition-info")
async def get_nutrition_info():
    """Get information about the nutrition scoring system"""
    return {
        "scoring_system": {
            "total_points": "0-100",
            "positive_factors": {
                "fiber": "0-20 points (10g+ = 20pts, 5-10g = 15pts, 3-5g = 10pts)",
                "protein": "0-15 points (varies by food type)",
                "healthy_fats": "0-15 points (omega-3s, monounsaturated)",
                "vitamins_minerals": "0-15 points (micronutrient density)",
                "antioxidants": "0-10 points (phytonutrients, polyphenols)"
            },
            "negative_factors": {
                "added_sugars": "-25 to 0 points",
                "sodium": "-15 to 0 points",
                "processing_level": "-20 to 0 points",
                "additives": "-15 to 0 points"
            }
        },
        "rating_scale": {
            "excellent": "85-100 (nutrient-dense, minimal processing)",
            "good": "70-84 (good nutritional value, minor concerns)",
            "fair": "50-69 (moderate nutrition, some concerns)",
            "poor": "30-49 (limited nutrition, significant concerns)",
            "very_poor": "0-29 (highly processed, minimal nutrition)"
        }
    }

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
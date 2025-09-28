#!/usr/bin/env python3
"""
Test client for Food Health Rater API
"""

import requests
import json
from typing import Dict, Any

class FoodHealthRaterClient:
    def __init__(self, base_url: str = "http://localhost:8000"):
        self.base_url = base_url
    
    def analyze_food(self, food_data: Dict[str, Any]) -> Dict[str, Any]:
        """Analyze food by text description"""
        response = requests.post(f"{self.base_url}/analyze-food", json=food_data)
        response.raise_for_status()
        return response.json()
    
    def analyze_food_image(self, image_path: str) -> Dict[str, Any]:
        """Analyze food from image file"""
        with open(image_path, 'rb') as f:
            files = {'file': f}
            response = requests.post(f"{self.base_url}/analyze-food-image", files=files)
        response.raise_for_status()
        return response.json()
    
    def get_nutrition_info(self) -> Dict[str, Any]:
        """Get information about the scoring system"""
        response = requests.get(f"{self.base_url}/nutrition-info")
        response.raise_for_status()
        return response.json()

def test_food_analysis():
    """Test the food analysis with various food examples"""
    
    client = FoodHealthRaterClient()
    
    # Test cases with different types of foods
    test_foods = [
        {
            "food_name": "Quinoa Salad with Mixed Vegetables",
            "description": "Quinoa with cucumber, tomatoes, bell peppers, olive oil, and lemon dressing",
            "ingredients": ["quinoa", "cucumber", "tomatoes", "bell peppers", "olive oil", "lemon juice", "herbs"],
            "serving_size": "1 cup (185g)"
        },
        {
            "food_name": "Big Mac",
            "description": "McDonald's Big Mac burger",
            "ingredients": ["sesame seed bun", "beef patties", "special sauce", "lettuce", "cheese", "pickles", "onions"],
            "serving_size": "1 burger (230g)",
            "brand": "McDonald's"
        },
        {
            "food_name": "Greek Yogurt with Berries",
            "description": "Plain Greek yogurt topped with fresh blueberries and strawberries",
            "ingredients": ["greek yogurt", "blueberries", "strawberries"],
            "serving_size": "1 cup (245g)"
        },
        {
            "food_name": "Coca-Cola",
            "description": "Regular Coca-Cola soft drink",
            "ingredients": ["carbonated water", "high fructose corn syrup", "caramel color", "phosphoric acid", "natural flavors", "caffeine"],
            "serving_size": "12 fl oz (355ml)",
            "brand": "Coca-Cola"
        },
        {
            "food_name": "Salmon with Broccoli",
            "description": "Grilled Atlantic salmon with steamed broccoli",
            "ingredients": ["salmon fillet", "broccoli", "olive oil", "garlic", "lemon"],
            "serving_size": "6 oz salmon + 1 cup broccoli"
        }
    ]
    
    print("=" * 80)
    print("FOOD HEALTH RATER - TEST RESULTS")
    print("=" * 80)
    
    for i, food in enumerate(test_foods, 1):
        print(f"\n{'='*20} TEST {i}: {food['food_name'].upper()} {'='*20}")
        
        try:
            result = client.analyze_food(food)
            
            print(f"🍽️  Food: {result['food_name']}")
            print(f"📊 Health Score: {result['health_score']}/100")
            
            # Print nutrition breakdown
            scores = result['nutrition_scores']
            print(f"\n📈 NUTRITION BREAKDOWN:")
            print(f"   Fiber: {scores['fiber_score']}/20")
            print(f"   Protein: {scores['protein_score']}/15")
            print(f"   Healthy Fats: {scores['healthy_fats_score']}/15")
            print(f"   Vitamins/Minerals: {scores['vitamins_minerals_score']}/15")
            print(f"   Antioxidants: {scores['antioxidants_score']}/10")
            print(f"   Sugar Penalty: {scores['sugar_penalty']}")
            print(f"   Sodium Penalty: {scores['sodium_penalty']}")
            print(f"   Processing Penalty: {scores['processing_penalty']}")
            print(f"   Additives Penalty: {scores['additives_penalty']}")
            
            # Print key insights
            highlights = result['nutritional_highlights']
            print(f"\n🌟 HIGHLIGHTS:")
            print(f"   Best Aspect: {highlights['best_aspect']}")
            print(f"   Main Concern: {highlights['main_concern']}")
            
            print(f"\n✅ HEALTH BENEFITS:")
            for benefit in result['health_benefits'][:3]:
                print(f"   • {benefit}")
            
            print(f"\n⚠️  HEALTH CONCERNS:")
            for concern in result['health_concerns'][:3]:
                print(f"   • {concern}")
            
            print(f"\n💡 TOP RECOMMENDATIONS:")
            for rec in result['recommendations'][:3]:
                print(f"   • {rec}")
            
            # Health rating
            score = result['health_score']
            if score >= 85:
                rating = "🌟 EXCELLENT"
            elif score >= 70:
                rating = "✅ GOOD"
            elif score >= 50:
                rating = "⚠️  FAIR"
            elif score >= 30:
                rating = "❌ POOR"
            else:
                rating = "🚫 VERY POOR"
            
            print(f"\n🏆 OVERALL RATING: {rating}")
            
        except Exception as e:
            print(f"❌ Error analyzing {food['food_name']}: {e}")
    
    # Test nutrition info endpoint
    print(f"\n{'='*80}")
    print("NUTRITION SCORING SYSTEM INFO")
    print("=" * 80)
    
    try:
        info = client.get_nutrition_info()
        print("\n📋 SCORING BREAKDOWN:")
        
        positive = info['scoring_system']['positive_factors']
        print("\n✅ POSITIVE FACTORS:")
        for factor, points in positive.items():
            print(f"   {factor.replace('_', ' ').title()}: {points}")
        
        negative = info['scoring_system']['negative_factors']
        print("\n❌ NEGATIVE FACTORS (Penalties):")
        for factor, points in negative.items():
            print(f"   {factor.replace('_', ' ').title()}: {points}")
        
        print("\n🎯 RATING SCALE:")
        for rating, description in info['rating_scale'].items():
            print(f"   {rating.replace('_', ' ').title()}: {description}")
            
    except Exception as e:
        print(f"❌ Error getting nutrition info: {e}")

if __name__ == "__main__":
    print("🍎 Starting Food Health Rater API Tests...")
    print("Make sure the API server is running on http://localhost:8000")
    print("\nTo start the server, run: python food_health_rater.py")
    
    # Run tests
    test_food_analysis()
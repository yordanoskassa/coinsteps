# 🍎 Food Health Rater API

A comprehensive food analysis system that rates food healthiness out of 100 based on scientific nutritional criteria including fiber, protein, vitamins, minerals, and processing level.

## ✨ Features

- **Comprehensive Scoring**: 0-100 health score based on 9 nutritional factors
- **Text Analysis**: Analyze foods by name, description, and ingredients
- **Image Analysis**: Upload food images for AI-powered identification and analysis
- **Detailed Breakdown**: Individual scores for fiber, protein, fats, vitamins, etc.
- **Smart Penalties**: Deductions for sugar, sodium, processing, and additives
- **Actionable Insights**: Health benefits, concerns, and improvement recommendations
- **Better Alternatives**: Suggestions for healthier options

## 🎯 Scoring System

### Positive Factors (0-75 points)
- **Fiber Content** (0-20 pts): 10g+ = 20pts, 5-10g = 15pts, 3-5g = 10pts
- **Protein Quality** (0-15 pts): Complete proteins, bioavailability
- **Healthy Fats** (0-15 pts): Omega-3s, monounsaturated fats
- **Vitamins & Minerals** (0-15 pts): Micronutrient density
- **Antioxidants** (0-10 pts): Phytonutrients, polyphenols

### Negative Factors (penalties)
- **Added Sugars** (-25 to 0 pts): High sugar content penalty
- **Sodium Content** (-15 to 0 pts): Based on daily value percentage
- **Processing Level** (-20 to 0 pts): Ultra-processed foods penalty
- **Additives** (-15 to 0 pts): Artificial colors, flavors, preservatives

### Rating Scale
- **Excellent** (85-100): Nutrient-dense, minimal processing
- **Good** (70-84): Good nutritional value, minor concerns
- **Fair** (50-69): Moderate nutrition, some concerns
- **Poor** (30-49): Limited nutrition, significant concerns
- **Very Poor** (0-29): Highly processed, minimal nutrition

## 🚀 Quick Start

### 1. Install Dependencies
```bash
pip install -r food_requirements.txt
```

### 2. Set Up Environment
Create a `.env` file with your Gemini API key:
```bash
GEMINI_API_KEY=your_api_key_here
```

### 3. Start the Server
```bash
python food_health_rater.py
```

The API will be available at `http://localhost:8000`

### 4. Test the API
```bash
python test_food_api.py
```

### 5. Open Web Interface
Open `food_frontend_example.html` in your browser for a visual interface.

## 📡 API Endpoints

### Analyze Food by Text
```http
POST /analyze-food
Content-Type: application/json

{
    "food_name": "Greek Yogurt with Berries",
    "description": "Plain Greek yogurt with fresh blueberries",
    "ingredients": ["greek yogurt", "blueberries", "strawberries"],
    "serving_size": "1 cup (245g)",
    "brand": "Chobani"
}
```

### Analyze Food by Image
```http
POST /analyze-food-image
Content-Type: multipart/form-data

file: [image file]
```

### Get Scoring System Info
```http
GET /nutrition-info
```

## 📊 Response Format

```json
{
    "food_name": "Greek Yogurt with Berries",
    "health_score": 78,
    "nutrition_scores": {
        "fiber_score": 15,
        "protein_score": 14,
        "healthy_fats_score": 8,
        "vitamins_minerals_score": 12,
        "antioxidants_score": 9,
        "sugar_penalty": -5,
        "sodium_penalty": 0,
        "processing_penalty": -3,
        "additives_penalty": 0
    },
    "analysis": "Detailed nutritional analysis...",
    "recommendations": [
        "Add nuts or seeds for healthy fats",
        "Choose organic berries when possible"
    ],
    "nutritional_highlights": {
        "best_aspect": "High protein content from Greek yogurt",
        "main_concern": "Natural sugars from fruit",
        "key_nutrients": "Protein: 20g, Calcium: 200mg, Probiotics",
        "daily_value_highlights": "40% DV Calcium, 25% DV Protein"
    },
    "health_benefits": [
        "Supports digestive health with probiotics",
        "High protein aids muscle maintenance"
    ],
    "health_concerns": [
        "Natural sugars may affect blood glucose"
    ],
    "better_alternatives": [
        "Add chia seeds for extra fiber",
        "Use unsweetened almond milk for lower calories"
    ],
    "portion_advice": "1 cup is an appropriate serving size",
    "analyzed_at": "2024-01-20T10:30:00.000Z"
}
```

## 🧪 Example Test Cases

### Healthy Foods (Expected 70+ score)
- Quinoa salad with vegetables
- Grilled salmon with broccoli
- Greek yogurt with berries
- Mixed nuts and seeds
- Spinach and kale salad

### Moderately Healthy (Expected 40-70 score)
- Whole grain pasta with tomato sauce
- Chicken breast sandwich
- Vegetable stir-fry with rice
- Oatmeal with banana

### Less Healthy (Expected <40 score)
- Fast food burgers
- Sugary sodas
- Processed snacks
- Fried foods
- Candy and desserts

## 🔧 Customization

### Adjust Scoring Weights
Modify the `HealthScoreCalculator` class methods to adjust scoring criteria:

```python
@staticmethod
def calculate_fiber_score(fiber_per_serving: float) -> int:
    # Customize fiber scoring thresholds
    if fiber_per_serving >= 12:  # Increase threshold
        return 20
    # ... rest of logic
```

### Add New Nutritional Factors
1. Add new fields to `NutritionScores` model
2. Update the prompt in `create_detailed_prompt()`
3. Add validation in `validate_nutrition_scores()`

### Modify AI Prompts
Edit the prompts in `create_detailed_prompt()` to focus on specific dietary approaches:
- Keto-friendly analysis
- Diabetic considerations
- Athletic performance focus
- Weight management focus

## 🔍 Technical Details

### AI Models Used
- **Gemini Pro**: Text-based food analysis
- **Gemini Pro Vision**: Image-based food identification

### Image Processing
- Supports: JPG, PNG, GIF, WebP
- Auto-converts to RGB format
- Analyzes visible ingredients and preparation methods

### Error Handling
- Robust JSON parsing with fallbacks
- Input validation and sanitization
- Graceful degradation when AI responses are malformed

### Performance
- Response time: 2-5 seconds per analysis
- Concurrent requests supported
- Caching recommendations for production use

## 🚀 Production Deployment

### Environment Variables
```bash
GEMINI_API_KEY=your_production_api_key
HOST=0.0.0.0
PORT=8000
```

### Docker Deployment
```dockerfile
FROM python:3.11-slim

WORKDIR /app
COPY food_requirements.txt .
RUN pip install -r food_requirements.txt

COPY food_health_rater.py .
EXPOSE 8000

CMD ["python", "food_health_rater.py"]
```

### Security Considerations
- Add API key authentication
- Implement rate limiting
- Validate file uploads thoroughly
- Use HTTPS in production
- Set proper CORS origins

## 📈 Integration Examples

### React/React Native
```javascript
const analyzeFood = async (foodData) => {
    const response = await fetch('http://localhost:8000/analyze-food', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(foodData)
    });
    return response.json();
};
```

### Python Client
```python
import requests

def analyze_food(food_data):
    response = requests.post(
        'http://localhost:8000/analyze-food',
        json=food_data
    )
    return response.json()
```

### cURL
```bash
curl -X POST "http://localhost:8000/analyze-food" \
     -H "Content-Type: application/json" \
     -d '{"food_name": "Apple", "serving_size": "1 medium"}'
```

## 🐛 Troubleshooting

### Common Issues

1. **"GEMINI_API_KEY not found"**
   - Set your API key in `.env` file
   - Get key from [Google AI Studio](https://makersuite.google.com/app/apikey)

2. **"Error analyzing food"**
   - Check internet connection
   - Verify API key is valid
   - Try simpler food descriptions

3. **Image upload fails**
   - Ensure file is an image format
   - Check file size (<10MB recommended)
   - Verify CORS settings for web uploads

4. **Low accuracy scores**
   - Provide more detailed descriptions
   - Include specific ingredients
   - Specify serving sizes

### Debug Mode
Add logging for debugging:
```python
import logging
logging.basicConfig(level=logging.DEBUG)
```

## 📚 Scientific Basis

The scoring system is based on:
- WHO dietary guidelines
- USDA nutritional recommendations
- Harvard T.H. Chan School of Public Health nutrition research
- Academy of Nutrition and Dietetics standards
- Peer-reviewed nutrition science literature

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Add tests for new functionality
4. Update documentation
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🙋‍♀️ Support

For questions or issues:
- Check the troubleshooting section
- Review API documentation
- Test with the provided examples
- Ensure all dependencies are installed correctly
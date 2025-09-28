# Health System Setup Guide

## 🚀 Quick Setup

### 1. Install Backend Dependencies
```bash
cd backend
pip install httpx==0.25.2
```

### 2. Configure API Keys
Copy your `.env.example` to `.env` and add:

```bash
# AI Health Analysis (ASI:One Agentic)
ASI_ONE_API_KEY=your-asi-one-api-key-here

# Email Notifications (AgentMail)
AGENTMAIL_API_KEY=your-agentmail-api-key-here
AGENTMAIL_INBOX_ID=your-agentmail-inbox-id-here
```

### 3. Add Health Dashboard to Navigation
Add the HealthDashboard screen to your app navigation:

```typescript
import HealthDashboard from './src/screens/HealthDashboard';

// In your navigator
<Stack.Screen 
  name="HealthDashboard" 
  component={HealthDashboard}
  options={{ title: 'Health Dashboard' }}
/>
```

### 4. Update Challenge Creation
Replace your existing CreateChallengeModal with the new enhanced version that includes friend selection and email notifications.

## 🧪 Testing the System

### Health Metrics
1. Open the Health Dashboard
2. Submit today's health metrics
3. Request AI health analysis
4. Complete day analysis for full summary

### Challenge System
1. Add friends via email
2. Create a new challenge
3. Select friends and add a message
4. Send invitations (emails will be sent via AgentMail)

### API Endpoints to Test
```bash
# Health endpoints
POST /health/metrics
GET /health/history
POST /health/ai-score
POST /health/day-complete

# Challenge endpoints
GET /friends/list
POST /friends/add
POST /challenges/create
POST /challenges/{id}/invite
```

## 🔧 API Key Setup

### ASI:One Agentic
1. Visit [ASI:One Platform](https://asi1.ai)
2. Create account and get API key
3. Add to `.env` as `ASI_ONE_API_KEY`

### AgentMail
1. Visit [AgentMail](https://agentmail.ai)
2. Create account and inbox
3. Get API key and inbox ID
4. Add to `.env` as `AGENTMAIL_API_KEY` and `AGENTMAIL_INBOX_ID`

## 📱 Frontend Integration

The system is ready to use with these new components:
- `HealthDashboard` - Complete health metrics and AI scoring
- `CreateChallengeModal` - Enhanced challenge creation with friends
- `HealthMetricsService` - Health data management
- `ChallengeService` - Challenge and friend operations

## 🎯 Next Steps

1. **Test the health dashboard** with real HealthKit data
2. **Create sample challenges** to test email notifications  
3. **Add navigation** to the health dashboard from your main app
4. **Customize AI prompts** in `health_ai.py` for your specific needs
5. **Style email templates** in `agentmail_client.py` to match your brand

The comprehensive health scoring and challenge system is now fully implemented and ready for use! 🎉

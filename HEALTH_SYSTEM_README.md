# Health Scoring & Challenge System

This document outlines the comprehensive health scoring and challenge notification system implemented in the StepBet app.

## 🏥 Health Metrics System

### Core Health Indicators
The system tracks 5 key HealthKit indicators:

1. **Steps** - Daily step count with 10,000 step target
2. **Active Time** - Minutes of active movement with 30-minute target  
3. **Sleep Hours** - Sleep duration with 8-hour target
4. **Heart Rate** - Average heart rate (BPM)
5. **Calories Burned** - Active energy expenditure

### AI-Powered Health Scoring
- **ASI:One Agentic Integration** - Advanced AI analysis of health patterns
- **Composite Health Score** (0-100) with breakdown:
  - Cardiovascular health
  - Activity levels
  - Recovery metrics
  - Consistency tracking
  - Improvement trends

### Health Dashboard Features
- Real-time health metrics display
- Progress bars for daily targets
- Weekly trend analysis
- AI-generated insights and recommendations
- Day completion analysis with motivational summaries

## 🎯 Enhanced Challenge System

### Challenge Creation
- **Multiple Challenge Types**: Steps, Active Minutes, Calories, Custom Goals
- **Flexible Duration**: Customizable challenge periods (hours)
- **Stake System**: SOL-based betting with configurable amounts
- **Personal Messages**: Optional motivational messages for friends

### Friend Management
- Add friends by email address
- Friend selection interface for challenges
- Visual friend cards with avatars and contact info

### Email Notifications (AgentMail Integration)
- **Beautiful HTML Emails** with challenge details
- **Personalized Invitations** with sender information
- **Challenge Reminders** for upcoming deadlines
- **Professional Templates** with branding

## 🔧 Technical Implementation

### Backend APIs

#### Health Endpoints
```
POST /health/metrics          - Submit daily health data
GET  /health/history         - Get health history (30 days)
POST /health/ai-score        - Request AI health analysis
POST /health/day-complete    - Mark day complete & get summary
GET  /health/trends          - Get weekly health trends
```

#### Challenge Endpoints
```
GET  /friends/list           - Get user's friends
POST /friends/add            - Add new friend
POST /challenges/create      - Create new challenge
POST /challenges/{id}/invite - Send email invitations
GET  /challenges/user        - Get user's challenges
POST /challenges/{id}/join   - Join existing challenge
```

### Frontend Components

#### Health Dashboard (`HealthDashboard.tsx`)
- Comprehensive health metrics display
- AI score visualization with breakdown
- Trend analysis and insights
- Action buttons for data submission

#### Challenge Creation (`CreateChallengeModal.tsx`)
- Multi-step challenge creation flow
- Friend selection interface
- Challenge type picker
- Stake and duration configuration

#### Services
- `HealthMetricsService` - Health data management
- `ChallengeService` - Challenge and friend operations

## 🚀 Setup Instructions

### Environment Variables
Add to your `.env` file:

```bash
# AI Health Analysis
ASI_ONE_API_KEY=your-asi-one-api-key-here

# Email Notifications  
AGENTMAIL_API_KEY=your-agentmail-api-key-here
AGENTMAIL_INBOX_ID=your-agentmail-inbox-id-here
```

### Backend Dependencies
Install required Python packages:

```bash
pip install httpx python-dotenv
```

### Database Collections
The system uses these MongoDB collections:
- `health_metrics` - Daily health data
- `health_analyses` - AI analysis results
- `friends` - User friend relationships
- `challenges` - Challenge data
- `challenge_invitations` - Email invitation tracking

## 📊 Data Flow

### Health Scoring Process
1. User submits daily health metrics via HealthKit
2. Data stored in `health_metrics` collection
3. AI analysis triggered via ASI:One Agentic API
4. Comprehensive scoring with insights generated
5. Results displayed in Health Dashboard

### Challenge Creation Flow
1. User creates challenge with target and friends
2. Challenge stored in database
3. Email invitations sent via AgentMail API
4. Friends receive personalized HTML emails
5. Challenge tracking and progress updates

## 🎨 UI/UX Features

### Health Dashboard
- **Gradient AI Score Card** with visual breakdown
- **Progress Indicators** for daily targets
- **Trend Visualization** with up/down arrows
- **Insight Cards** with AI recommendations
- **Action Buttons** for data submission

### Challenge Creation
- **Type Selection Grid** with icons and colors
- **Friend Selection** with search and avatars
- **Real-time Validation** and error handling
- **Preview Mode** before sending invitations

## 🔐 Security & Privacy

### Data Protection
- JWT-based authentication for all endpoints
- User-specific data isolation
- Secure API key management
- Health data encryption in transit

### Email Security
- Professional email templates
- No sensitive data in email content
- Secure AgentMail API integration
- Invitation tracking and validation

## 📈 Analytics & Insights

### AI Health Analysis
- **Pattern Recognition** in health behaviors
- **Personalized Recommendations** based on data
- **Risk Factor Identification** for health issues
- **Achievement Recognition** for positive trends
- **Motivational Messaging** for engagement

### Challenge Analytics
- **Participation Tracking** across challenges
- **Success Rate Monitoring** for different types
- **Friend Engagement** metrics
- **Email Delivery** and open rate tracking

## 🛠 Troubleshooting

### Common Issues
1. **AI Score Not Loading**: Check ASI_ONE_API_KEY configuration
2. **Emails Not Sending**: Verify AGENTMAIL_API_KEY and INBOX_ID
3. **Health Data Missing**: Ensure HealthKit permissions granted
4. **Friend Addition Fails**: Check email format validation

### Debug Endpoints
- Check backend logs for API errors
- Monitor MongoDB collections for data consistency
- Verify environment variable loading
- Test email delivery with AgentMail dashboard

## 🔄 Future Enhancements

### Planned Features
- **Group Challenges** with multiple participants
- **Leaderboards** and social features
- **Wearable Device Integration** (Apple Watch, Fitbit)
- **Advanced AI Coaching** with personalized plans
- **Push Notifications** for challenge updates
- **Social Sharing** of achievements

### Technical Improvements
- **Real-time Updates** via WebSocket connections
- **Offline Support** for health data collection
- **Advanced Analytics** dashboard for admins
- **API Rate Limiting** and caching
- **Automated Testing** suite for health algorithms

---

This comprehensive health system transforms StepBet from a simple betting app into a full-featured health and wellness platform with AI-powered insights and social challenge features.

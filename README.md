# CoinSteps

Fitness gamification platform with step challenges, Solana blockchain betting, and AI-powered health insights.

## Features

- **Step Challenges**: Compete with friends on daily/weekly step goals
- **Blockchain Betting**: Stake SOL on achieving fitness targets
- **AI Health Analysis**: Get personalized insights from your health data
- **Solana Wallet**: Integrated wallet with airdrop support
- **Social Features**: Friend system with challenges and leaderboards

---

## Architecture

### Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React Native + Expo + TypeScript |
| Backend | FastAPI + Python 3.11 |
| Database | MongoDB |
| Blockchain | Solana (Devnet/Testnet) |
| Auth | JWT |
| AI | OpenAI GPT-4 |
| Email | AgentMail |

### Project Structure

```
coinsteps/
├── src/                        # React Native frontend
│   ├── app/                    # Expo router screens
│   ├── components/             # Reusable components
│   ├── hooks/                  # Custom React hooks
│   ├── config/                 # API configuration
│   └── types/                  # TypeScript definitions
├── backend/
│   ├── main.py                 # FastAPI application
│   ├── auth.py                 # Authentication logic
│   ├── wallet.py               # Solana wallet service
│   ├── anchor_client.py        # Smart contract client
│   ├── health_verifier.py      # Health data verification
│   ├── health_ai.py            # AI health analysis
│   ├── agentmail_client.py     # Email service
│   └── challenge_agent.py      # Challenge management
├── .github/workflows/
│   └── main.yml                # CI/CD pipeline
└── docker-compose.yml          # Local development stack
```

### Key Backend Services

- **Wallet Service**: Solana wallet creation, airdrops, transfers
- **Betting Client**: Smart contract interactions for challenges
- **Health Verifier**: Oracle-signed health data verification
- **Health AI**: AI-powered health insights and challenge difficulty
- **AgentMail**: Email invitations for challenges

---

## Environment Variables

### Frontend (`.env`)

| Variable | Required | Description |
|----------|----------|-------------|
| `EXPO_PUBLIC_API_URL` | Yes | Backend API base URL |
| `EXPO_PUBLIC_SOLANA_NETWORK` | No | `devnet` or `mainnet` |
| `EXPO_PUBLIC_ENABLE_BETTING` | No | Toggle betting features |

### Backend (`.env`)

| Variable | Required | Description |
|----------|----------|-------------|
| `MONGO_URL` | Yes | MongoDB connection string |
| `JWT_SECRET_KEY` | Yes | JWT signing key |
| `WALLET_ENCRYPTION_KEY` | Yes | Wallet encryption key |
| `SOLANA_RPC_URL` | Yes | Solana RPC endpoint |
| `OPENAI_API_KEY` | Yes | OpenAI API key |
| `AGENTMAIL_API_KEY` | No | AgentMail API key |

See `.env.example` files for complete documentation.

---

## Local Development

### Prerequisites

- Node.js 20+
- Python 3.11+
- MongoDB 7+
- Solana CLI (optional)

### Quick Start

```bash
# 1. Start MongoDB with Docker Compose
docker-compose up -d mongodb

# 2. Set up backend
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
# Edit .env with your keys

# 3. Start backend
uvicorn main:app --reload

# 4. In another terminal, set up frontend
cd ..
npm install
# For iOS: npx expo run:ios
# For Android: npx expo run:android
# For web: npx expo start --web
```

Backend runs at `http://localhost:8000`, frontend at `http://localhost:8081`.

---

## Docker Deployment

### Development

```bash
docker-compose up -d
```

Services:
- MongoDB: `localhost:27017`
- Backend API: `localhost:8000`

### Production

The repository includes GitHub Actions workflows for automated deployment. See `.github/workflows/main.yml`.

---

## Security Features

- **Security Headers**: X-Content-Type-Options, X-Frame-Options, X-XSS-Protection, Referrer-Policy
- **Rate Limiting**: 100 requests per minute per IP
- **JWT Authentication**: Stateless auth with Bearer tokens
- **Wallet Encryption**: Private keys encrypted at rest
- **Health Data Verification**: Oracle-signed health submissions

---

## CI/CD Pipeline

| Stage | Tools |
|-------|-------|
| Backend Tests | pytest |
| Backend Lint | flake8, black |
| Frontend Type Check | TypeScript |
| Docker Build | BuildKit |
| Deploy | Configurable |

---

## License

MIT

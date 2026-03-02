# Contributing to CoinSteps

## Development Setup

### Prerequisites
- Node.js 20+
- Python 3.11+
- MongoDB 7+

### Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
# Edit .env with your keys
uvicorn main:app --reload
```

### Frontend Setup
```bash
npm install
npx expo start
```

## Code Standards

- Python: PEP 8, black formatter
- TypeScript: Strict mode enabled
- Commits: Conventional Commits format

## Environment Variables

See `.env.example` for required variables. Never commit real secrets.

## Testing

Backend tests: `pytest`
Frontend tests: `npm test`

## Pull Request Process

1. Branch from `main`
2. Make changes with clear commits
3. Ensure tests pass
4. Update documentation if needed
5. Submit PR with description

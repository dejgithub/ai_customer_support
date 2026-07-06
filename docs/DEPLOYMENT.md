# SmartSupport AI - Deployment Guide

## Prerequisites
- Google Cloud Platform account
- Gemini API key (from Google AI Studio)
- Domain name (optional)
- Docker installed locally

## Quick Deploy (Google Cloud Run)

### 1. Set up Google Cloud
```bash
gcloud auth login
gcloud config set project your-project-id
```

### 2. Deploy using script
```bash
export GEMINI_API_KEY="your-gemini-api-key"
bash scripts/deploy.sh
```

### 3. Seed demo data
```bash
python scripts/seed_demo.py
```

## Local Development

### Using Docker Compose
```bash
docker-compose up --build
```

### Manual Setup
```bash
# Backend
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
# Edit .env with your database URL and Gemini API key
uvicorn app.main:app --reload

# Frontend
cd frontend
npm install
cp .env.local.example .env.local
npm run dev
```

## Environment Configuration

### Backend (.env)
| Variable | Description | Required |
|----------|-------------|----------|
| DATABASE_URL | PostgreSQL connection string | Yes |
| SECRET_KEY | JWT signing secret | Yes |
| GEMINI_API_KEY | Google Gemini API key | Yes |
| ENVIRONMENT | dev/prod | No |
| FRONTEND_URL | CORS origin | No |

### Frontend (.env.local)
| Variable | Description | Required |
|----------|-------------|----------|
| NEXT_PUBLIC_API_URL | Backend URL | Yes |

## Production Checklist

- [ ] Set strong SECRET_KEY
- [ ] Enable HTTPS
- [ ] Configure proper CORS origins
- [ ] Set up Cloud SQL with private IP
- [ ] Configure database backup
- [ ] Set up monitoring (Cloud Monitoring)
- [ ] Configure auto-scaling limits
- [ ] Set up custom domain with SSL
- [ ] Create service account with minimal permissions
- [ ] Enable audit logging
- [ ] Set up error reporting (Sentry optional)

## Database Migrations

```bash
cd backend
alembic init alembic
alembic revision --autogenerate -m "Initial migration"
alembic upgrade head
```

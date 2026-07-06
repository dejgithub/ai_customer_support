# SmartSupport AI

AI-powered customer support automation for small businesses. Multi-tenant SaaS platform using Google Gemini AI for intelligent, multi-language customer support across web chat, WhatsApp, Telegram, and Facebook Messenger.

## Features

- **AI Customer Support** - Real-time chat powered by Google Gemini AI with natural language understanding
- **Multi-Language** - Supports English, Amharic, and Afaan Oromo
- **Multi-Channel** - Web widget, WhatsApp, Telegram, Facebook Messenger
- **Appointment Booking** - AI-powered scheduling with availability checking
- **Order Management** - Order taking, catalog browsing, invoice generation via chat
- **Ticket System** - Auto-creation from escalated conversations with priority management
- **Knowledge Base** - RAG-powered document QA (PDF, DOCX, TXT, FAQ)
- **Analytics Dashboard** - Conversation metrics, satisfaction scoring, trend analysis
- **Multi-Tenant** - Isolated data per business with role-based access control

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 14, TypeScript, Tailwind CSS, shadcn/ui |
| Backend | Python FastAPI, SQLAlchemy async, Pydantic |
| Database | PostgreSQL 15 (Cloud SQL) |
| AI | Google Gemini API (Vertex AI) |
| Infrastructure | Docker, Google Cloud Run, Cloud Build |

## Quick Start

### Prerequisites
- Python 3.11+, Node.js 18+, Docker
- Google Gemini API key

### Setup

```bash
# Clone and enter the project
git clone https://github.com/your-org/smartsupport-ai.git
cd smartsupport-ai

# Run setup script
bash scripts/setup.sh

# Start the database
docker-compose up -d postgres

# Start backend (separate terminal)
cd backend
source venv/bin/activate
uvicorn app.main:app --reload

# Start frontend (separate terminal)
cd frontend
npm run dev

# Seed demo data
python scripts/seed_demo.py
```

Access the app at **http://localhost:3000**

## Screenshots

*(Add screenshots here)*

## Demo Credentials

| Business | Email | Password |
|----------|-------|----------|
| Buna Cafe & Restaurant | demo@restaurant.com | password123 |
| Sheba Grand Hotel | demo@hotel.com | password123 |
| Tena Health Clinic | demo@clinic.com | password123 |
| Merkato Fashion Hub | demo@retail.com | password123 |

## Deployment

### Google Cloud Run (Production)

```bash
export GEMINI_API_KEY="your-api-key"
bash scripts/deploy.sh
```

See [Deployment Guide](docs/DEPLOYMENT.md) for details.

## API Documentation

Full API docs at [docs/API.md](docs/API.md)

| Endpoint | Description |
|----------|-------------|
| `POST /api/v1/auth/register` | Register new business |
| `POST /api/v1/auth/login` | Login |
| `POST /api/v1/support/chat` | Chat with AI |
| `GET /api/v1/support/conversations` | List conversations |
| `POST /api/v1/tickets` | Create ticket |
| `GET /api/v1/appointments/slots` | Get available slots |
| `POST /api/v1/orders` | Create order |
| `POST /api/v1/knowledge/upload` | Upload document |
| `GET /api/v1/analytics/overview` | Analytics overview |

## Project Structure

```
smartsupport-ai/
├── backend/            # FastAPI Python backend
│   ├── app/
│   │   ├── models/    # SQLAlchemy models
│   │   ├── routes/    # API endpoints
│   │   ├── services/  # Business logic
│   │   └── main.py    # App entry point
│   ├── Dockerfile
│   └── requirements.txt
├── frontend/           # Next.js TypeScript frontend
│   ├── src/
│   │   ├── app/       # Next.js pages
│   │   ├── components/# React components
│   │   └── lib/       # Utilities
│   ├── Dockerfile
│   └── package.json
├── scripts/            # Setup and deployment
│   ├── setup.sh
│   ├── deploy.sh
│   └── seed_demo.py
├── docs/               # Documentation
│   ├── ARCHITECTURE.md
│   ├── API.md
│   └── DEPLOYMENT.md
├── docker-compose.yml
├── nginx.conf
└── README.md
```

## License

MIT License - see LICENSE file for details.

## Contributors

- Your Name - Initial work

# SmartSupport AI - Architecture Documentation

## System Overview

SmartSupport AI is a multi-tenant SaaS platform that provides AI-powered customer support automation for small businesses. The platform uses Google's Gemini AI for natural language understanding, multi-language support, and intelligent response generation.

## Architecture Diagram

```
+----------------------------------------------------------------+
|                        Clients                                  |
|  +----------+  +----------+  +----------+  +----------+        |
|  |   Web    |  | WhatsApp  |  | Telegram |  |Facebook  |        |
|  |  Widget  |  |  Chat    |  |   Bot    |  |Messenger |        |
|  +----+-----+  +----+-----+  +----+-----+  +----+-----+        |
+-------+-------------+--------------+--------------+-------------+
        |             |              |              |
+-------+-------------+--------------+--------------+-------------+
|       |     Google Cloud Run       |              |             |
|       v             v              v              v             |
|  +-----------------------------------------------------------+  |
|  |                  Next.js Frontend                          |  |
|  |  +---------+ +----------+ +---------+ +--------+          |  |
|  |  |Dashboard| |  Admin   | |  Chat   | |Widget  |          |  |
|  |  |   UI    | |  Panel   | |   UI    | |  SDK   |          |  |
|  |  +---------+ +----------+ +---------+ +--------+          |  |
|  +--------------------+---------------------------------------+  |
|                       | REST API                                 |
|  +--------------------v---------------------------------------+  |
|  |                  FastAPI Backend                             |  |
|  |  +----------+ +----------+ +----------+ +--------+          |  |
|  |  |  Auth    | | Support  | |  Tickets | |Orders  |          |  |
|  |  | Service  | |   AI     | |  Service | |Service |          |  |
|  |  +----------+ +----------+ +----------+ +--------+          |  |
|  |  +----------+ +----------+ +-------------------+            |  |
|  |  |Appoint.  | |Analytics | |  RAG/Knowledge    |            |  |
|  |  | Service  | | Service  | |  Base Service     |            |  |
|  |  +----------+ +----------+ +-------------------+            |  |
|  +--------------------+---------------------------------------+  |
|                       |                                          |
|  +--------------------+---------------------------------------+  |
|  |                    |         Google Cloud                   |  |
|  |  +-----------------v---------------------------+            |  |
|  |  |          PostgreSQL (Cloud SQL)              |            |  |
|  |  |  +----------+ +----------+ +----------+     |            |  |
|  |  |  | Business | | Customer | |  Ticket  |     |            |  |
|  |  |  |  Data    | |  Data    | |   Data   |     |            |  |
|  |  |  +----------+ +----------+ +----------+     |            |  |
|  |  |  +----------+ +----------+ +----------+     |            |  |
|  |  |  |Knowledge | |  Orders  | |Audit Log |     |            |  |
|  |  |  |   Base   | |          | |          |     |            |  |
|  |  |  +----------+ +----------+ +----------+     |            |  |
|  |  +---------------------------------------------+            |  |
|  |                                                              |  |
|  |  +---------------------------------------------+            |  |
|  |  |        Gemini AI (Vertex AI)                 |            |  |
|  |  |  +----------+ +----------+ +----------+     |            |  |
|  |  |  |  Chat    | |Embeddings| |Translation|     |            |  |
|  |  |  |Generation| |          | |           |     |            |  |
|  |  |  +----------+ +----------+ +----------+     |            |  |
|  |  +---------------------------------------------+            |  |
|  +--------------------------------------------------------------+  |
+--------------------------------------------------------------------+
```

## Key Components

### 1. Multi-Tenant Architecture
- Each business (tenant) has isolated data scoped by `business_id`
- Business profile, settings, and subscription plan
- Role-based access: Admin, Agent, Viewer

### 2. AI Customer Support (Gemini)
- Real-time chat with natural language understanding
- Multi-language: English, Amharic (አማርኛ), Afaan Oromo
- Intent classification: support, booking, order, inquiry, complaint
- Sentiment analysis
- Entity extraction for business-specific information
- Automatic escalation when AI cannot handle the request

### 3. RAG (Retrieval Augmented Generation)
- Documents are chunked and embedded using Gemini Embedding API
- Semantic search retrieves relevant context before AI response
- Grounds AI responses in business-specific knowledge
- Supports: PDF, DOCX, TXT, FAQ content

### 4. Appointment Booking
- Automated slot availability checking
- AI-powered booking through natural conversation
- Confirmation messages
- Status tracking: scheduled, confirmed, cancelled, completed

### 5. Order Management
- AI-assisted order taking through chat
- Product catalog with availability checking
- Automated quotation generation
- Invoice generation

### 6. Ticket Management
- Automatic ticket creation from escalated conversations
- Status workflow: open -> in_progress -> resolved -> closed
- Priority levels: low, medium, high, urgent
- Assignment to team members

### 7. Multi-Channel Support
- Web chat widget (embeddable via script tag)
- WhatsApp Business API integration
- Telegram bot integration
- Facebook Messenger integration

### 8. Analytics Dashboard
- Real-time conversation metrics
- Customer satisfaction scoring
- Common topic identification
- Escalation rate monitoring
- AI-identified revenue opportunities

## Data Flow

### Customer Support Flow:
1. Customer sends message via any channel
2. Message is received by the Support API
3. RAG service searches knowledge base for relevant context
4. Gemini AI generates response with context grounding
5. Response is translated to customer's language
6. Intent is classified for business insights
7. Response is sent back to customer
8. If AI cannot handle -> ticket is created -> agent is notified

## Security

- JWT-based authentication with access/refresh tokens
- Password hashing with bcrypt
- Role-based access control (RBAC)
- Data isolation per tenant (business_id)
- API rate limiting
- Audit logging for all operations
- HTTPS enforced in production
- CORS restricted to allowed origins

## Subscription Tiers

| Feature | Free | Starter ($29) | Business ($99) | Enterprise |
|---------|------|---------------|----------------|------------|
| Conversations/mo | 100 | 1,000 | 10,000 | Unlimited |
| Team Members | 1 | 3 | 10 | Unlimited |
| Documents | 3 | 10 | 50 | Unlimited |
| Channels | Web | Web + WhatsApp | All | All + Custom |
| Analytics | Basic | Basic | Advanced | Full + API |
| Support | Email | Email + Chat | Priority | 24/7 Dedicated |

## Deployment

- **Backend**: Google Cloud Run (serverless container)
- **Frontend**: Google Cloud Run (Next.js standalone)
- **Database**: Cloud SQL for PostgreSQL
- **AI**: Vertex AI (Gemini API)
- **Storage**: Cloud Storage for uploaded documents
- **CI/CD**: Cloud Build with automatic deployment

## Environment Variables

### Backend (.env)
- `DATABASE_URL` - PostgreSQL connection string
- `SECRET_KEY` - JWT signing secret
- `GEMINI_API_KEY` - Google Gemini API key
- `ENVIRONMENT` - development/production
- `FRONTEND_URL` - CORS allowed origin
- `CORS_ORIGINS` - Comma-separated origins

### Frontend (.env.local)
- `NEXT_PUBLIC_API_URL` - Backend API URL
- `NEXT_PUBLIC_APP_URL` - Frontend URL

## Development Setup

1. Clone the repository
2. Copy `.env.example` to `.env` and configure
3. Run `docker-compose up -d postgres` for the database
4. Start backend: `cd backend && uvicorn app.main:app --reload`
5. Start frontend: `cd frontend && npm run dev`
6. Seed demo data: `python scripts/seed_demo.py`
7. Access at http://localhost:3000

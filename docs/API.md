# SmartSupport AI API Documentation

Base URL: `https://your-domain.com/api/v1`

## Authentication

### Register a new business
`POST /auth/register`
```json
{
  "email": "owner@business.com",
  "password": "secure-password",
  "full_name": "Business Owner",
  "business_name": "My Business",
  "business_category": "restaurant"
}
```

### Login
`POST /auth/login`
```json
{
  "email": "owner@business.com",
  "password": "secure-password"
}
```
Response: `{ access_token, refresh_token, token_type, user }`

### Get current user
`GET /auth/me`
Headers: `Authorization: Bearer <token>`

## Business

### Get profile
`GET /business/profile`

### Update profile
`PUT /business/profile`

### Get stats
`GET /business/stats`

## Support

### Chat with AI
`POST /support/chat`
```json
{
  "message": "What are your opening hours?",
  "conversation_id": "optional-existing-id",
  "language": "en"
}
```

### List conversations
`GET /support/conversations?status=active&limit=20`

### Get conversation
`GET /support/conversations/:id`

### Escalate conversation
`POST /support/conversations/:id/escalate`

## Tickets

### Create ticket
`POST /tickets`
```json
{
  "customer_id": "uuid",
  "subject": "Issue with order",
  "description": "My order hasn't arrived yet",
  "priority": "high"
}
```

### List tickets
`GET /tickets?status=open&priority=high`

## Appointments

### Get available slots
`POST /appointments/slots`
```json
{
  "date": "2024-02-20",
  "service": "General Checkup"
}
```

### Create appointment
`POST /appointments`
```json
{
  "customer_id": "uuid",
  "title": "Dental Checkup",
  "start_time": "2024-02-20T10:00:00Z",
  "end_time": "2024-02-20T11:00:00Z",
  "service_name": "Dental Cleaning"
}
```

## Orders

### Create order
`POST /orders`
```json
{
  "customer_id": "uuid",
  "items": [
    { "product_id": "uuid", "quantity": 2 }
  ],
  "notes": "Please deliver before 5pm"
}
```

### List orders
`GET /orders?status=confirmed`

### Generate invoice
`GET /orders/:id/invoice`

## Knowledge Base

### Upload document
`POST /knowledge/upload`
FormData: `file` (PDF, DOCX, or TXT)

### Search knowledge base
`POST /knowledge/search`
```json
{
  "query": "What are your business hours?"
}
```

## Analytics

### Overview
`GET /analytics/overview`

### Conversations
`GET /analytics/conversations`

### Satisfaction
`GET /analytics/satisfaction`

### Topics
`GET /analytics/topics`

### Revenue opportunities
`GET /analytics/opportunities`

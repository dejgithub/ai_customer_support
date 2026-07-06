#!/bin/bash
set -e

echo "=== SmartSupport AI - Google Cloud Deployment ==="

# Configuration
PROJECT_ID=${GCP_PROJECT_ID:-"smartsupport-ai"}
REGION=${GCP_REGION:-"us-central1"}
SERVICE_NAME_BACKEND="smartsupport-backend"
SERVICE_NAME_FRONTEND="smartsupport-frontend"
DB_INSTANCE="smartsupport-db"

echo "Project: $PROJECT_ID"
echo "Region: $REGION"
echo ""

# Enable required services
echo "[1/6] Enabling Google Cloud services..."
gcloud services enable cloudbuild.googleapis.com run.googleapis.com sqladmin.googleapis.com aiplatform.googleapis.com secretmanager.googleapis.com

# Create Cloud SQL instance if not exists
echo "[2/6] Setting up Cloud SQL..."
if ! gcloud sql instances describe $DB_INSTANCE --project=$PROJECT_ID &>/dev/null; then
    gcloud sql instances create $DB_INSTANCE \
        --database-version=POSTGRES_15 \
        --tier=db-f1-micro \
        --region=$REGION \
        --project=$PROJECT_ID
    gcloud sql databases create smartsupport --instance=$DB_INSTANCE --project=$PROJECT_ID
fi

# Get database connection info
DB_CONNECTION_NAME=$(gcloud sql instances describe $DB_INSTANCE --project=$PROJECT_ID --format="value(connectionName)")
DB_PASSWORD=$(gcloud secrets versions access latest --secret=db-password --project=$PROJECT_ID 2>/dev/null || echo "default-password")

# Store secrets
echo "[3/6] Setting up secrets..."
echo -n "$DB_PASSWORD" | gcloud secrets create db-password --data-file=- --project=$PROJECT_ID 2>/dev/null || true
echo -n "$GEMINI_API_KEY" | gcloud secrets create gemini-api-key --data-file=- --project=$PROJECT_ID 2>/dev/null || true
echo -n "change-this-secret-key" | gcloud secrets create jwt-secret --data-file=- --project=$PROJECT_ID 2>/dev/null || true

# Build and deploy backend
echo "[4/6] Deploying backend..."
cd backend

gcloud builds submit --tag gcr.io/$PROJECT_ID/$SERVICE_NAME_BACKEND --project=$PROJECT_ID

gcloud run deploy $SERVICE_NAME_BACKEND \
    --image=gcr.io/$PROJECT_ID/$SERVICE_NAME_BACKEND \
    --platform=managed \
    --region=$REGION \
    --allow-unauthenticated \
    --add-cloudsql-instances=$DB_CONNECTION_NAME \
    --set-env-vars="DATABASE_URL=postgresql+asyncpg://postgres:$DB_PASSWORD@//cloudsql/$DB_CONNECTION_NAME/smartsupport,ENVIRONMENT=production,FRONTEND_URL=https://$SERVICE_NAME_FRONTEND-xxxxx-$REGION.a.run.app" \
    --set-secrets="GEMINI_API_KEY=gemini-api-key:latest,SECRET_KEY=jwt-secret:latest" \
    --min-instances=0 \
    --max-instances=10 \
    --cpu=1 \
    --memory=512Mi \
    --concurrency=80 \
    --timeout=300 \
    --project=$PROJECT_ID

cd ..

# Build and deploy frontend
echo "[5/6] Deploying frontend..."
cd frontend

BACKEND_URL=$(gcloud run services describe $SERVICE_NAME_BACKEND --region=$REGION --project=$PROJECT_ID --format="value(status.url)")

gcloud builds submit --tag gcr.io/$PROJECT_ID/$SERVICE_NAME_FRONTEND --project=$PROJECT_ID

gcloud run deploy $SERVICE_NAME_FRONTEND \
    --image=gcr.io/$PROJECT_ID/$SERVICE_NAME_FRONTEND \
    --platform=managed \
    --region=$REGION \
    --allow-unauthenticated \
    --set-env-vars="NEXT_PUBLIC_API_URL=$BACKEND_URL" \
    --min-instances=0 \
    --max-instances=10 \
    --cpu=1 \
    --memory=512Mi \
    --project=$PROJECT_ID

cd ..

# Get URLs
echo "[6/6] Deployment complete!"
echo ""
echo "=== URLs ==="
echo "Frontend: $(gcloud run services describe $SERVICE_NAME_FRONTEND --region=$REGION --project=$PROJECT_ID --format='value(status.url)')"
echo "Backend:  $(gcloud run services describe $SERVICE_NAME_BACKEND --region=$REGION --project=$PROJECT_ID --format='value(status.url)')"
echo ""
echo "Run the seed script to populate demo data:"
echo "  python scripts/seed_demo.py"

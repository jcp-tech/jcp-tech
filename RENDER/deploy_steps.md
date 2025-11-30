# Deployment Steps for Google Cloud Run

This document outlines the steps to deploy the FastAPI application to Google Cloud Run.

## Prerequisites

1. **Google Cloud SDK**: Ensure you have the Google Cloud SDK installed and initialized.
2. **Docker**: Ensure Docker is installed and running (optional if using Cloud Build, but good for local testing).
3. **Google Cloud Project**: You need an active Google Cloud Project.
4. **GitHub Secrets**: For the GitHub Actions workflow to work, you must set the following secrets in your repository settings:
    *   `GCLOUD_SERVICE_KEY`: The JSON key of your Google Cloud service account.
    *   `FIREBASE_CREDENTIALS`: The JSON content of your Firebase service account key (e.g., `serviceAccountKey.json`).
    *   `FIREBASE_DATABASE_URL`: The URL of your Firebase Realtime Database.

## Deployment Steps

### 1. Authenticate with Google Cloud

Open your terminal (PowerShell or Command Prompt) and run:

```bash
gcloud auth login
gcloud config set project cv-jcp
```

### 2. Enable Required Services

Ensure the Cloud Run and Container Registry (or Artifact Registry) APIs are enabled:

```bash
gcloud services enable run.googleapis.com containerregistry.googleapis.com
```

### 3. Deploy to Cloud Run

Run the following command to build and deploy your application. This command uses Google Cloud Build to build the container image and then deploys it to Cloud Run.

```bash
gcloud run deploy portfolio --source . --platform managed --region us-central1 --allow-unauthenticated
```

*   `portfolio`: This is the name of your Cloud Run service. You can change it if you like.
*   `--source .`: This tells gcloud to build the container from the current directory (using the Dockerfile).
*   `--platform managed`: Specifies to use the fully managed Cloud Run platform.
*   `--region us-central1`: Specifies the region. You can change this to a region closer to you.
*   `--allow-unauthenticated`: This makes your service publicly accessible.

### 4. Verify Deployment

After the deployment command finishes, it will output a Service URL. Open this URL in your browser to verify the application is running.

### 5. Get Current Deployed URL

The Cloud Run URL is generated based on the service name and region. If the URL changes, you can retrieve the latest one using:

```bash
gcloud run services describe portfolio --region us-central1 --format "value(status.url)"
```

**Current URL:**
> https://portfolio-gekxrfkuiq-uc.a.run.app/

---
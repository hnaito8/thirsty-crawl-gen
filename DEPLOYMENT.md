# Deployment Guide

This app ships as a Docker container and runs on [Cloud Run](https://cloud.google.com/run). [Firebase Hosting](https://firebase.google.com/docs/hosting) can sit in front of it for a custom domain, global CDN, and Firebase's free SSL certs.

```
Browser → Firebase Hosting (optional CDN/domain) → Cloud Run (Next.js container) → Gemini API
```

## Prerequisites

- A Google Cloud project with billing enabled
- [`gcloud` CLI](https://cloud.google.com/sdk/docs/install), authenticated: `gcloud auth login`
- [`firebase` CLI](https://firebase.google.com/docs/cli#install_the_firebase_cli) (only needed for the Hosting step): `npm install -g firebase-tools`
- A [Gemini API key](https://aistudio.google.com/apikey)
- Docker, if you want to build/test the image locally (Cloud Build can also build it remotely without Docker installed)

Set your project once so every `gcloud` command below uses it:

```bash
gcloud config set project YOUR_PROJECT_ID
```

## 1. Enable the required APIs

```bash
gcloud services enable \
  run.googleapis.com \
  cloudbuild.googleapis.com \
  artifactregistry.googleapis.com \
  secretmanager.googleapis.com
```

## 2. Store the Gemini API key in Secret Manager

The container reads `GEMINI_API_KEY` at request time — it's never baked into the image. Store it as a secret so it isn't exposed in deploy logs or `gcloud run services describe` output:

```bash
printf '%s' "YOUR_GEMINI_API_KEY" | gcloud secrets create GEMINI_API_KEY --data-file=-

# Let Cloud Run's runtime service account read it
gcloud secrets add-iam-policy-binding GEMINI_API_KEY \
  --member="serviceAccount:$(gcloud projects describe $(gcloud config get-value project) --format='value(projectNumber)')-compute@developer.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"
```

(If you rotate the key later, create a new version with `gcloud secrets versions add GEMINI_API_KEY --data-file=-` — `cloudbuild.yaml` and the deploy command below always reference `:latest`.)

## 3. Create an Artifact Registry repository

```bash
gcloud artifacts repositories create thirsty-app \
  --repository-format=docker \
  --location=us-central1
```

Using a different region or repo name? Update the `_REGION` / `_REPOSITORY` substitutions in [`cloudbuild.yaml`](cloudbuild.yaml) and the `serviceId`/`region` in [`firebase.json`](firebase.json) to match.

## 4. Build and deploy to Cloud Run

The easiest path is to let Cloud Build do everything — build the image, push it, and deploy — using [`cloudbuild.yaml`](cloudbuild.yaml):

```bash
gcloud builds submit --config cloudbuild.yaml .
```

This builds the [`Dockerfile`](Dockerfile), pushes it to Artifact Registry, and runs `gcloud run deploy` with the `GEMINI_API_KEY` secret wired in. The first deploy creates the `thirsty-app` Cloud Run service in `us-central1`; later runs of the same command redeploy a new revision.

Once it finishes, grab the URL:

```bash
gcloud run services describe thirsty-app --region=us-central1 --format='value(status.url)'
```

### Alternative: deploy directly from source (no Dockerfile build step locally)

For quick iteration you can skip `cloudbuild.yaml` entirely and let Cloud Run build from source:

```bash
gcloud run deploy thirsty-app \
  --source . \
  --region=us-central1 \
  --allow-unauthenticated \
  --set-secrets=GEMINI_API_KEY=GEMINI_API_KEY:latest
```

### Testing the container locally first

```bash
docker build -t thirsty-app .
docker run -p 8080:8080 -e GEMINI_API_KEY="YOUR_GEMINI_API_KEY" thirsty-app
# open http://localhost:8080
```

## 5. (Optional) Put Firebase Hosting in front of Cloud Run

This gives you a `*.web.app` domain (or your own custom domain) with Firebase's CDN and managed SSL, while Cloud Run still does all the actual rendering — `firebase.json` rewrites every request to the Cloud Run service.

```bash
firebase login
firebase use --add   # pick your GCP project, or edit .firebaserc directly
```

Update `.firebaserc` with your actual project ID, and confirm `firebase.json`'s `rewrites[0].run.serviceId`/`region` match the Cloud Run service you deployed in step 4 (defaults: `thirsty-app` / `us-central1`). Then:

```bash
firebase deploy --only hosting
```

Your app is now reachable at `https://YOUR_PROJECT_ID.web.app` (and still directly at the Cloud Run URL).

## Redeploying after code changes

```bash
gcloud builds submit --config cloudbuild.yaml .
```

Firebase Hosting needs no redeploy for app code changes — it's just rewriting to Cloud Run — only run `firebase deploy --only hosting` again if you change `firebase.json` itself.

## Environment variables reference

| Variable | Required | Set via |
| --- | --- | --- |
| `GEMINI_API_KEY` | Yes | Secret Manager (`--set-secrets`), or `-e` for local `docker run` |
| `PORT` | No | Injected automatically by Cloud Run; defaults to `8080` for local Docker runs |

See [`.env.local.example`](.env.local.example) for local development (`npm run dev`).

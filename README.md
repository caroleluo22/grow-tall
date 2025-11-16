# Grow Taller with AI

This is a fun mobile-friendly web app that helps kids learn about healthy eating for growth. Snap a photo of your meal and get instant, friendly advice from our AI nutritionist!

## Deploy to Google Cloud

You can deploy this application to Google Cloud's serverless platform, Cloud Run, with a single click. This will automatically build your app, package it, and deploy it, giving you a shareable public URL.

[![Deploy to Google Cloud](https://deploy.cloud.run/button.svg)](https://deploy.cloud.run)

### Instructions

1.  **Push to GitHub:** Create a new, public repository on [GitHub](https://github.com/new) and push all the application files (`index.html`, `App.tsx`, `Dockerfile`, `cloudbuild.yaml`, etc.) to it.

2.  **Click the Deploy Button:** In your new GitHub repository, click the "Deploy to Google Cloud" button above.

3.  **Follow the Prompts:** The Google Cloud console will open and guide you through the setup. You'll be asked to:
    *   Sign in and select a Google Cloud project (you can create a new one for free).
    *   Choose a region where you want your app to be hosted (e.g., `us-central1`).
    *   **Crucially**, you must provide your Gemini API key. In the "Environment variables" section, add a new variable:
        *   **Name:** `API_KEY`
        *   **Value:** Paste your Gemini API key here.
    *   Agree to the terms and click **"Deploy"**.

4.  **Deploy & Share:** Google Cloud will now build and deploy your application automatically. This may take a few minutes. Once it's finished, you'll be given a public URL for your live app that you can share with anyone in the world!
# Google Cloud Monitoring Setup

This guide explains how to set up Google Cloud monitoring for both local development and production on Vercel.

## Prerequisites

1. Google Cloud Project ID (already in `.env`: `GOOGLE_CLOUD_PROJECT_ID`)
2. Service account with "Monitoring Viewer" role
3. Service account JSON key file

## Local Development Setup

1. Save your service account JSON key file to `./secrets/google-service-account.json`
2. Add to `.env.local`:
   ```
   GOOGLE_APPLICATION_CREDENTIALS=./secrets/google-service-account.json
   ```
3. Ensure `secrets/` is in `.gitignore` (it should already be)

## Production Setup (Vercel)

1. Open your service account JSON file
2. Copy the entire JSON content
3. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
4. Add a new environment variable:
   - Name: `GOOGLE_CREDENTIALS_JSON`
   - Value: Paste the entire JSON content (Vercel will handle it as a single string)
   - Environment: Production (and Preview if desired)
5. Make sure `GOOGLE_CLOUD_PROJECT_ID` is also set in Vercel

## How It Works

The monitoring service automatically detects which credential method to use:
- **Local**: Uses file path from `GOOGLE_APPLICATION_CREDENTIALS`
- **Vercel**: Uses JSON string from `GOOGLE_CREDENTIALS_JSON`

## Security Notes

- **Never commit** the service account JSON file to git
- **Never expose** credentials in client-side code
- Use separate service accounts for dev/staging/production
- Regularly rotate credentials
- Grant minimal required permissions (Monitoring Viewer only)

## Verification

After setup, the monitoring dashboard should show:
- Google Cloud Monitoring: Configured ✓
- Data source: google-cloud or hybrid

If it shows "Not Configured", check:
1. Environment variables are set correctly
2. Service account has proper permissions
3. Project ID matches your Google Cloud project
# 🔐 GitHub Secrets Configuration Guide

This document explains how to configure the required secrets for the CI/CD pipeline.

## 📋 Required Secrets

Add these secrets to your GitHub repository:

### 🎯 Navigate to Secrets
1. Go to your GitHub repository
2. Click **Settings** tab
3. Click **Secrets and variables** → **Actions**
4. Click **New repository secret**

### 🔑 Required Secrets List

| Secret Name | Description | How to Get |
|-------------|-------------|------------|
| `RENDER_API_KEY` | Render API authentication key | [Render Account Settings](https://dashboard.render.com/account) → API Keys |
| `RENDER_SERVICE_ID` | Your backend service ID | Render Dashboard → Service URL (srv-xxxxx) |
| `VERCEL_TOKEN` | Vercel API token | [Vercel Account Settings](https://vercel.com/account/tokens) |
| `VERCEL_ORG_ID` | Vercel organization ID | Vercel Project Settings → General |
| `VERCEL_PROJECT_ID` | Vercel project ID | Vercel Project Settings → General |

## 🎯 Step-by-Step Secret Setup

### 1️⃣ Get Render API Key
```bash
# Visit: https://dashboard.render.com/account
# Scroll to "API Keys" section
# Click "Create API Key"
# Copy the generated key
```

### 2️⃣ Get Render Service ID
```bash
# Go to: https://dashboard.render.com
# Click your "mindcare-backend" service
# Copy the service ID from URL: srv-XXXXXXXXXX
```

### 3️⃣ Get Vercel Tokens
```bash
# Visit: https://vercel.com/account/tokens
# Create a new token with appropriate permissions
# Copy the token

# For ORG_ID and PROJECT_ID:
# Go to your Vercel project → Settings → General
# Copy "Project ID" and "Team ID" (if using team, otherwise user ID)
```

### 4️⃣ Add Secrets to GitHub
```bash
# In your GitHub repo:
# Settings → Secrets and variables → Actions → New repository secret

RENDER_API_KEY=rnd_xxxxxxxxxxxxx
RENDER_SERVICE_ID=srv-xxxxxxxxxxxxx
VERCEL_TOKEN=xxxxxxxxxxxxxxxxxx
VERCEL_ORG_ID=team_xxxxxxxxxxxxx (or user ID)
VERCEL_PROJECT_ID=prj_xxxxxxxxxxxxx
```

## ✅ Verification

After adding secrets, check:
- [ ] All 5 secrets are added
- [ ] No typos in secret names
- [ ] Values are correct (no extra spaces)
- [ ] Render service ID starts with `srv-`
- [ ] Vercel project ID starts with `prj-`

## 🚀 Trigger First Deployment

After setting up secrets:
```bash
git add .
git commit -m "feat: add CI/CD pipeline with automated deployment"
git push origin master
```

## 🔍 Troubleshooting

### Common Issues:
- **401 Unauthorized**: Check API keys
- **404 Not Found**: Verify service/project IDs
- **403 Forbidden**: Check token permissions
- **Deploy fails**: Check build logs in Actions tab

### Debug Commands:
```bash
# Check workflow runs
# Go to: https://github.com/YourUsername/MindCare/actions

# View logs for failed steps
# Click on failed workflow → Click failed job → Expand failed step
```

## 📞 Need Help?

If you encounter issues:
1. Check the GitHub Actions logs
2. Verify all secrets are correctly configured
3. Test API keys manually using curl
4. Check Render and Vercel dashboards for errors

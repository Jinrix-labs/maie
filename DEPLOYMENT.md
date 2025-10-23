# Deployment Guide for Vercel

## Prerequisites

1. A Vercel account (free tier available)
2. Your Anthropic API key
3. Git repository (GitHub, GitLab, or Bitbucket)

## Deployment Steps

### 1. Environment Variables

Before deploying, you need to set up your environment variables in Vercel:

1. Go to your Vercel dashboard
2. Select your project
3. Go to Settings > Environment Variables
4. Add the following variable:
   - **Name**: `ANTHROPIC_API_KEY`
   - **Value**: Your actual Anthropic API key
   - **Environment**: Production (and Preview if desired)

### 2. Deploy to Vercel

#### Option A: Deploy via Vercel CLI

```bash
# Install Vercel CLI globally
npm i -g vercel

# Login to Vercel
vercel login

# Deploy from your project directory
vercel

# For production deployment
vercel --prod
```

#### Option B: Deploy via Vercel Dashboard

1. Connect your GitHub/GitLab/Bitbucket repository to Vercel
2. Vercel will automatically detect it's a React app
3. The build settings should be automatically configured
4. Deploy!

### 3. Build Configuration

The project is configured with:

- **Build Command**: `npm run build`
- **Output Directory**: `build`
- **Install Command**: `npm install`

### 4. API Routes

The backend API is configured to run as serverless functions:

- API endpoint: `/api/chat`
- Handles Anthropic API proxy requests
- Environment variables are automatically injected

## Local Development

```bash
# Install dependencies
npm install
cd backend && npm install

# Start development servers
npm start  # Frontend on port 3000
cd backend && npm run dev  # Backend on port 3001
```

## Troubleshooting

### Common Issues

1. **API Key not working**: Ensure `ANTHROPIC_API_KEY` is set in Vercel environment variables
2. **Build failures**: Check that all dependencies are in package.json
3. **CORS issues**: The backend is configured with CORS enabled for all origins

### Environment Variables Required

- `ANTHROPIC_API_KEY`: Your Anthropic API key for Claude API access

## Security Notes

- Never commit your actual API key to the repository
- Use Vercel's environment variables for sensitive data
- The API key is only used server-side and never exposed to the client

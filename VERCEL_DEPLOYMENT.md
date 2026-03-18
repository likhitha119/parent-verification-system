# Deploy Frontend to Vercel

## Quick Deploy Steps

### Option 1: Using Vercel CLI (Fastest)

1. Install Vercel CLI globally:
   ```bash
   npm install -g vercel
   ```

2. Navigate to frontend folder and deploy:
   ```bash
   cd frontend
   vercel
   ```

3. Follow the prompts:
   - Set up and deploy? **Y**
   - Which scope? Select your account
   - Link to existing project? **N**
   - Project name? **eduparent-portal**
   - In which directory is your code located? **.**
   - Want to override settings? **Y**
   - Build Command? **npm run build**
   - Output Directory? **dist**
   - Development Command? **npm run dev**

4. Set environment variable:
   ```bash
   vercel env add VITE_API_URL
   ```
   Enter: `https://eduparent-backend.onrender.com`

5. Deploy to production:
   ```bash
   vercel --prod
   ```

### Option 2: Using Vercel Dashboard

1. Go to https://vercel.com and sign in with GitHub
2. Click "Add New..." → "Project"
3. Import your repository: `likhitha119/parent-verification-system`
4. Configure:
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Add Environment Variable:
   - **Name**: `VITE_API_URL`
   - **Value**: `https://eduparent-backend.onrender.com`
6. Click "Deploy"

## After Deployment

Your frontend will be live at: `https://eduparent-portal.vercel.app` (or similar)

Update your Render backend environment variable:
- Go to Render dashboard
- Select your backend service
- Add/Update `FRONTEND_URL` to your Vercel URL

## Automatic Deployments

Vercel automatically deploys:
- Every push to `main` branch → Production
- Every pull request → Preview deployment

Done! Your app is live.

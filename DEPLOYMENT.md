# Deployment Guide for EduParent Portal Backend on Render

## Prerequisites
- GitHub account with your code pushed
- Render account (sign up at https://render.com)
- Gmail account with App Password generated

## Step 1: Generate Gmail App Password
1. Go to your Google Account settings
2. Enable 2-Factor Authentication if not already enabled
3. Go to Security > 2-Step Verification > App passwords
4. Generate a new app password for "Mail"
5. Save this password - you'll need it for Render

## Step 2: Deploy on Render

### Option A: Using Render Dashboard (Recommended)
1. Go to https://dashboard.render.com
2. Click "New +" and select "Web Service"
3. Connect your GitHub repository: `likhitha119/parent-verification-system`
4. Configure the service:
   - **Name**: `eduparent-backend`
   - **Region**: Oregon (US West) or closest to you
   - **Branch**: `main`
   - **Root Directory**: `backend`
   - **Runtime**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Free

5. Add Environment Variables (click "Advanced" > "Add Environment Variable"):
   ```
   PORT=10000
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_SECURE=false
   EMAIL_USER=talagapulikhitha06@gmail.com
   EMAIL_PASS=nzgukjqyilkksftd
   EMAIL_FROM="EduParent" <no-reply@eduparent.com>
   FRONTEND_URL=http://localhost:5173
   ```

6. Click "Create Web Service"

### Option B: Using render.yaml (Blueprint)
1. Go to https://dashboard.render.com
2. Click "New +" and select "Blueprint"
3. Connect your GitHub repository
4. Render will detect the `render.yaml` file
5. Add the secret environment variables when prompted:
   - `EMAIL_USER`: Your Gmail address
   - `EMAIL_PASS`: Your Gmail app password
   - `FRONTEND_URL`: Your frontend URL (update after frontend deployment)

## Step 3: Verify Deployment
1. Wait for the build to complete (2-3 minutes)
2. Once deployed, you'll get a URL like: `https://eduparent-backend.onrender.com`
3. Test the API by visiting: `https://your-app-url.onrender.com/`
4. You should see: `{"message":"EduParent backend is running."}`

## Step 4: Update Frontend
After deployment, update your frontend to use the Render backend URL:
- Replace `http://localhost:5000` with your Render URL in frontend API calls
- Update the `FRONTEND_URL` environment variable in Render with your deployed frontend URL

## Important Notes
- Free tier services sleep after 15 minutes of inactivity
- First request after sleep may take 30-60 seconds
- For production, consider upgrading to a paid plan
- Keep your EMAIL_PASS secure and never commit it to Git

## Troubleshooting
- Check logs in Render Dashboard under "Logs" tab
- Ensure all environment variables are set correctly
- Verify your Gmail app password is correct
- Check that the build command completed successfully

# 🚀 AMAN System: Deployment Guide (Vercel & GitHub)

This guide details how to move the AMAN System from your local environment to production.

## 1. Prepare for GitHub
Run these commands in the root directory:
```powershell
git init
git add .
git commit -m "feat: complete system integration"
git branch -M main
git remote add origin <YOUR_GITHUB_REPO_URL>
git push -u origin main
```

## 2. Deploy Backend (NestJS API)
- **Platform**: Vercel
- **Root Directory**: `./` (Root of monorepo)
- **Framework Preset**: `Other`
- **Build Command**: `pnpm build --filter=api`
- **Output Directory**: `dist/apps/api` (Vercel usually handles this via the handler in `main.ts`)
- **Environment Variables**:
  - `DATABASE_URL`: Your Real Supabase Connection String (Vercel supports IPv6).
  - `JWT_ACCESS_SECRET`: From your `.env`.
  - `SUPABASE_URL` & `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase keys.

## 3. Deploy Frontend (React/Vite Web)
- **Platform**: Vercel
- **Root Directory**: `./`
- **Framework Preset**: `Vite`
- **Build Command**: `pnpm build --filter=web`
- **Output Directory**: `apps/web/dist`
- **Environment Variables**:
  - `VITE_API_URL`: The URL of your deployed Backend API.

## 💡 Pro Tip: Switching back to Supabase in Production
When you deploy to Vercel, the connection to Supabase will work perfectly because Vercel's infrastructure supports IPv6. 

To switch back:
1. Go to `apps/api/prisma/schema.prisma`.
2. Change `provider = "sqlite"` to `provider = "postgresql"`.
3. Re-enable `DATABASE_URL` in `.env`.
4. Run `pnpm exec prisma generate` before pushing to GitHub.

---
**System is now production-ready!** 🫡

# Deployment (Task 15)

## 1. MongoDB Atlas
Create a free cluster → Database Access user → Network Access `0.0.0.0/0` → copy the `mongodb+srv://…/course_management` URI.

## 2. Backend on Render
New → Blueprint → pick this repo (uses `render.yaml`), or create a Web Service manually:
root dir `backend`, build `npm install --omit=optional`, start `npm start`.
Environment variables: `MONGO_URI`, `JWT_SECRET` (random), `CLIENT_URL` (your Vercel URL), `ADMIN_PASSWORD` (12+ chars), `NODE_ENV=production`, `SEED_DEMO=false`.
Check `https://<service>.onrender.com/api/health`.

## 3. Frontend on Vercel
Import repo → Root Directory `react-frontend` → Framework Vite. Environment variables:
`VITE_API_MODE=real`, `VITE_API_URL=https://<service>.onrender.com/api/v1`, `VITE_SOCKET_URL=https://<service>.onrender.com`.
`vercel.json` already rewrites all routes to `index.html`.

## 4. Finish
Put the Vercel URL into the backend `CLIENT_URL` and redeploy. Test login, enrol, chat.

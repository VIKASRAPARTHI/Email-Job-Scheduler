# Email Job Scheduler

A production-grade email scheduler service with a real-time dashboard. Built with **TypeScript**, **Express**, **Next.js**, **BullMQ**, and **Redis**.

---

## Getting Started

### Prerequisites
- **Node.js**: v18 or higher
- **Docker Desktop**: For running Redis and PostgreSQL
- **Google Cloud Console Account**: For OAuth configuration

### 1. Infrastructure Setup
Use Docker to spin up the required Redis and PostgreSQL instances:
```bash
docker-compose up -d
```
*Note: Postgres runs on port 5433 and Redis on 6380 to avoid conflicts with default installations.*

### 2. Backend Setup
1. Navigate to the backend directory: `cd backend`
2. Install dependencies: `npm install`
3. Configure `.env`: Use the provided `.env` (ensure `DATABASE_URL` and `REDIS_URL` point to the Docker ports).
4. Synchronize database: `npx prisma db push`
5. Start the server: `npm run dev` (Runs on `http://localhost:4000`)

### 3. Frontend Setup
1. Navigate to the frontend directory: `cd frontend`
2. Install dependencies: `npm install`
3. Start the application: `npm run dev` (Runs on `http://localhost:3000`)

---

## Features Implemented

### Backend
- **Scheduler**: API endpoint to accept email requests with specific delay/timing.
- **Persistence**: Powered by **PostgreSQL (Prisma)**. Jobs survive server restarts.
- **Queueing Engine**: **BullMQ** handles job distribution and retries.
- **Rate Limiting**: Configurable hourly limits (e.g., 50 emails/hour) using BullMQ's native limiter.
- **Worker Concurrency**: Scalable worker pool for processing multiple emails simultaneously.
## 📦 Deployment Instructions (Hybrid Approach)

This project is configured for a professional hybrid deployment: **Vercel** for the Frontend and **Railway** for the Backend/Worker.

### 1. Backend & Infrastructure (Railway)
1. Fork/Push this repo to GitHub.
2. In Railway, click **New Project** -> **GitHub Repo**.
3. Set the **Root Directory** to `/backend`.
4. Add a **PostgreSQL** and **Redis** service in the same project.
5. Add the following **Environment Variables**:
   - `FRONTEND_URL`: Your Vercel domain (e.g., `https://myapp.vercel.app`).
   - `BACKEND_URL`: Your Railway domain (e.g., `https://backend.railway.app`).
   - `GOOGLE_CLIENT_ID` & `GOOGLE_CLIENT_SECRET`: From Google Cloud Console.

### 2. Frontend (Vercel)
1. In Vercel, click **Add New** -> **Project**.
2. Select this repo and set the **Root Directory** to `/frontend`.
3. Add the following **Environment Variable**:
   - `NEXT_PUBLIC_API_URL`: Your Railway domain.

---

## 📄 Submission Notes
- **GitHub Access**: Please grant access to `Mitrajit`.
- **Demo Video**: See `submission_guide.md` for the demo script and walkthrough.
### Frontend
- **Google OAuth**: Integrated authentication flow.
- **Dashboard**: Real-time view of scheduled and sent emails with filtering.
- **Compose Interface**: Modern UI for creating emails with multi-recipient support.
- **CSV/Bulk Upload**: Automatically parse email addresses from uploaded files.

---

## Architecture Overview

### How Scheduling Works
1. **API Layer**: The `/api/schedule` endpoint receives the payload and attachments.
2. **Database First**: A record is created in PostgreSQL with status `PENDING`. This ensures that even if Redis fails before queueing, we have a record to reconcile.
3. **Queueing**: The job is added to a **BullMQ delayed queue**. The `delay` option in BullMQ handles the "send later" logic without custom cron jobs.

### Persistence on Restart
- **Redis Persistence**: Redis is configured with AOF (Append Only File) via Docker, ensuring the queue state is saved to disk.
- **State Recovery**: On service restart, the BullMQ worker automatically picks up unfinished "Delayed" or "Active" jobs from Redis.
- **DB Sync**: Each job payload contains the PostgreSQL record ID, allowing the worker to update the final status (`SENT` or `FAILED`) back to the DB upon completion.

### Rate Limiting & Concurrency
- **Rate Limiting**: Implemented via BullMQ's `limiter` configuration. It uses a token bucket algorithm in Redis to ensure the worker doesn't exceed the `MAX_EMAILS_PER_HOUR` setting across all instances.
- **Concurrency**: The worker is configured with a `concurrency` setting (default: 2), allowing it to process multiple jobs in parallel without blocking the main event loop.

---

## Testing with Ethereal Email

The system is pre-configured to use **Ethereal Email** (a fake SMTP service).
1. When a job is processed, the worker logs a **Preview URL** to the backend console.
2. Click the link to see exactly how your email was rendered and delivered.
3. To use your own credentials, update `ETHEREAL_USER` and `ETHEREAL_PASS` in `backend/.env`.

---
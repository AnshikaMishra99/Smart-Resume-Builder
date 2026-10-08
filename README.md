# Smart AI-Powered Resume Builder with Automated Evaluation

A modern full-stack MERN (MongoDB, Express, React, Node.js) application for building, evaluating, and customizing ATS-optimized resumes with Gemini AI assistance.

## Setup Instructions

### 1. Backend Setup
```bash
cd server
npm install
```
Edit `.env`:
- `PORT`: Server port (default `5000`)
- `MONGO_URI`: MongoDB Atlas URI or local MongoDB connection string
- `JWT_SECRET`: Secret key for signing JWT tokens (e.g. `super_secret_jwt_key`)
- `GEMINI_API_KEY`: Get a FREE key at https://aistudio.google.com/apikey
- `CLIENT_URL`: `http://localhost:5173`

Seed Demo Data & User:
```bash
npm run seed
```
> Creates demo user: **`demo@example.com`** / Password: **`demo123`** with a pre-configured sample resume.

Run Development Server:
```bash
npm run dev
```
Server runs on http://localhost:5000

### 2. Frontend Setup
```bash
cd client
npm install
npm run dev
```
Frontend runs on http://localhost:5173

### 3. Quick Demo Walkthrough
1. Open http://localhost:5173 → Sign in with **`demo@example.com`** / **`demo123`** (or create a new account).
2. Click **"Create New Resume"** → fill in Personal Info.
3. Use **"AI Summary Generator"** to auto-write your Objective.
4. Use **"AI Skill Suggester"** to add skills based on a target job role.
5. Use **"ATS Resume Analyzer"** to calculate job description match score & keyword suggestions.
6. Click **"Review with AI"** for overall resume feedback.
7. Click **"Save"** then **"Download PDF"**.

## API Endpoints

### Authentication Endpoints
| Method | Endpoint | Protection | Purpose |
|--------|----------|------------|---------|
| POST | `/api/auth/register` | Public | Register new user & return JWT |
| POST | `/api/auth/login` | Public | Authenticate user & return JWT |
| GET | `/api/auth/me` | Protected (Bearer) | Restore authenticated user profile |

### Resume Endpoints
| Method | Endpoint | Protection | Purpose |
|--------|----------|------------|---------|
| POST | `/api/resumes` | Protected (Bearer) | Create a new user-owned resume |
| GET | `/api/resumes` | Protected (Bearer) | List all user-owned resumes |
| GET | `/api/resumes/:id` | Protected (Bearer) | Get single resume by ID |
| PUT | `/api/resumes/:id` | Protected (Bearer) | Update resume by ID |
| DELETE | `/api/resumes/:id` | Protected (Bearer) | Delete resume by ID |
| GET | `/api/resumes/:id/download` | Protected (Bearer) | Stream PDF download |

### AI Endpoints
| Method | Endpoint | Protection | Purpose |
|--------|----------|------------|---------|
| POST | `/api/ai/review` | Protected (Bearer) | Comprehensive AI resume evaluation |
| POST | `/api/ai/suggest-skills` | Protected (Bearer) | AI skill recommendations |
| POST | `/api/ai/generate-summary` | Protected (Bearer) | AI executive summary generator |
| POST | `/api/ai/ats-match` | Protected (Bearer) | ATS Match Score & Keyword gap analysis |

## Future Enhancements (Bonus Ideas)
- Inline "Improve this bullet" AI rewrite
- Multi-template layout picker (Modern, Minimal, Executive)
- Resume version history & revision tracking
- Public shareable resume link

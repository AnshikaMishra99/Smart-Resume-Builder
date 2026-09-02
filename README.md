# Smart AI-Powered Resume Builder with Automated Evaluation

## Setup Instructions

### 1. Backend Setup
```bash
cd server
npm install
```
Edit `.env`:
- `MONGO_URI`: Local MongoDB (`mongodb://127.0.0.1:27017/resumeBuilder`) or free MongoDB Atlas connection string.
- `GEMINI_API_KEY`: Get a FREE key at https://aistudio.google.com/apikey

Run:
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

### 3. Test the Flow
1. Open http://localhost:5173 → Dashboard (empty initially)
2. Click "Create New Resume" → fill in Personal Info
3. Use "AI Summary Generator" to auto-write your Objective
4. Use "AI Skill Suggester" to add skills based on a target job role
5. Add Education, Projects, Achievements, Activities
6. Click "Review with AI" for feedback
7. Click "Save" then "Download PDF"

## API Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | /api/resumes | Create resume |
| GET | /api/resumes | List all resumes |
| GET | /api/resumes/:id | Get single resume |
| PUT | /api/resumes/:id | Update resume |
| DELETE | /api/resumes/:id | Delete resume |
| GET | /api/resumes/:id/download | Download PDF |
| POST | /api/ai/review | AI resume review |
| POST | /api/ai/suggest-skills | AI skill suggestions |
| POST | /api/ai/generate-summary | AI summary generator |

## Future Enhancements (Bonus Ideas)
- ATS Match Score (paste JD, get match %)
- Inline "Improve this bullet" AI rewrite
- Resume version history
- Dark mode
- Public shareable resume link

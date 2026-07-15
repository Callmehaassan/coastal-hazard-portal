# Contributing to Coastal Hazard Portal

Welcome to the Coastal Hazard Portal project! This guide explains how our team works together on this multi-hazard early-warning system for Pakistan's coastline.

## 🎯 Project Overview

**Coastal Hazard Portal** is a multi-hazard early-warning dashboard monitoring:
- Coastal flooding
- Storm surge
- Shoreline erosion
- Sea-level rise

**Tech Stack:**
- Backend: FastAPI + PostgreSQL + PostGIS
- Frontend: React/Next.js
- Geospatial: Google Earth Engine
- Deployment: Docker

---

## 👥 Team Structure

| Role | Members | Permissions |
|------|---------|-------------|

| **Developers** | Ali Hassan, Laiba Rafi | Write - Create features, submit PRs |

---

## 🚀 Getting Started

### 1. Clone the Repository
```bash
git clone https://github.com/Callmehaassan/coastal-hazard-portal.git
cd coastal-hazard-portal
```

### 2. Setup Backend
```bash
cd backend
python -m venv venv

# Windows
venv\Scripts\activate
# macOS/Linux
source venv/bin/activate

pip install -r requirements.txt
cp .env.example .env
# Edit .env with your credentials
```

### 3. Setup Frontend
```bash
cd frontend
npm install
npm run dev
```

### 4. Setup Database
```bash
# Start PostgreSQL
# Run migrations
cd backend
alembic upgrade head
```

---

## 🔄 Git Workflow (GitHub Flow)

### Step 1: Create a Feature Branch
Always create a branch from `main`:

```bash
git checkout main
git pull origin main

# Create feature branch (use descriptive names)
git checkout -b feature/gee-integration
# or
git checkout -b feature/alert-notifications
# or
git checkout -b bugfix/hazard-calculation
```

**Branch naming convention:**
- `feature/description` - New features
- `bugfix/description` - Bug fixes
- `docs/description` - Documentation
- `refactor/description` - Code improvements

### Step 2: Make Your Changes
Work on your feature and commit regularly:

```bash
git add .
git commit -m "feat: add real-time hazard data fetching from GEE"
```

**Commit message format:**
```
type: short description

Optional longer explanation about why this change
was made and what problem it solves.
```

**Types:**
- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `style:` - Code style (no logic changes)
- `refactor:` - Code reorganization
- `test:` - Add/update tests
- `chore:` - Dependency updates

### Step 3: Push to GitHub
```bash
git push origin feature/your-feature-name
```

### Step 4: Create a Pull Request (PR)
1. Go to GitHub repo
2. Click **"Create Pull Request"**
3. Fill in:
   - **Title:** Concise description
   - **Description:** What this PR does & why
   - **Related Issues:** Link any issues (#123)
4. Request reviewers:
   - At least 1 supervisor or task lead
5. Click **"Create Pull Request"**

### Step 5: Code Review
- Reviewers will comment on your code
- Make requested changes and push updates
- Conversation continues until approved

### Step 6: Merge & Cleanup
Once approved:
1. Reviewer merges PR to `main`
2. GitHub automatically deletes your branch
3. You're done! 🎉

---

## 📋 Pull Request Checklist

Before submitting a PR, make sure:

- [ ] Your code follows the project style
- [ ] You've tested your changes locally
- [ ] No `.env` or sensitive files included
- [ ] `git pull origin main` first to avoid conflicts
- [ ] Commit messages are clear and descriptive
- [ ] Documentation is updated (if needed)
- [ ] No hardcoded values (use `.env`)

### PR Description Template
```markdown
## Description
Brief explanation of what this PR does.

## Type of Change
- [ ] New feature
- [ ] Bug fix
- [ ] Documentation update
- [ ] Refactoring

## Testing
How was this tested?
- Tested locally with Python 3.11
- Unit tests pass: `pytest tests/`
- Manual testing of UI component

## Files Changed
- `backend/services/gee_service.py` - Added GEE data fetching
- `frontend/src/components/HazardMap.tsx` - Updated map display

## Issues Closed
Fixes #123
```

---

## 💻 Backend Development

### Running FastAPI Server
```bash
cd backend
source venv/bin/activate  # or venv\Scripts\activate on Windows
python -m uvicorn main:app --reload --port 8000
```

API docs available at: `http://localhost:8000/docs`

### Running Tests
```bash
cd backend
pytest tests/ -v
```

### Database Migrations
```bash
# Create migration
alembic revision --autogenerate -m "Add new_column to hazards"

# Apply migration
alembic upgrade head

# Rollback
alembic downgrade -1
```

---

## 🎨 Frontend Development

### Running Next.js Dev Server
```bash
cd frontend
npm run dev
# Open http://localhost:3000
```

### Building for Production
```bash
npm run build
npm start
```

### Code Style
- Use TypeScript for type safety
- Follow Tailwind CSS conventions
- Components in `src/components/`
- Pages in `src/pages/`
- Utilities in `src/lib/`

---

## 🐳 Docker Deployment

### Build & Run with Docker
```bash
docker-compose up -d
```

Services:
- Backend API: `http://localhost:8000`
- Frontend: `http://localhost:3000`
- PostgreSQL: `localhost:5432`

---

## 📂 Project Structure

```
coastal-hazard-portal/
├── backend/
│   ├── api/              # API endpoints
│   ├── models/           # Database models
│   ├── services/         # Business logic
│   ├── schemas/          # Request/response schemas
│   ├── utils/            # Helper functions
│   ├── tests/            # Unit tests
│   ├── main.py           # FastAPI app
│   └── requirements.txt   # Python dependencies
│
├── frontend/
│   ├── src/
│   │   ├── components/   # React components
│   │   ├── pages/        # Next.js pages
│   │   ├── hooks/        # Custom hooks
│   │   ├── lib/          # Utilities
│   │   └── styles/       # CSS
│   └── package.json
│
├── docs/
│   ├── API.md            # API documentation
│   ├── DATABASE.md       # Database schema
│   ├── GEE_GUIDE.md      # Google Earth Engine guide
│   └── SETUP.md          # Setup instructions
│
├── data/
│   ├── gee-exports/      # GEE data exports
│   └── seed-data/        # Initial data
│
├── docker-compose.yml    # Docker configuration
├── README.md
└── .gitignore
```

---

## 🔐 Security Guidelines

1. **Never commit `.env` files** - Use `.env.example` instead
2. **No hardcoded credentials** - Use environment variables
3. **Validate user input** - Especially for geospatial queries
4. **SQL injection protection** - Use ORM/parameterized queries
5. **CORS configuration** - Restrict to known domains
6. **API rate limiting** - Prevent abuse

### Creating `.env` from Template
```bash
cp backend/.env.example backend/.env
# Edit backend/.env with your actual values
```

---

## 📞 Communication

- **Weekly Sync:** [Day/Time] - Review progress, assign tasks
- **GitHub Issues:** For bugs and feature requests
- **GitHub Discussions:** For questions and ideas
- **Email:** nassahali91@gmail.com

### Issues & Tasks
1. Create issues for:
   - Feature requests
   - Bug reports
   - Documentation needs
2. Assign to team member
3. Link to PR when working on it
4. Close when merged

---

## 🎓 Learning Resources

- **FastAPI:** https://fastapi.tiangolo.com/
- **React/Next.js:** https://nextjs.org/learn
- **PostgreSQL:** https://www.postgresql.org/docs/
- **PostGIS:** https://postgis.net/documentation/
- **Google Earth Engine:** https://developers.google.com/earth-engine
- **Git:** https://git-scm.com/doc

---

## ❓ FAQ

**Q: I accidentally committed to main, how do I fix it?**
A: Don't panic! Create a PR to revert:
```bash
git revert HEAD --no-edit
git push origin main
```

**Q: How do I sync my branch with latest main?**
A: 
```bash
git fetch origin
git rebase origin/main
# or merge if you prefer
git merge origin/main
```

**Q: My PR has merge conflicts, how do I resolve?**
A:
```bash
git fetch origin
git merge origin/main
# Fix conflicts in VS Code
git add .
git commit -m "Resolve merge conflicts"
git push origin your-branch
```

**Q: Can I push directly to main?**
A: No! Branch protection prevents this. Always use PRs.

---

## 📝 Code Review Expectations

### For Reviewers
- Review within 24 hours if possible
- Be constructive and encouraging
- Ask questions if unclear
- Approve when ready
- Merge only when all checks pass

### For Authors
- Respond to feedback promptly
- Explain your decisions when questioned
- Make requested changes
- Don't force merge without approval
- Ask for help if stuck

---

## 🎉 Thank You!

Thank you for contributing to the Coastal Hazard Portal! Together, we're building critical infrastructure to protect Pakistan's coastlines.

**Questions?** Open an issue or email: nassahali91@gmail.com

---

**Last Updated:** July 2026
**Maintained By:** Ali Hassan (@Callmehaassan) and Laiba Rafi (@laibarafi2712-boop)

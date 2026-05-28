# KnowledgeFlow AI

An AI-Powered Task & Knowledge Management System, built for seamless workflows, document search, and team collaboration.

## Features & Technologies

- **Backend API**: Built with [FastAPI](https://fastapi.tiangolo.com/) for extreme performance and async support.
- **Frontend**: A modern [React](https://reactjs.org/) SPA bundled with Vite for near-instant HMR.
- **Database**: [MySQL](https://www.mysql.com/) as the primary datastore, using SQLAlchemy ORM and Alembic for migrations.
- **Semantic Search**: Powered by [FAISS](https://github.com/facebookresearch/faiss) and [SentenceTransformers](https://sbert.net/) (Hugging Face) for finding documents intuitively without exact keyword matching.
- **Authentication**: JWT-based authentication for secure session management.
- **Authorization**: Role-Based Access Control (RBAC) separating Admin capabilities (uploading docs, creating tasks) from standard User capabilities.
- **Task Management**: Dynamic filtering and status assignment.
- **Analytics**: Real-time insights and activity tracking.

## Screenshots

*(Replace these placeholders with actual screenshots before submitting)*

### Dashboard & Analytics
`![Dashboard Screenshot](./assets/screenshot-dashboard.png)`

### Semantic Search Results
`![Search Screenshot](./assets/screenshot-search.png)`

### Task Management
`![Tasks Screenshot](./assets/screenshot-tasks.png)`

## Local Development Setup

### 1. Database & Backend
1. Clone the repository.
2. Setup MySQL or change the `DATABASE_URL` in your `.env` to use SQLite for easy testing.
3. Copy `.env.example` to `backend/.env` and fill in the values.
4. Navigate to `backend/`.
5. Create a virtual environment and install requirements:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   ```
6. Run migrations to create the database schema:
   ```bash
   alembic upgrade head
   ```
7. Start the backend server:
   ```bash
   python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
   ```
   *(View the Swagger UI at `http://localhost:8000/docs`)*

### 2. Frontend
1. Navigate to `frontend/`.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the Vite dev server:
   ```bash
   npm run dev
   ```
   *(View the web app at `http://localhost:5173/`)*

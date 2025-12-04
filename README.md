## How to Run the Project

### 1. Install backend dependencies

run : cd backend
npm install

### 2. Generate combined JSON from CSVs(in backend)

run : node scripts/convert.js

### 3. Run the full stack (backend + frontend) [displays Final Project]

run : cd backend
node server.js

Now open:

http://localhost:5000

The full dashboard runs from the backend.

---

## API Endpoints

## **GET /api/spend**

### If 3rd step dosen't work:

run backend using : node server.js
and run frontend usign : npm run dev

---

# Cloud Cost Intelligence Dashboard

A fully working **full-stack cloud cost analytics platform** built using:

- **React + TypeScript + Vite + TailwindCSS** (Frontend)
- **Node.js + Express** (Backend)
- **CSV to JSON data pipeline** (AWS + GCP billing)
- **Recharts** (visualizations)

This assignment demonstrates real-world SaaS engineering skills:  
data ingestion → transformation → API development → UI/UX → filtering → analytics → deployment-ready architecture.

---

## Features

### **Backend**

- Converts AWS + GCP CSV billing files into a unified JSON dataset
- Normalizes:
  - date formats
  - teams
  - environments
  - cloud providers
- Two APIs:
  - **GET `/api/spend`** — full or filtered spend data
  - **GET `/api/summary`** — Total / AWS / GCP summary
- Server also serves the **frontend production build**
- Single-command full-stack run (`node server.js`)

### **Frontend**

- Modern dashboard UI (via FigmaMake + custom code)
- Filters:
  - Cloud Provider
  - Team
  - Environment
  - Month
- Realtime filtering across:
  - Table
  - Summary Cards
  - Charts
- Components:
  - Spend Table
  - Spend Summary Cards
  - Spend by Cloud Provider Chart
- Responsive & polished UI with TailwindCSS

---

## Tech Stack

### **Frontend**

- React (TypeScript)
- Vite
- TailwindCSS
- Recharts

### **Backend**

- Node.js
- Express 5.x
- CSV Parser
- File-based datastore
- CORS

---

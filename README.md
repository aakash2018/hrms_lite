# HRMS Lite

A lightweight Human Resource Management System built with FastAPI, MongoDB, and React.

## Features

### Employee Management
- Add new employees with unique Employee ID, Full Name, Email, and Department
- View list of all employees
- Delete employees
- Duplicate employee validation

### Attendance Management
- Mark attendance for employees (Present/Absent)
- View attendance records by month and year
- Filter attendance records by date
- Display total present/absent days per employee

### Dashboard
- Total employees count
- Today's present/absent summary
- Total attendance records
- Quick actions navigation

## Tech Stack

### Backend
- **Framework:** FastAPI (Python)
- **Database:** MongoDB with Beanie ODM
- **Validation:** Pydantic
- **Server:** Uvicorn

### Frontend
- **Framework:** React 18 with TypeScript
- **Build Tool:** Vite
- **Routing:** React Router DOM
- **Styling:** CSS3 with CSS Variables
- **Notifications:** React Hot Toast
- **Icons:** Lucide React

### Deployment
- **Frontend:** Vercel / Netlify
- **Backend:** Render / Railway
- **Database:** MongoDB Atlas

## Project Structure

```
hrms-lites/
├── backend/
│   ├── app/
│   │   ├── attendance/       # Attendance routes, models, schemas
│   │   ├── db/               # Database configuration
│   │   ├── employee/         # Employee routes, models, schemas
│   │   └── main.py           # FastAPI application entry
│   ├── requirements.txt
│   └── render.yaml           # Render deployment config
├── frontend/
│   ├── src/
│   │   ├── api/              # API client functions
│   │   ├── components/       # Reusable UI components
│   │   ├── pages/            # Page components
│   │   └── types/            # TypeScript types
│   ├── vercel.json           # Vercel deployment config
│   └── .env.example          # Environment variables template
└── README.md
```

## Local Setup

### Prerequisites
- Python 3.11+
- Node.js 18+
- MongoDB Atlas account (or local MongoDB)

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Create virtual environment:
```bash
python -m venv venv
```

3. Activate virtual environment:
```bash
# Windows
venv\Scripts\activate
# macOS/Linux
source venv/bin/activate
```

4. Install dependencies:
```bash
pip install -r requirements.txt
```

5. Create `.env` file:
```env
DB_USER=your_mongodb_username
DB_PASS=your_mongodb_password
DB_NAME=hrms_lite
```

6. Run the server:
```bash
uvicorn app.main:app --reload --port 8000
```

Backend will be available at `http://localhost:8000`

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file (optional for local dev):
```env
VITE_API_URL=http://localhost:8000/api
```

4. Run the development server:
```bash
npm run dev
```

Frontend will be available at `http://localhost:5173`

## Deployment

### Backend Deployment (Render)

1. Push code to GitHub
2. Create new Web Service on Render
3. Connect your GitHub repository
4. Set environment variables:
   - `MONGODB_URL`: Your MongoDB Atlas connection string
   - `DATABASE_NAME`: hrms_lite
5. Deploy!

### Frontend Deployment (Vercel)

1. Push code to GitHub
2. Import project on Vercel
3. Set environment variables:
   - `VITE_API_URL`: Your Render backend URL + `/api`
4. Deploy!

## API Endpoints

### Health
- `GET /` - Welcome message

### Dashboard
- `GET /api/dashboard` - Get dashboard statistics

### Employees
- `GET /api/employees` - List all employees
- `POST /api/employees` - Create new employee
- `GET /api/employees/{employee_id}` - Get single employee
- `DELETE /api/employees/{employee_id}` - Delete employee

### Attendance
- `GET /api/attendance/{employee_id}` - Get attendance records (optional: ?month=&year=)
- `GET /api/attendance/{employee_id}/summary` - Get attendance summary
- `POST /api/attendance` - Mark attendance

## Assumptions & Limitations

- Single admin user (no authentication implemented)
- No leave management or payroll features
- Attendance can only be marked as Present or Absent
- No bulk import/export functionality
- No email notifications

## License

MIT License

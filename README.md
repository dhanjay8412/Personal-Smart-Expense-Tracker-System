# Personal Smart Expense Tracker System

A modern, production-ready, full-stack **Personal Smart Expense Tracker System** that empowers users to securely manage personal finances, set category budget limits, track recurring subscriptions, generate financial analytics with interactive Recharts, and export statements to CSV & PDF.

---

## 🚀 Key Features

* **Secure Authentication**: JWT-based authentication, password hashing with `bcryptjs`, automatic token expiration handling, protected routes, and account deletion.
* **Transaction Management**: CRUD operations for Income & Expense transactions with category tagging, payment methods (Cash, Credit Card, UPI, Bank Transfer), pagination, server-side filtering, and search.
* **Category Budgets & Alerts**: Set monthly budget caps for Food, Rent, Shopping, etc. Automated background check triggers threshold warnings when spending hits 80% or exceeds budget limit.
* **Financial Analytics & Charts**: Interactive Recharts visualizations including Expense Category Pie/Donut Chart, Income vs Expense Bar Chart, and Daily Spending Trend Area Chart.
* **Automated Recurring Transactions**: Schedule daily, weekly, monthly, or yearly recurring expenses (subscriptions, rent, gym) automatically processed via `node-cron`.
* **Notifications System**: In-app notifications stored in MongoDB for budget threshold alerts, system updates, and recurring transaction receipts.
* **Data Exporting**: One-click statement export to **CSV** and **PDF** formats.
* **Multi-Currency Support**: Instant support for INR (₹), USD ($), EUR (€), and GBP (£).
* **Responsive UI**: Dark mode glassmorphic UI built with Vite, React, Tailwind CSS, Lucide Icons, and full Mobile Bottom Navigation bar.

---

## 🛠️ Technology Stack

### Frontend
* **Core**: React 18, Vite, JavaScript
* **Routing & State**: React Router v6, Context API (AuthContext & ThemeContext)
* **Styling**: Tailwind CSS, Lucide React Icons, Glassmorphic Design System
* **Data Visualization**: Recharts
* **Forms & Validation**: React Hook Form, Zod
* **HTTP Client**: Axios with JWT Interceptors

### Backend
* **Runtime & Framework**: Node.js, Express.js
* **Database & ODM**: MongoDB, Mongoose
* **Security & Auth**: JWT, bcryptjs, Helmet, CORS, Express Rate Limit
* **Validation & Logging**: Zod, Morgan, Winston Logger
* **Background Jobs**: Node Cron
* **Exports & Docs**: JSON2CSV, PDFKit, Swagger / OpenAPI UI (`/api/v1/docs`)

---

## 📐 Application Architecture

```text
                           React Frontend (Vite + Tailwind)
                                         │
                                         │ HTTPS / REST API
                                         ▼
                           Express.js Server (Port 5000)
                                         │
             ┌───────────────────────────┼───────────────────────────┐
             │                           │                           │
             ▼                           ▼                           ▼
      Auth Middleware              Controllers                 Background Jobs
   (JWT & Rate Limit)        (Transactions, Budgets)       (Recurring & Alerts)
             │                           │                           │
             └───────────────────────────┼───────────────────────────┘
                                         │
                                         ▼
                                   Mongoose ODM
                                         │
                                         ▼
                                  MongoDB Database
```

---

## ⚙️ Installation & Running Locally

### Prerequisites
* Node.js (v18 or higher)
* MongoDB running locally (`mongodb://127.0.0.1:27017/smart_expense_tracker`) or MongoDB Atlas URI

### 1. Clone & Setup Backend
```bash
cd backend
npm install
npm run seed     # Seeds realistic demo user (demo@example.com / Password123!)
npm run dev      # Starts Express API at http://localhost:5000
```

### 2. Setup Frontend
```bash
cd ../frontend
npm install
npm run dev      # Starts Vite dev server at http://localhost:5173
```

---

## 🐳 Running with Docker Compose

You can launch the entire stack (MongoDB + Backend + Frontend) using Docker Compose:

```bash
docker compose up --build
```

Access:
* **Frontend**: `http://localhost:5173`
* **Backend REST API**: `http://localhost:5000/api/v1`
* **Swagger API Docs**: `http://localhost:5000/api/v1/docs`

---

## 🧪 Seed Demo Credentials

To quickly explore the dashboard with pre-populated transactions, budgets, charts, and notifications:

* **Email**: `demo@example.com`
* **Password**: `Password123!`

---

## 📖 API Documentation

Interactive OpenAPI documentation is available via Swagger at:
`http://localhost:5000/api/v1/docs`

Key Endpoints:
* `POST /api/v1/auth/register` & `POST /api/v1/auth/login`
* `GET /api/v1/transactions` (supports search, filters, pagination)
* `GET /api/v1/budgets` (calculates spent vs limit metrics)
* `GET /api/v1/analytics/dashboard` (KPIs, pie data, bar data)
* `GET /api/v1/export/csv` & `GET /api/v1/export/pdf`

---

## 🧪 Testing

### Backend Integration Tests (Jest & Supertest)
```bash
cd backend
npm test
```

### Frontend Tests (Vitest)
```bash
cd frontend
npm test
```

---

## 📝 License
This project is open source and available under the [ISC License](LICENSE).

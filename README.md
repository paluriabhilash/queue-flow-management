# QueueFlow - Smart Digital Queue Management System

QueueFlow is a modern, scalable, full-stack digital queue management application designed for hospitals, banks, educational institutions, government offices, and service centers. It replaces physical waiting lines with real-time digital token allocation, queue position tracking, estimated wait times, and role-based staff/admin management.

---

## 🏗️ Architecture & Project Structure

The project follows a **Feature-based Clean Architecture** split into a frontend client and backend server.

```text
queueflow/
├── client/                     # Frontend (React + TypeScript + Vite + Tailwind CSS)
│   ├── public/                 # Static assets
│   ├── src/
│   │   ├── assets/             # Images, icons, SVGs
│   │   ├── components/         # Shared UI components
│   │   │   ├── ui/             # Core UI elements (Button, Input, Card, Modal, Badge, Toast)
│   │   │   ├── layout/         # Navigation, Headers, Sidebars
│   │   │   └── feedback/       # Skeleton screens, Loaders, Empty states
│   │   ├── config/             # Axios instance, QueryClient config
│   │   ├── context/            # AuthContext, ThemeContext
│   │   ├── features/           # Feature-driven modular structure
│   │   │   ├── auth/           # Login, Register, Protected Routes
│   │   │   ├── customer/       # Online Token Booking, Live Tracking, Estimations
│   │   │   ├── staff/          # Counter Management, Next Token Call, Queue Actions
│   │   │   └── admin/          # Analytics Dashboard, Service/Counter Setup, Staff Admin
│   │   ├── hooks/              # Global custom hooks
│   │   ├── layouts/            # Page layouts (CustomerLayout, StaffLayout, AdminLayout)
│   │   ├── pages/              # Top-level page components
│   │   ├── routes/             # App routing & role guards
│   │   ├── services/           # Global API services
│   │   ├── types/              # Global TypeScript interfaces
│   │   ├── utils/              # Helper functions, formatters, queue math
│   │   ├── App.tsx             # Root application component
│   │   ├── main.tsx            # React DOM entrypoint
│   │   └── index.css           # Tailwind base styles
│   ├── index.html
│   ├── package.json
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── tsconfig.json
│   └── vite.config.ts
│
├── server/                     # Backend (Node.js + Express + TypeScript + Prisma ORM)
│   ├── prisma/
│   │   ├── schema.prisma       # Database Schema (Users, Departments, Counters, Tickets, Logs)
│   │   └── seed.ts             # Initial DB seed data
│   ├── src/
│   │   ├── config/             # Environment, DB & JWT configs
│   │   ├── controllers/        # Auth, Ticket, Counter, Admin controllers
│   │   ├── middlewares/        # Authentication, Role Authorization, Validation, Error Handling
│   │   ├── models/             # Prisma query data layers
│   │   ├── routes/             # Express REST API routes (/api/v1/...)
│   │   ├── services/           # Queue logic, Token algorithms, Notification engine
│   │   ├── types/              # Express Request augmentations & types
│   │   ├── utils/              # JWT helpers, bcrypt password hashing, Logger, API Error handler
│   │   ├── app.ts              # Express application setup
│   │   └── server.ts           # HTTP Server bootstrap
│   ├── .env.example            # Environment variable template
│   ├── package.json
│   ├── tsconfig.json
│   └── nodemon.json
│
├── .gitignore
├── package.json                # Root workspace monorepo script manager
└── README.md
```

---

## 👥 User Roles & Core Responsibilities

1. **Customer**
   - Select Department / Service & book a digital token.
   - Live position counter ("3 people ahead of you").
   - Real-time estimated waiting time.
   - Ticket status tracking (`WAITING`, `CALLED`, `IN_PROGRESS`, `COMPLETED`, `CANCELLED`).

2. **Staff**
   - Login to specific service counter (e.g., Counter 02).
   - "Call Next Customer" trigger.
   - Ticket state handling (`Call`, `Start Service`, `Complete`, `Mark No-Show`, `Transfer`).
   - Counter status toggling (`OPEN`, `PAUSED`, `CLOSED`).

3. **Administrator**
   - Real-time queue analytics (Average Wait Time, Total Served, Active Counters).
   - Manage Departments & Services (Avg Service Time, Token Prefix).
   - Manage Counters & Staff assignments.
   - System Audit & Activity Logs.

---

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, React Router v6, React Hook Form, Axios, TanStack Query (React Query)
- **Backend**: Node.js, Express.js, TypeScript, Prisma ORM, JWT, bcrypt
- **Database**: PostgreSQL (Prisma Provider)

---

## 🚀 Getting Started

### 1. Installation

From the root directory:

```bash
# Install root dependencies
npm install

# Install client dependencies
cd client && npm install

# Install server dependencies
cd ../server && npm install
```

### 2. Environment Setup

Copy `.env.example` to `.env` in `server/`:

```bash
cp server/.env.example server/.env
```

### 3. Database Migration & Prisma Client

```bash
cd server
npm run prisma:generate
npm run prisma:migrate
```

### 4. Running Development Servers

From the root directory:

```bash
# Run client (Vite on http://localhost:3000)
npm run dev:client

# Run server (Express on http://localhost:5000)
npm run dev:server
```

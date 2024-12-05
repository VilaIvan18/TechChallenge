# 🏦 Full-Stack Banking Application

## 📝 Overview

This is a full-stack banking application built with:
- Frontend: Next.js 14, React, TypeScript
- Backend: NestJS
- Database: Prisma
- Styling: Tailwind CSS
- Authentication: JWT

## ✨ Features

- User Registration and Authentication
- Account Creation
- Money Deposit
- Money Withdrawal
- Account-to-Account Transfers
- Transaction History
- Responsive Design

## 🛠 Prerequisites

Before you begin, ensure you have the following installed:
- Node.js (v18 or later)
- npm (v9 or later)
- Git

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://https://github.com/VilaIvan18/TechChallenge.git
cd TechChallenge
```

### 2. Backend Setup

#### Install Dependencies
```bash
cd apps/backend
npm install
```

#### Configure Environment
Create a `.env` file in the backend directory with:
```
FRONTEND_URL
DATABASE_URL
JWT_SECRET
PORT
```

#### Run Database Migrations
```bash
npx prisma migrate dev
```

#### Start Backend Server
```bash
npm run start:dev
```

### 3. Frontend Setup

#### Navigate to Frontend Directory
```bash
cd ../frontend
```

#### Install Dependencies
```bash
npm install
```

#### Configure Environment
Create a `.env.local` file with:
```
NEXT_PUBLIC_API_URL
```

#### Start Frontend Development Server
```bash
npm run dev
```

## 🔐 Authentication

The app uses JWT (JSON Web Token) for authentication:
- Register a new account
- Login with credentials
- Protected routes require valid JWT

## 💾 Database

- ORM: Prisma
- Supports multiple databases (PostgreSQL recommended)
- Migrations for schema management

## 🌐 Deployment

### Backend
- Deployed on Render

### Frontend
- Deployed on Vercel

## 📦 Tech Stack

### Frontend
- Next.js 14
- React
- TypeScript
- Tailwind CSS
- Axios

### Backend
- NestJS
- Prisma
- JWT Authentication
- bcrypt for password hashing

## 🧪 Testing

### Backend Tests
```bash
cd apps/backend
npm run test
```

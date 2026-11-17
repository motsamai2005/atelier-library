# Atelier Library — Library Management System

A React + Express + MySQL library management application for the BIWA2110 Web Application Development assignment. The design uses an editorial library aesthetic: forest-green navigation, warm paper backgrounds, serif display typography, quiet copper details, and responsive layouts.

## What is included

### Frontend (`frontend/`)
- React with functional components and hooks (`useState`, `useEffect`, `useMemo`)
- React Router pages: Overview, Book Collection, Circulation, and People & Access
- Controlled forms, client-side validation, loading/error/success states
- Fetch API integration with the Express REST API
- Responsive desktop, tablet, and mobile styling
- Role-aware navigation and actions

### Backend (`backend/`)
- Express REST API with `express.json()` and CORS middleware
- Login endpoint with bcrypt password verification and JWT sessions
- Book CRUD endpoints (`GET`, `POST`, `PUT`, `DELETE`)
- User management endpoints (`GET`, `POST`, `PUT`, `DELETE`)
- Stock transaction endpoints for stock received (`IN`) and borrowed (`OUT`)
- Transaction stock updates run in a database transaction and lock the selected book row to prevent overselling stock
- Role checks: Admin manages books and users; Admin and Librarian can record stock movements

### Database (`database/`)
- MySQL schema for `books`, `library_users`, and `library_transactions`
- Foreign keys, unique ISBN and membership ID constraints, and indexes
- Optional sample book records

## Requirements

Install these on your Windows computer:
1. Node.js (LTS) and npm.
2. MySQL Server and MySQL Workbench (or another MySQL client).
3. A code editor such as VS Code.

## Setup — step by step

### 1. Create the database

1. Open MySQL Workbench and connect to your local MySQL server.
2. Open `database/schema.sql` in a new SQL tab.
3. Execute the whole script. It creates the `atelier_library` database and its three tables.
4. Optional: open `database/sample_data.sql` and execute it to insert example books.

### 2. Configure and start the backend

Open a terminal in the project folder and run:

```powershell
cd backend
Copy-Item .env.example .env
```

Open `backend/.env` and set `DB_USER`, `DB_PASSWORD`, and `DB_NAME` to match your local MySQL setup. Set a private random value for `JWT_SECRET`. Keep `DB_NAME=atelier_library` if you used the supplied schema.

Then run:

```powershell
npm install
npm run seed
npm run dev
```

The API should be available at `http://localhost:5000`. Check `http://localhost:5000/api/health` in your browser; a successful response reports `database: connected`.

The seed command creates the first administrator account:
- Membership ID: `LIB-001`
- Password: `Admin@123`

This is demonstration access only. Sign in and change the password from People & Access immediately. Do not use the demo password in a deployed application.

### 3. Start the React frontend

Open a **second** terminal in the project folder:

```powershell
cd frontend
npm install
npm run dev
```

Open the local address printed by Vite, normally `http://localhost:5173`.

### 4. Sign in and explore

Sign in with the demo administrator credentials above. You can then:
- Add, update, search, filter, and delete books.
- Review low-stock titles (fewer than 2 copies).
- Add stock received or record borrowed copies.
- View circulation history with the staff member and timestamp.
- Create, update, and delete users with Admin, Librarian, or Member roles.

To test role-based access, create a Librarian or Member account from People & Access, sign out, then sign in with that account. Members can view records; Admins and Librarians can record stock movement; only Admins can manage the catalogue and user accounts.

## API reference

All protected endpoints require `Authorization: Bearer <token>`.

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/api/auth/login` | Sign in with membership ID and password |
| GET | `/api/auth/me` | Read the current session |
| GET | `/api/books` | List books |
| POST | `/api/books` | Add a book (Admin) |
| PUT | `/api/books/:id` | Update book details (Admin) |
| DELETE | `/api/books/:id` | Delete a book if it has no transaction history (Admin) |
| GET | `/api/transactions` | Read circulation history |
| POST | `/api/transactions` | Record stock in/out (Admin or Librarian) |
| GET | `/api/users` | List users (Admin) |
| POST | `/api/users` | Create a user (Admin) |
| PUT | `/api/users/:id` | Update a user (Admin) |
| DELETE | `/api/users/:id` | Delete a user with no transaction history (Admin) |

## Notes before submission

- Both `frontend/` and `backend/` are included for your GitHub project.
- Do not upload your real `.env` file or database password to GitHub. The `.gitignore` excludes it.
- The frontend expects the backend at `http://localhost:5000/api`. To use another API address, create `frontend/.env` with `VITE_API_URL=http://your-api-host/api`.
- The app uses MySQL. PostgreSQL would require changing the database driver and SQL syntax.
- This is a coursework starter implementation. Review the code, understand each component and route, and adapt labels, content, and styling so you can explain and defend your own work.

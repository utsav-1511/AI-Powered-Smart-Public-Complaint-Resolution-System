# CivicResolve

CivicResolve is a React/Vite civic complaint interface backed by an Express API and MongoDB. The backend uses JWT authentication, bcrypt password hashing, and role checks on protected routes. The complaint assistance panel remains a local, clearly labeled demo classifier; it does not call Gemini or another AI service.

## Requirements

- Node.js 18 or later
- MongoDB Atlas database (or a local MongoDB instance)

## Configure the backend

```sh
cd backend
npm install
cp .env.example .env
```

Set `MONGO_URI` to the MongoDB connection string for your database. Set `JWT_SECRET` to a long random value. `CLIENT_URL` defaults to the Vite origin shown in `.env.example`; comma separate additional allowed origins if needed.

Load the demo departments, accounts, and ten complaints:

```sh
npm run seed
```

All seeded accounts use the password `CivicDemo123!`:

| Role | Email |
| --- | --- |
| Admin | `admin@civicresolve.in` |
| Citizen | `ananya@example.com` |
| Citizen | `rohan@example.com` |
| Officer | `arvind.k@civicresolve.in` |
| Officer | `meera.s@civicresolve.in` |
| Officer | `rajesh.v@civicresolve.in` |

Start the API:

```sh
npm run dev
```

The API listens on port `5000` by default and exposes `GET /api/health` for a database independent process check. `npm start` runs the production server.

## Configure and run the frontend

```sh
cd frontend
npm install
cp .env.example .env
npm run dev
```

Vite proxies `/api` calls to `http://localhost:5000` during development. For a deployed frontend, set `VITE_API_URL` to the deployed API base ending in `/api`. Build the frontend with `npm run build`.

## API overview

- `POST /api/auth/register`, `POST /api/auth/login`, `GET/PATCH /api/auth/me`
- `POST /api/complaints`, `GET /api/complaints/my`, `GET /api/complaints`, `GET /api/complaints/:id`, `GET /api/complaints/track/:complaintId`, `PATCH /api/complaints/:id/status`, `PATCH /api/complaints/:id/assign`, `DELETE /api/complaints/:id`
- `GET /api/departments`, `POST /api/departments`, `PUT /api/departments/:id`, `DELETE /api/departments/:id`
- `GET /api/officers`, `POST /api/officers`, `PUT /api/officers/:id`
- `GET /api/analytics/dashboard`, `GET /api/analytics/categories`, `GET /api/analytics/departments`

Self-registration always creates a citizen account. Only an authenticated admin can create officer accounts, assign officer roles, manage departments, assign cases, or access analytics. Officers can see and update only cases assigned to their account. Citizens can see only their own complaints; the public tracking endpoint returns complaint progress without citizen contact details.

## Notes

- Complaint images are accepted as small data URLs for this demo and stored on the complaint document. For a production deployment, replace this with object storage.
- The demo seed script uses upserts for its fixed demo records so rerunning it refreshes those records instead of duplicating them.
- No live MongoDB credentials are included in the repository. Configure `.env` locally before seeding or starting the backend.

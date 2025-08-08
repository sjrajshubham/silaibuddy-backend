# Silaibuddy Backend

## Setup
- Copy `.env.example` to `.env` and set `MONGO_URI` and `JWT_SECRET`
- `npm install`
- `npm run dev` to start with nodemon

Admin accounts (pre-seeded):
- shubham@silaibuddy.in / shubham123#
- rishad@silaibuddy.in / rishad123#
- aashna@silaibuddy.in / aashnasingh123#

Endpoints:
- POST /api/auth/signup
- POST /api/auth/login
- GET /api/tailors/nearby?lat=&lng=&km=
- GET /api/tailors/:id
- PUT /api/tailors/me
- Admin: GET /api/admin/pending-tailors, POST /api/admin/approve/:id
- Orders: POST /api/orders (place), POST /api/orders/:id/status (tailor updates)

## Optional (Email & Uploads)
- For email verification & password reset configure SMTP env vars in `.env`:
  - SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM, FRONTEND_URL
- For image uploads configure Cloudinary env vars:
  - CLOUDINARY_CLOUD, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET

# HomesSolution - Professional Cleaning Services

## Overview
A full-stack cleaning services business platform (HomesSolution) based in Bhubaneswar, Odisha. Users can browse cleaning service categories, view services with pricing, book services, and pay via Razorpay. Admins can manage everything through a mobile-responsive admin panel.

## Tech Stack
- **Frontend**: React + TypeScript + Tailwind CSS + shadcn/ui + wouter routing
- **Backend**: Express.js + TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Payment**: Razorpay integration
- **State Management**: TanStack React Query

## Project Structure
- `client/src/pages/` - All page components (home, services, about, contact, book, admin, admin-login)
- `client/src/components/` - Shared components (navbar, footer, theme-provider, theme-toggle)
- `server/routes.ts` - All API endpoints
- `server/storage.ts` - Database storage layer with Drizzle ORM
- `server/seed.ts` - Database seed data (Bhubaneswar cleaning services)
- `server/db.ts` - Database connection
- `shared/schema.ts` - Data models and Zod schemas

## Key Features
- **Public Pages**: Home (hero, categories, reviews), Services listing with filters, About, Contact form, Booking page
- **Booking Flow**: Select service -> Fill details -> Book -> Pay with Razorpay
- **Admin Panel** (`/admin`): Dashboard stats, Bookings management, Services CRUD, Categories CRUD, Reviews management
- **Admin Login**: `/admin/login` (default: admin / admin123) - case-insensitive, trims whitespace
- **Payment**: Razorpay integration (requires RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET env vars)

## Service Categories
Bathroom Cleaning, Kitchen Cleaning, Chimney Cleaning, Sofa & Cushion Cleaning, Office Cleaning, Carpet Cleaning, Water Tank Cleaning, Home Cleaning (1-5 BHK with/without furniture), Balcony Cleaning

## Service Areas
Bhubaneswar, Cuttack, Puri, Rourkela, Berhampur (Odisha)

## API Routes
- `GET /api/categories` - List active categories
- `GET /api/services` - List active services
- `GET /api/admin/services` - List all services (admin, includes inactive)
- `GET /api/cities` - List cities
- `GET /api/reviews/recent` - Recent reviews
- `POST /api/bookings` - Create booking
- `POST /api/contact` - Contact form
- `POST /api/payments/create-order` - Create Razorpay order
- `POST /api/payments/verify` - Verify Razorpay payment
- Admin routes under `/api/admin/*` (requires session auth)

## Database
- PostgreSQL with tables: users, service_categories, services, bookings, reviews, cities
- Seed data auto-populates on first run with Bhubaneswar cleaning services

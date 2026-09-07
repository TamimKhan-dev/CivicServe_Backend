# CivicServe

CivicServe is a role-based civic service management backend. Citizens can submit and track service requests, staff can process and resolve them, and admins manage users, services, categories, departments, staff assignments, and applications.

## Tech Stack

- **Runtime/Framework:** Node.js, Express.js, TypeScript
- **Database/ORM:** PostgreSQL, Prisma
- **Caching:** Redis
- **Authentication:** JWT (access/refresh tokens) + Google OAuth (Passport.js)
- **Payments:** Stripe
- **File Storage:** Multer + Cloudinary
- **API Testing:** Postman

## Architecture

Routes → Controllers → Services → Prisma → PostgreSQL

Each module (auth, user, request, service, category, department, payment, staff-application) follows this layered pattern, with role-based middleware protecting routes by role (Citizen, Staff, Admin).

## Roles

| Role | Capabilities |
|---|---|
| **Citizen** | Register/login, submit & track requests, upload request images, apply to become staff, make payments |
| **Staff** | View assigned/all requests, update request status |
| **Admin** | Manage users, services, categories, departments; assign staff to requests; approve/reject staff applications |

## API Reference

Base URL: `/api/v1`

### Authentication — `/auth`

| Method | Endpoint | Description |
|---|---|---|
| POST | `/register` | Register a new citizen/user; sends email verification OTP |
| POST | `/credential-login` | Log in with email/password; returns access & refresh tokens |
| GET | `/google` | Start Google OAuth flow |
| GET | `/google/callback` | Handle Google OAuth callback and log the user in |
| POST | `/logout` | Clear auth cookies and log out |
| POST | `/refresh-token` | Issue new access/refresh tokens from refresh token cookie |
| POST | `/verify-email` | Verify email using submitted OTP |
| GET | `/get-me` | Get the authenticated user's profile (Admin, Citizen, Staff) |

### Users — `/user`

| Method | Endpoint | Description |
|---|---|---|
| GET | `/staffs` | Get all staff users (Admin) |
| DELETE | `/:userId` | Soft-delete a user (Admin) |

### Payments — `/payments`

| Method | Endpoint | Description |
|---|---|---|
| POST | `/checkout/:requestId` | Create a Stripe checkout session for a request (Citizen) |
| POST | `/webhook` | Receive Stripe webhook events; update payment/request status |

### Service Requests — `/request`

| Method | Endpoint | Description |
|---|---|---|
| POST | `/create-request` | Submit a new civic service request (Citizen) |
| POST | `/:requestId/image` | Upload an image for a request via Cloudinary (Citizen) |
| PATCH | `/:requestId/assign` | Assign a staff member to a request (Admin) |
| PATCH | `/:requestId/status` | Update request status (assigned Staff) |
| GET | `/my-requests` | Get the authenticated citizen's requests (paginated/filterable) |
| GET | `/all-requests` | Get all requests (Admin, Staff; paginated/filterable) |
| GET | `/:requestId` | Get details of a specific request |

### Services — `/service`

| Method | Endpoint | Description |
|---|---|---|
| POST | `/create-service` | Create a new service (Admin) |
| GET | `/all-services` | Get all services |
| DELETE | `/:serviceId` | Soft-delete a service (Admin) |

### Categories — `/category`

| Method | Endpoint | Description |
|---|---|---|
| POST | `/create-category` | Create a service category (Admin) |
| GET | `/all-categories` | Get all categories |
| DELETE | `/:categoryId` | Soft-delete a category (Admin) |

### Departments — `/department`

| Method | Endpoint | Description |
|---|---|---|
| POST | `/create-department` | Create a government department (Admin) |
| GET | `/all-departments` | Get all departments |
| DELETE | `/:departmentId` | Soft-delete a department (Admin) |

### Staff Applications — `/staff-application`

| Method | Endpoint | Description |
|---|---|---|
| POST | `/` | Apply to become a staff member (Citizen) |
| PATCH | `/:applicationId/status` | Approve or reject a staff application (Admin) |

### Server Status

| Method | Endpoint | Description |
|---|---|---|
| GET | `/` | Confirms the server is running (port, project name) |

**Total:** 30 routes (28 module API routes + root status + staff-application routes)

## Response Format

**Success**
```json
{ "success": true, "message": "Operation successful", "data": {} }
```

**Error**
```json
{ "success": false, "message": "Something went wrong", "errors": [] }
```

## Security

- Passwords hashed before storage
- Rate limiting via `express-rate-limit`
- Security headers via `helmet`
- CORS configured for the frontend origin
- Soft deletes (`deletedAt`) instead of hard deletes
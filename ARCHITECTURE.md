# TaskFlow Backend — Architecture Document

## 1. System Overview

TaskFlow is a multi-tenant project management backend built using Node.js and Express.

The application follows a layered architecture:

```text
Client
  |
  v
Express Routes
  |
  v
Middleware
(Authentication / Authorization / Validation)
  |
  v
Controllers
  |
  v
Services
  |
  v
Prisma ORM
  |
  v
PostgreSQL
```

Asynchronous task-assignment email notifications are handled separately using BullMQ and Redis.

The application and its supporting services run through Docker Compose.

---

## 2. System Architecture

```text
                    ┌──────────────────────┐
                    │        Client        │
                    │   Swagger / Postman  │
                    └──────────┬───────────┘
                               │
                               v
                    ┌──────────────────────┐
                    │     Express API      │
                    │        :5000         │
                    └──────────┬───────────┘
                               │
                    ┌──────────┴──────────┐
                    │                     │
                    v                     v
           ┌────────────────┐    ┌────────────────┐
           │   Middleware   │    │   Controllers  │
           │                │    │                │
           │ Auth / RBAC /  │───>│                │
           │ Validation     │    │                │
           └────────────────┘    └───────┬────────┘
                                         │
                                         v
                                ┌────────────────┐
                                │    Services    │
                                │ Business Logic │
                                └───────┬────────┘
                                        │
                                        v
                                ┌────────────────┐
                                │   Prisma ORM   │
                                └───────┬────────┘
                                        │
                                        v
                                ┌────────────────┐
                                │ PostgreSQL 16  │
                                └────────────────┘


        Task Assignment
               │
               v
        ┌──────────────┐
        │    BullMQ    │
        └──────┬───────┘
               │
               v
        ┌──────────────┐
        │    Redis 7   │
        └──────┬───────┘
               │
               v
        ┌──────────────┐
        │ Email Worker │
        └──────────────┘
```

---

## 3. Request Flow

A typical protected API request follows this flow:

```text
Client
  ↓
Route
  ↓
Authentication Middleware
  ↓
Role Authorization
  ↓
Joi Validation
  ↓
Controller
  ↓
Service
  ↓
Prisma
  ↓
PostgreSQL
  ↓
Response
```

The controller handles HTTP request and response processing, while business logic is implemented in the service layer.

This separation keeps routing, HTTP handling, business logic, and database access independent.

---

## 4. Authentication & Multi-Tenancy

TaskFlow uses JWT-based authentication with organization-level role-based access control.

After authentication, the user's organization context is obtained from their verified organization membership.

Organization IDs are not accepted from the client for resource ownership.

Protected resources are always queried within the authenticated user's organization.

```text
Authenticated User
       |
       v
Organization Membership
       |
       v
Organization Context
       |
       v
Projects / Tasks / Comments
```

This prevents users from accessing resources belonging to another organization.

Cross-tenant access attempts return:

```text
403 Forbidden
```

Role-based authorization supports:

* `org_admin`
* `member`

### Organization Membership Rule

A user can register independently without being assigned to an organization.

After registration:

```text
User Registration
       ↓
User Account Created
       ↓
No Organization Assigned
       ↓
Organization Admin adds the user
       ↓
Organization Membership Created
       ↓
User becomes an organization member
```

Only an `org_admin` can add a registered user to their organization.

Users cannot assign themselves to an organization, and the organization ID is never accepted from the client to establish resource ownership.

---

## 5. Background Job Architecture

Task assignment email notifications are processed asynchronously using BullMQ and Redis.

```text
Task Assignment API
        |
        v
Create Task Assignment
        |
        v
Enqueue Email Job
        |
        v
BullMQ
        |
        v
Redis
        |
        v
Email Worker
        |
        v
Send Email
```

The API does not wait for email processing to complete.

### Job Retry Strategy

Failed email jobs are retried up to three times using exponential backoff:

```text
1st retry → 1 second
2nd retry → 2 seconds
3rd retry → 4 seconds
```

After all retry attempts are exhausted, the failed job is moved to the dead-letter queue and its status is reported as `failed`.

### Queue Consistency Strategy

The task assignment must be persisted and the email notification job must be successfully enqueued before the assignment request returns a successful response.

If job enqueueing fails, the assignment operation is treated as failed so that the system does not leave a persisted task assignment without its corresponding notification job.

This keeps the task assignment and notification state consistent.

---

## 6. Database & Deployment Architecture

TaskFlow uses PostgreSQL 16 as the primary database and Prisma as the ORM.

The application runs completely through Docker Compose.

```text
Docker Compose
│
├── API Container
│   └── Node.js 20 + Express
│
├── Worker Container
│   └── BullMQ Email Worker
│
├── PostgreSQL Container
│   └── PostgreSQL 16
│
└── Redis Container
    └── Redis 7
```

### Database Initialization

The API container automatically runs:

```bash
npx prisma migrate deploy
npx prisma db seed
npm start
```

Therefore, no manual Prisma migration or seed command is required when starting the application through Docker Compose.

### Service Separation

The API and email worker run as separate containers.

The API handles HTTP requests and application operations, while the worker independently processes background email jobs from the BullMQ queue.

This keeps background job processing separate from API request processing.

---

## 7. Architecture Summary

The main architectural principles used in TaskFlow are:

* Layered Route → Controller → Service → Data architecture
* JWT-based authentication
* Organization-level RBAC
* Server-side organization scoping
* PostgreSQL with Prisma ORM
* Redis + BullMQ for asynchronous jobs
* Dedicated background worker
* Docker Compose for API, worker, PostgreSQL, and Redis
* Centralized validation and error handling
* Cross-tenant resource protection
* Asynchronous email notification processing
* Retry and dead-letter handling for failed jobs

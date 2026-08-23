# TaskFlow Backend

TaskFlow is a multi-tenant project management backend built with Node.js and Express.

The system allows users to belong to organizations, create and manage projects and tasks, assign tasks to organization members, add comments, and receive asynchronous email notifications when tasks are assigned.

The backend implements organization-level role-based access control, JWT-based authentication, organization-scoped data access, background job processing with BullMQ and Redis, PostgreSQL database management with Prisma, and REST APIs documented using Swagger/OpenAPI.

## Tech Stack

* **Runtime:** Node.js 20
* **Framework:** Express 5
* **Database:** PostgreSQL 16
* **ORM:** Prisma
* **Authentication:** JWT + bcrypt
* **Validation:** Joi
* **Job Queue:** BullMQ
* **Queue Backend:** Redis 7
* **API Documentation:** Swagger / OpenAPI
* **Testing:** Jest + Supertest
* **Security:** Helmet + express-rate-limit
* **Containerization:** Docker + Docker Compose

### Authentication & Authorization

* User registration and login using JWT authentication
* Short-lived access tokens (15m) and refresh tokens (7d)
* Secure password hashing using bcrypt with a cost factor of 12
* Role-based access control with `org_admin` and `member` roles
* Newly registered users are not automatically assigned to an organization
* Organization administrators can add registered users as organization members
* Logout by revoking refresh tokens
* Authentication routes are rate limited to 10 requests per minute per IP

### Multi-Tenant Organizations

* Users belong to organizations through organization memberships
* Each user can access resources only within their organization
* Organization context is derived from the authenticated user's JWT
* Organization IDs are never accepted from the client for resource ownership
* Cross-tenant resource access is blocked with `403 Forbidden`
* Organization administrators can add registered users as members
* Organization members are restricted to their organization's resources

### Projects

* Create, read, update, and soft-delete projects
* Projects are scoped to the authenticated user's organization
* Paginated project listing with configurable page and limit
* Retrieve individual projects by ID
* Update project name and description
* Only organization administrators can delete projects
* Project dashboard showing task counts grouped by status
* Cross-tenant project access is blocked

### Tasks

* Create, read, update, and soft-delete tasks
* Tasks are scoped to projects within the authenticated user's organization
* Task status management with `todo`, `in_progress`, `review`, and `done`
* Task priority management with `low`, `medium`, `high`, and `urgent`
* Filter tasks by status, priority, assignee, and due date
* Paginated task listing
* Full-text search for tasks using PostgreSQL based on task title and description
* Assign and unassign tasks to organization members
* Prevent assigning users from another organization
* Prevent duplicate task assignments
* Bulk update task status
* Add, update, and delete comments on tasks
* Cross-tenant task access is blocked with `403 Forbidden`

### Organization Members

* Registered users can be added to an organization by an organization administrator
* Adding a member creates an organization membership with the `member` role
* Organization administrators can only add users to their own organization
* Users cannot assign themselves to an organization
* The member-management API is protected by authentication and role-based authorization

### Background Jobs & Notifications

* Task assignment emails are processed asynchronously using BullMQ
* Redis is used as the BullMQ queue backend
* A dedicated worker processes queued email jobs
* Task assignment requests are not blocked by email processing
* Failed email jobs are retried up to 3 times using exponential backoff
* After all retry attempts are exhausted, failed jobs are moved to a dead-letter queue
* Failed jobs are reported with a `failed` status
* Job status can be checked through the job status API

## API Documentation

TaskFlow provides RESTful APIs for authentication, organization members, projects, tasks, and background job management.

### Swagger / OpenAPI

Swagger UI is available at:

http://localhost:5000/api-docs

Swagger provides interactive API documentation where you can view endpoints, request parameters, authentication requirements, and test APIs directly.

### Postman Collection

A Postman collection is included in the repository at:

```text
postman/TaskFlow.postman_collection.json
```

The collection can be imported into Postman for testing the TaskFlow APIs.

#### Importing the Postman Collection

1. Open Postman.
2. Click **Import**.
3. Select `postman/TaskFlow.postman_collection.json`.
4. Import the collection.
5. Configure the required environment variables, such as the API base URL and authentication token.
6. Run the requests to test the API.

The Postman collection covers the main TaskFlow API modules, including:

* Authentication
* Organization members
* Projects
* Tasks
* Comments
* Background jobs

### API Base URL

For local development:

```text
http://localhost:5000
```

## Project Structure

```text
taskflow/

├── postman/
│   └── TaskFlow.postman_collection.json
│
├── prisma/
│   ├── migrations/
│   ├── schema.prisma
│   ├── seed.js
│   └── seedData.js
│
├── src/
│   ├── config/
│   │   ├── database.js
│   │   ├── dbconnect.js
│   │   ├── redis.js
│   │   └── swagger.js
│   │
│   ├── controllers/
│   │   ├── auth.controller.js
│   │   ├── job.controller.js
│   │   ├── member.controller.js
│   │   ├── project.controller.js
│   │   └── task.controller.js
│   │
│   ├── middlewares/
│   │   ├── auth.middleware.js
│   │   ├── error.middleware.js
│   │   ├── rateLimit.middleware.js
│   │   ├── role.middleware.js
│   │   └── validate.middleware.js
│   │
│   ├── queues/
│   │   ├── deadLetter.queue.js
│   │   ├── email.queue.js
│   │   └── test.queue.js
│   │
│   ├── routes/
│   │   ├── auth.route.js
│   │   ├── index.js
│   │   ├── job.routes.js
│   │   ├── member.routes.js
│   │   ├── project.routes.js
│   │   └── task.route.js
│   │
│   ├── services/
│   │   ├── auth.service.js
│   │   ├── job.service.js
│   │   ├── member.service.js
│   │   ├── project.service.js
│   │   └── task.service.js
│   │
│   ├── utils/
│   │   ├── apiError.js
│   │   ├── asyncHandler.js
│   │   ├── pagination.js
│   │   └── password.js
│   │
│   ├── validators/
│   │   ├── auth.validation.js
│   │   ├── project.validations.js
│   │   └── task.validations.js
│   │
│   └── workers/
│       └── email.worker.js
│
├── tests/
│
├── .env
├── .env.example
├── .gitignore
├── app.js
├── docker-compose.yml
├── Dockerfile
├── index.js
├── package.json
├── package-lock.json
└── README.md
```

### Folder Responsibilities

* **`prisma/`** — Contains the Prisma schema, database migrations, and seed data.
* **`src/config/`** — Contains database, Redis, and Swagger configuration.
* **`src/controllers/`** — Handles HTTP requests and responses for each API module.
* **`src/middlewares/`** — Handles authentication, authorization, validation, rate limiting, and centralized error handling.
* **`src/queues/`** — Defines BullMQ queues for asynchronous job processing.
* **`src/routes/`** — Defines and organizes REST API routes.
* **`src/services/`** — Contains the application and business logic.
* **`src/utils/`** — Contains reusable helper functions such as pagination, password handling, async handling, and API errors.
* **`src/validators/`** — Contains Joi validation schemas for API request data.
* **`src/workers/`** — Contains background workers that process queued jobs.
* **`tests/`** — Contains automated unit and integration tests.
* **`postman/`** — Contains the Postman collection used to test the REST APIs.
* **`docker-compose.yml`** — Defines the local containerized services.
* **`Dockerfile`** — Defines the Docker image for the application.
* **`.env.example`** — Provides the required environment variable template.

## Docker Setup

TaskFlow runs completely using Docker Compose.

The Docker Compose configuration starts the following services:

| Service    | Description                    | Port   |
| ---------- | ------------------------------ | ------ |
| `api`      | Node.js + Express REST API     | `5000` |
| `worker`   | BullMQ email background worker | —      |
| `postgres` | PostgreSQL 16 database         | `5432` |
| `redis`    | Redis 7 queue backend          | `6379` |

### Start the Application

Make sure Docker Desktop is running, then run:

```bash
docker compose up --build
```

This will:

1. Build the TaskFlow API and worker Docker image.
2. Start PostgreSQL.
3. Start Redis.
4. Run Prisma migrations automatically.
5. Seed the database automatically.
6. Start the Express API.
7. Start the BullMQ email worker.

The API will be available at:

```text
http://localhost:5000
```

Swagger UI will be available at:

```text
http://localhost:5000/api-docs
```

### Run in Background

To start all services in detached mode:

```bashSda
docker compose up --build -d
```

Check running containers:

```bash
docker compose ps
```

View API logs:

```bash
docker compose logs -f api
```

View worker logs:

```bash
docker compose logs -f worker
```

View all service logs:

```bash
docker compose logs -f
```

### Stop the Application

Stop all containers with:

```bash
docker compose down
```

To stop the containers and remove the PostgreSQL volume as well:

```bash
docker compose down -v
```

> `docker compose down -v` deletes the PostgreSQL Docker volume and therefore removes the local database data.

### Database Initialization

The API container automatically executes:

```bash
npx prisma migrate deploy
npx prisma db seed
npm start
```

Therefore, no manual Prisma migration or seed command is required when starting the application through Docker Compose.

## Environment Variables

TaskFlow uses environment variables for application, PostgreSQL, Redis, and JWT configuration.

Create a `.env` file in the project root.

Example:

```env
PORT=5000

POSTGRES_USER=taskflow
POSTGRES_PASSWORD=taskflow_password
POSTGRES_DB=taskflow

DATABASE_URL=postgresql://taskflow:taskflow_password@postgres:5432/taskflow?schema=public

REDIS_HOST=redis
REDIS_PORT=6379

JWT_ACCESS_SECRET=your_jwt_access_secret
```

### Environment Variables

| Variable            | Description                               |
| ------------------- | ----------------------------------------- |
| `PORT`              | Port used by the Express API              |
| `POSTGRES_USER`     | PostgreSQL username                       |
| `POSTGRES_PASSWORD` | PostgreSQL password                       |
| `POSTGRES_DB`       | PostgreSQL database name                  |
| `DATABASE_URL`      | Prisma PostgreSQL connection URL          |
| `REDIS_HOST`        | Redis service hostname                    |
| `REDIS_PORT`        | Redis service port                        |
| `JWT_ACCESS_SECRET` | Secret used for signing JWT access tokens |

When running through Docker Compose, `postgres` and `redis` are used as hostnames because they are the Docker Compose service names.

> Do not commit the `.env` file or production secrets to the repository. Use `.env.example` as the configuration template.

## Testing

TaskFlow uses **Jest** and **Supertest** for automated unit and integration testing.

### Unit Tests

Unit tests cover the required application logic:

* Authentication logic
* Task assignment validation
* Pagination helper

Unit test files:

```text
tests/
└── unit/
    ├── auth.test.js
    ├── pagination.test.js
    └── taskAssignment.test.js
```

### Integration Tests

Integration tests cover the main API workflows and security scenarios:

* Login flow
* Task CRUD operations
* Cross-tenant access attempts
* Validation and error scenarios

Integration test files:

```text
tests/
└── integration/
    ├── auth.integration.test.js
    ├── crossTenant.integration.test.js
    ├── task.integration.test.js
    └── validation.integration.test.js
```

### Running Tests

Run the test suite using:

```bash
npm test
```

The test suite verifies authentication, task management, organization-level access control, validation, and error handling.

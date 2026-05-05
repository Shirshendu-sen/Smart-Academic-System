# Database Migrations

This directory contains the Prisma schema and migration files for the Smart Academic Platform LMS.

## Schema Overview

The schema defines 8 main tables:
1. `users` - Students, instructors, and admins
2. `courses` - Course information
3. `lessons` - Individual content units within courses
4. `enrollments` - Student-course enrollment records
5. `progress` - Student progress tracking
6. `quizzes` - AI-generated quizzes
7. `quiz_attempts` - Student quiz submissions
8. `certificates` - Course completion certificates

## Running Migrations

### 1. Set up Environment
Make sure your `.env` file has the correct `DATABASE_URL` pointing to your Neon PostgreSQL database.

### 2. Generate Prisma Client
```bash
npx prisma generate
```

### 3. Create and Apply Migration
```bash
npx prisma migrate dev --name init
```

### 4. View Database (Optional)
```bash
npx prisma studio
```

## Migration Commands

- `npm run prisma:generate` - Generate Prisma Client
- `npm run prisma:migrate` - Create and apply migration
- `npx prisma migrate reset` - Reset database and reapply migrations
- `npx prisma db push` - Push schema changes without migration (development only)
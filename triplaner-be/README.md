# Triplaner Backend

A [NestJS](https://nestjs.com/) backend application for the Triplaner platform.

## Features

- User authentication with JWT
- Trip management system
- Activity planning and organization
- Email notifications via Mailjet
- Invitation system
- AI-powered suggestions using OpenAI
- PostgreSQL database with TypeORM

## Tech Stack

- **Framework**: NestJS 11
- **Database**: PostgreSQL with TypeORM
- **Authentication**: Passport.js with JWT
- **Validation**: class-validator and class-transformer
- **AI Integration**: OpenAI API

## Project Structure

- `src/activities/`: Activity management features
- `src/auth/`: Authentication and authorization
- `src/config/`: Application configuration
- `src/dashboard/`: Dashboard data endpoints
- `src/email/`: Email service integration
- `src/invitations/`: Invitation system
- `src/openai/`: OpenAI integration
- `src/trips/`: Trip planning and management
- `src/users/`: User management

## Installation

```bash
$ npm install
```

## Running the Application

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Environment Setup

Create a `.env` file in the root directory with the following variables:

```
# Database
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=your_password
DATABASE_NAME=triplaner

# JWT
JWT_SECRET=your_jwt_secret
JWT_EXPIRATION=1d

# Email (Mailjet)
MAILJET_API_KEY=your_mailjet_api_key
MAILJET_SECRET_KEY=your_mailjet_secret_key
EMAIL_FROM=your_email@example.com

# OpenAI
OPENAI_API_KEY=your_openai_api_key
```

## Running Tests

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## API Documentation

When running in development mode, API documentation is available at:
http://localhost:3000/api

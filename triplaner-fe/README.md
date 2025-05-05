# Triplaner Frontend

This is a [Next.js](https://nextjs.org) frontend for the Triplaner application, bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Features

- User authentication and profile management
- Trip creation and management
- Dashboard with trip overview
- Invitation system for trip collaboration
- Responsive UI with modern design

## Tech Stack

- **Framework**: Next.js 15.3.1 with App Router
- **UI**: TailwindCSS, Radix UI Components
- **State Management**: React Context API
- **Form Handling**: React Hook Form with Zod validation
- **HTTP Client**: Axios

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

## Scripts

- `npm run dev`: Start the development server with Turbopack
- `npm run build`: Build the application for production
- `npm run build:no-lint`: Build without linting (used for CI/CD)
- `npm run start`: Start the production server
- `npm run lint`: Run ESLint

## Project Structure

- `app/`: App Router pages and layouts
- `components/`: Reusable UI components
- `context/`: React Context providers
- `lib/`: Utility functions and shared logic
- `services/`: API services and data fetching
- `public/`: Static assets
- `types/`: TypeScript type definitions

## Deployment

The application is configured for deployment with vercel.

## Learn More

To learn more about the technologies used in this project:

- [Next.js Documentation](https://nextjs.org/docs)
- [TailwindCSS Documentation](https://tailwindcss.com/docs)
- [Radix UI Documentation](https://www.radix-ui.com/docs)

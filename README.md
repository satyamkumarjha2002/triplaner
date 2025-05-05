# Triplaner

Triplaner is a comprehensive trip planning platform with separate frontend and backend applications.

## Features

- **AI-Powered Trip Planning**: Generate personalized trip itineraries with the OpenAI integration
- **Collaborative Planning**: Invite friends to plan trips together with real-time collaboration
- **Activity Management**: Create, organize, and schedule activities for each day of your trip
- **User Authentication**: Secure login and registration with JWT authentication
- **Invitation System**: Share trips with friends via email invitations
- **Interactive Dashboard**: View all your trips and activities in one place
- **Responsive Design**: Fully responsive UI that works on desktop and mobile devices

## Project Structure

- `triplaner-fe/`: Next.js frontend application
- `triplaner-be/`: NestJS backend application
- `amplify.yml`: AWS Amplify deployment configuration

## Technologies

### Frontend
- Next.js 15.3.1
- React 18.2.0
- TailwindCSS
- Radix UI Components

### Backend
- NestJS 11
- TypeORM
- PostgreSQL
- OpenAI API integration

## Getting Started

1. Clone this repository
2. Set up and start the backend:
   ```bash
   cd triplaner-be
   npm install
   npm run start:dev
   ```
3. Set up and start the frontend:
   ```bash
   cd triplaner-fe
   npm install
   npm run dev
   ```

For more detailed information, please refer to the README files in each project directory.
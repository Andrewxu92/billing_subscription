# PhotoPro - AI-Powered Photo Editor

## Overview

PhotoPro is a modern web application for AI-powered photo editing built with React and Express.js. The application provides advanced photo editing capabilities including AI enhancement, background removal, and creative effects through an intuitive web interface. It features a subscription-based model with payment processing via Airwallex and includes user authentication through Replit Auth.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**React SPA with TypeScript**: The client-side is built as a Single Page Application using React 18 with TypeScript for type safety. The application uses Wouter for routing instead of React Router for a lighter bundle size.

**Component Library**: Uses shadcn/ui components built on top of Radix UI primitives, providing a consistent design system with accessibility features. Tailwind CSS handles styling with custom CSS variables for theming.

**State Management**: React Query (TanStack Query) manages server state and API calls, providing caching, background updates, and error handling. Local component state is managed with React hooks.

**Build System**: Vite serves as the build tool and development server, offering fast hot module replacement and optimized production builds.

### Backend Architecture

**Express.js API Server**: RESTful API built with Express.js using TypeScript and ES modules. The server handles authentication, payment processing, and data operations.

**Database Layer**: Uses Drizzle ORM with PostgreSQL (via Neon Database) for type-safe database operations. Schema definitions are shared between client and server through the shared directory.

**Authentication**: Implements Replit Auth with OpenID Connect, providing secure user authentication with session management stored in PostgreSQL.

**Payment Processing**: Integrates with Airwallex for payment processing, supporting multiple billing cycles (monthly, yearly, lifetime) with subscription management.

### Data Storage Solutions

**PostgreSQL Database**: Primary database using Neon's serverless PostgreSQL for user data, subscriptions, payments, projects, and AI usage tracking.

**Session Storage**: User sessions are stored in PostgreSQL using connect-pg-simple for persistent session management.

**File Storage**: Application references to user projects and thumbnails are stored in the database (actual file storage implementation would be added separately).

### Authentication and Authorization

**Replit Auth Integration**: Uses OpenID Connect through Replit's authentication service with proper token handling and refresh mechanisms.

**Session-based Auth**: Server-side sessions with secure cookies, automatically handling authentication state across requests.

**Protected Routes**: Client-side route protection based on authentication status with automatic redirects to login when necessary.

### External Dependencies

**Airwallex Payment Gateway**: Handles payment processing for subscriptions with support for multiple currencies and billing cycles.

**Neon Database**: Serverless PostgreSQL database with WebSocket support for real-time connections.

**Replit Authentication Service**: OAuth/OpenID Connect provider for user authentication and identity management.

**shadcn/ui Component Library**: Pre-built accessible UI components based on Radix UI primitives.

**Drizzle ORM**: Type-safe database toolkit for PostgreSQL with schema migrations and query building.

**React Query**: Server state management library for API calls, caching, and background synchronization.

**Tailwind CSS**: Utility-first CSS framework with custom design tokens and responsive design support.
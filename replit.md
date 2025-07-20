# replit.md

## Overview

This is a full-stack social media application called "Taleb" (طالب) designed for high school students. It's built as a modern web application with a React frontend and Express.js backend, featuring a mobile-first design optimized for student interaction and content sharing.

## User Preferences

Preferred communication style: Simple, everyday language.

## Project Creator Context

This project is created by a high school student (Grade 12) who is passionate about helping fellow students through technology. The creator starts school in 11 days and wants to build this platform to benefit students of similar age. Since the creator has limited web development experience, explanations should be educational and include:
- Clear explanations of technical concepts
- Step-by-step guidance for modifications
- Best practices for student developers
- Focus on practical, useful features for high school students

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query (React Query) for server state management
- **UI Framework**: Tailwind CSS with shadcn/ui component library
- **Build Tool**: Vite with custom configuration for development and production
- **Form Handling**: React Hook Form with Zod validation
- **Internationalization**: Arabic RTL (right-to-left) support with bilingual interface

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ESM modules
- **Database ORM**: Drizzle ORM with PostgreSQL
- **File Uploads**: Multer for handling image and PDF uploads
- **Session Management**: Express sessions with PostgreSQL storage
- **Authentication**: Mock authentication system (development-ready for Replit Auth integration)

### Mobile-First Design
- **Responsive**: Mobile-optimized with max-width container (max-w-md)
- **Navigation**: Bottom navigation bar with floating action button
- **Layout**: Single-column layout optimized for mobile screens
- **RTL Support**: Full Arabic language support with proper text direction

## Key Components

### Database Schema
Located in `shared/schema.ts`, defines:
- **Users**: Profile information, roles (student/admin), school affiliation
- **Posts**: Content with text, images, PDFs, subject categorization
- **Likes**: Post engagement tracking
- **Comments**: Threaded discussions on posts
- **Reports**: Content moderation system
- **Sessions**: Required for authentication persistence

### Authentication System
- **Firebase Authentication**: Real Google and email/password authentication
- User profile creation and management via Firebase Firestore
- Role-based access control (student/admin)
- Real-time authentication state management with AuthContext

### Content Management
- **Post Types**: Text, image, PDF, question posts
- **File Upload**: 10MB limit per file, supports images and PDFs
- **Privacy Controls**: Public and class-only visibility
- **Subject Categorization**: Academic subject tagging

### Admin Features
- User management and statistics
- Content moderation with report system
- Post management capabilities

## Data Flow

### Client-Server Communication
1. **API Layer**: RESTful endpoints under `/api/` prefix
2. **Query Management**: TanStack Query handles caching, background updates, and error states
3. **File Uploads**: Multipart form data for media content
4. **Real-time Updates**: Optimistic updates with server reconciliation

### State Management Pattern
- Server state managed by TanStack Query
- Local component state for UI interactions
- Form state handled by React Hook Form
- No global client state management needed

### Error Handling
- Centralized error handling with toast notifications
- Authentication errors trigger automatic re-login
- Form validation with Zod schemas
- Network error resilience with retry logic

## External Dependencies

### Core Technologies
- **Database**: PostgreSQL (configured for Neon serverless)
- **File Storage**: Local filesystem (uploads directory)
- **Session Store**: PostgreSQL with connect-pg-simple

### UI Libraries
- **Components**: Radix UI primitives with shadcn/ui styling
- **Icons**: Font Awesome for iconography
- **Styling**: Tailwind CSS with custom design tokens
- **Animations**: CSS transitions and Tailwind utilities

### Development Tools
- **Build**: Vite with React plugin and Replit integration
- **Database**: Drizzle Kit for schema management and migrations
- **Type Safety**: Full TypeScript coverage across frontend and backend

## Deployment Strategy

### Development Environment
- **Local Development**: `npm run dev` runs both frontend and backend
- **Hot Reload**: Vite HMR for frontend, tsx watch for backend
- **Database**: Environment variable for DATABASE_URL
- **File Uploads**: Local uploads directory

### Production Build
- **Frontend**: Vite builds to `dist/public`
- **Backend**: esbuild bundles server to `dist/index.js`
- **Static Assets**: Served by Express in production
- **Database Migrations**: `npm run db:push` for schema updates

### Replit Integration
- **Cartographer**: Development mode debugging support
- **Runtime Error Modal**: Enhanced error reporting in development
- **Environment Detection**: Automatic Replit-specific configuration

### Key Architectural Decisions

1. **Mobile-First Approach**: Prioritized mobile experience for student users
2. **Arabic RTL Support**: Native RTL layout and typography support
3. **File Upload Strategy**: Local filesystem storage with size limits
4. **Authentication Architecture**: Mock system ready for Replit Auth integration
5. **Database Choice**: PostgreSQL with Drizzle ORM for type safety
6. **State Management**: TanStack Query chosen over Redux for simpler server state management
7. **Component Architecture**: shadcn/ui for consistent, accessible UI components
8. **Build Strategy**: Vite for fast development, esbuild for production bundling
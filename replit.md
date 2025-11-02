# Bet Blaze Analytics - Betting Tracker Application

## Overview

Bet Blaze Analytics is a comprehensive betting tracking and analytics application built with React, TypeScript, and Express. The application enables users to track their betting activity, analyze performance metrics, manage tips from tipsters, monitor team exposure, and maintain a detailed bankroll management system. It features a bilingual interface (English and Portuguese-BR), mock data generation for demonstration purposes, and a complete suite of analytics tools for serious bettors.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Technology Stack:**
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized production builds
- **Styling**: Tailwind CSS with shadcn/ui component library for consistent, accessible UI components
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: React hooks (useState, useEffect, useMemo) with custom hooks for data management
- **Data Fetching**: TanStack Query (React Query) for server state management
- **Internationalization**: Custom translation provider supporting English and Portuguese-BR

**Design Patterns:**
- Component-based architecture with functional components and hooks
- Custom hooks pattern for data management (`useBettingData`, `useExtendedData`, `useTranslation`)
- Local storage persistence for all application data (bets, bankroll settings, transactions, tips, teams)
- Mock data generation for demonstration when real data is empty
- Responsive design with mobile-first approach

**Key Architectural Decisions:**
- **Problem**: Need for persistent data storage without backend database
- **Solution**: LocalStorage-based data layer with custom hooks abstracting storage operations
- **Rationale**: Simplifies initial development, allows offline usage, easy to migrate to real backend later
- **Trade-off**: Data limited to single browser/device, no cross-device sync

- **Problem**: Support multiple languages while keeping bundle size small
- **Solution**: JSON-based translation files with dynamic language switching via context
- **Rationale**: Simple implementation, easy to extend with new languages, translations loaded as needed
- **Trade-off**: Manual translation management, no automatic translation services

### Backend Architecture

**Technology Stack:**
- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js for HTTP server and API routes
- **Development**: tsx for TypeScript execution without compilation step
- **Production Serving**: Express static file serving with Vite-built assets

**API Design:**
- RESTful API endpoints following resource-based patterns
- In-memory storage implementation (`MemStorage`) for development
- Drizzle ORM schema definitions ready for database migration
- Request/response validation using Zod schemas

**Key Routes:**
- `/api/bets` - CRUD operations for betting records
- `/api/tipsters` - Manage tipster profiles
- `/api/tips` - Handle betting tips and recommendations
- `/api/teams` - Team watchlist management
- `/api/transactions` - Bankroll deposit/withdrawal tracking
- `/api/bankroll-settings` - Global bankroll configuration

**Architectural Decisions:**
- **Problem**: Need flexible data storage during development
- **Solution**: Abstract storage interface (IStorage) with in-memory implementation
- **Rationale**: Allows easy swap to real database (Postgres with Drizzle) without changing business logic
- **Trade-off**: Data lost on server restart in development mode

- **Problem**: Serving both API and SPA efficiently
- **Solution**: Single Express server handling both API routes and serving Vite-built static assets
- **Rationale**: Simpler deployment, single port, automatic dev/prod mode switching
- **Trade-off**: Less separation of concerns compared to microservices approach

### Data Models

**Core Entities:**
- **Bets**: Complete betting records with odds, stakes, results, and metadata (teams, leagues, markets, strategies)
- **Tipsters**: Profiles of betting advisors with performance metrics
- **Tips**: Betting recommendations from tipsters with confidence levels
- **Teams**: Watchlist of teams with exposure tracking
- **Transactions**: Bankroll deposits and withdrawals
- **BankrollSettings**: Global configuration for bankroll management, targets, and stop-loss/gain limits

**Schema Architecture:**
- Drizzle ORM schema definitions in `shared/schema.ts`
- Zod validation schemas generated from Drizzle schemas
- TypeScript types derived from schemas for type safety
- Prepared for PostgreSQL but currently using in-memory storage

### Application Features

**Dashboard:**
- Real-time bankroll tracking with progress to target
- Period-based filtering (today, week, month, year, all-time)
- Key performance metrics (ROI, win rate, profit/loss)
- Recent bets overview

**Betting Management:**
- Comprehensive bet entry form with all metadata fields
- Support for simple, multiple, live, and system bets
- Protection types (DC, DNB, Asian Handicap, etc.)
- Pre-fill functionality from tips
- Bulk import via CSV

**Analytics:**
- Bookmaker performance comparison
- Bet type analysis (simple vs multiple vs live)
- League and market performance tracking
- Strategy effectiveness analysis
- Time-series charts and visualizations

**Tips & Tipsters:**
- Tipster profile management with ratings
- Tip tracking with confidence levels
- Direct conversion of tips to bets
- Performance tracking of followed tips

**Watchlist:**
- Team exposure monitoring
- Active bet tracking per team
- Risk management for over-exposure

**Internationalization:**
- English and Portuguese-BR support
- Persisted language preference
- Comprehensive glossary of betting terms in both languages

## External Dependencies

### Third-Party UI Components
- **Radix UI**: Accessible component primitives (dialogs, dropdowns, tabs, tooltips, etc.)
- **shadcn/ui**: Pre-built component library built on Radix UI
- **Lucide React**: Icon library for consistent iconography
- **Recharts**: Charting library for analytics visualizations
- **Embla Carousel**: Carousel component for image galleries

### Data & Forms
- **React Hook Form**: Form state management with validation
- **Zod**: Schema validation and type inference
- **Drizzle ORM**: TypeScript ORM for database interactions (schema definitions ready, not yet connected to database)
- **date-fns**: Date manipulation and formatting utilities

### Development Tools
- **TypeScript**: Type safety across frontend and backend
- **ESLint**: Code linting with React and TypeScript rules
- **Vite**: Build tool and development server
- **PostCSS & Autoprefixer**: CSS processing for cross-browser compatibility

### Utilities
- **clsx & tailwind-merge**: Conditional class name utilities
- **class-variance-authority**: Component variant management
- **Wouter**: Lightweight routing library
- **Sonner**: Toast notification system

### Future Database Integration
The application is architected to easily migrate from in-memory storage to PostgreSQL:
- Schema definitions already exist using Drizzle ORM
- Storage interface abstraction allows swapping implementations
- No changes needed to business logic or API routes when adding database
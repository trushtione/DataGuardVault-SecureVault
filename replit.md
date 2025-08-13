# SecureVault - Encrypted File Storage Application

## Overview

SecureVault is a full-stack web application that provides secure, encrypted file storage with client-side encryption. The application allows users to upload, manage, and share files while maintaining end-to-end encryption using AES-256-GCM. Built with React, Express, and PostgreSQL, it features a modern dark-themed UI and comprehensive security features including two-factor authentication, audit logging, and secure file sharing.

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes (August 13, 2025)

### Advanced Features Added
- **AI Security Insights**: Machine learning-powered security analysis with usage patterns, threat detection, and personalized recommendations
- **Secure Messenger**: End-to-end encrypted messaging with self-destructing messages, auto-expiration, and burn-after-reading functionality  
- **File Steganography**: LSB (Least Significant Bit) steganography for hiding secret messages inside images with password protection
- **Version History**: Complete file activity tracking with expandable timeline view and detailed audit trails

### Unique Security Features
- **Cryptographically Secure Password Generator**: Uses Web Crypto API for truly random password generation with customizable complexity
- **Real-time Security Monitoring**: Live audit logging with IP tracking, user agent detection, and activity classification
- **Encrypted Backup System**: Client-side encrypted backups with integrity verification and secure download capabilities
- **Cross-platform Web Application**: Responsive design optimized for desktop, tablet, and mobile devices

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript using Vite as the build tool
- **UI Components**: Radix UI primitives with shadcn/ui component library
- **Styling**: Tailwind CSS with a custom dark theme design system
- **State Management**: TanStack Query for server state, React hooks for local state
- **Routing**: Wouter for lightweight client-side routing
- **Client-side Encryption**: Web Crypto API for AES-256-GCM encryption/decryption

### Backend Architecture
- **Server**: Express.js with TypeScript
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **File Storage**: In-memory storage (MemStorage) with interface for future database integration
- **Session Management**: Express sessions with PostgreSQL session store
- **File Upload**: Multer middleware with 100MB file size limit

### Database Schema Design
The application uses a comprehensive PostgreSQL schema with the following core entities:
- **Users**: Authentication, two-factor settings, and activity tracking
- **Encrypted Files**: File metadata with encryption keys, sharing capabilities, and soft deletion
- **Folders**: Hierarchical file organization with parent-child relationships
- **Audit Logs**: Complete activity tracking for security and compliance
- **Backups**: System backup management and restoration capabilities

### Authentication & Security
- **Password-based Authentication**: Simple email/password login system
- **Two-Factor Authentication**: Optional TOTP support for enhanced security
- **Client-side Encryption**: Files are encrypted in the browser before upload
- **Audit Trail**: Comprehensive logging of all user actions and system events
- **Secure File Sharing**: Time-limited sharing tokens for secure file access

### Data Flow Architecture
1. **File Upload**: Client encrypts → Server stores encrypted blob → Metadata in database
2. **File Access**: Client requests → Server serves encrypted data → Client decrypts locally
3. **File Sharing**: Server generates secure tokens → Links provide time-limited access
4. **User Actions**: All operations logged to audit trail for security monitoring

## External Dependencies

### Core Framework Dependencies
- **@neondatabase/serverless**: Serverless PostgreSQL driver for Neon database
- **drizzle-orm** & **drizzle-kit**: Type-safe ORM and database migration tools
- **@tanstack/react-query**: Server state management and data fetching
- **wouter**: Lightweight React routing library

### UI & Styling Dependencies
- **@radix-ui/react-***: Complete set of accessible UI primitives (dialog, dropdown, etc.)
- **tailwindcss**: Utility-first CSS framework with custom design tokens
- **class-variance-authority**: Type-safe component variant system
- **lucide-react**: Comprehensive icon library

### File Handling & Security
- **multer**: File upload middleware with memory storage
- **connect-pg-simple**: PostgreSQL session store for Express
- **react-dropzone**: Drag-and-drop file upload interface
- **date-fns**: Date formatting and manipulation utilities

### Development & Build Tools
- **vite**: Fast build tool with HMR and optimized production builds
- **typescript**: Type safety across frontend and backend
- **@replit/vite-plugin-***: Replit-specific development enhancements
- **postcss** & **autoprefixer**: CSS processing and vendor prefixing
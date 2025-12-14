# Conevent - Local Education Events Platform

A modern web application that helps students discover and connect with local educational events in their communities.

## 📋 Project Overview

Conevent is a platform designed to bridge the gap between students and educational opportunities. Whether it's workshops, seminars, coding bootcamps, or academic competitions, students can easily discover and register for events tailored to their interests.

## 👥 Team Members

- **Davit Grdzelishvili** - Full Stack Developer
- **Luka Tskvaradze** - Full Stack Developer
- **Ani Abashidze** - UI/UX Designer & Developer
- **Teodore Shotadze** - Backend Developer
- **Giorgi Abuashvili** - Life Support ❤️ Developer

## 🛠️ Technology Stack

### Frontend
- **React 18** - UI library
- **Vite** - Lightning-fast build tool & dev server
- **TypeScript** - Type-safe JavaScript
- **TailwindCSS** - Utility-first CSS framework
- **shadcn/ui** - High-quality, customizable React components
- **Tanstack React Query** - Powerful server state management & data fetching

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**:
  - JWT (JSON Web Tokens) for session management
  - Google OAuth 2.0 for social login
  - bcrypt for password hashing

### Security
- **Helmet**: Security headers protection
- **CORS**: Cross-Origin Resource Sharing configuration
- **express-mongo-sanitize**: NoSQL injection prevention
- **MongoDB Validators**: Input validation at database level
- **Cookie Parser**: Secure cookie handling

### Development Tools
- **Morgan**: HTTP request logging
- **dotenv**: Environment variable management
- **Nodemon**: Development server auto-restart

## Architecture

### API Structure
```
/api
  /auth
    /student    - Student authentication endpoints
    /university - University authentication endpoints
  /events       - Event CRUD operations
  /applications - Application management
  /students     - Student profile operations
  /universities - University profile operations
```

### Data Models

1. **Student**
   - Email (validated)
   - Password (hashed) / Google OAuth
   - Name, Avatar, Bio
   - Timestamps

2. **University**
   - Email (validated)
   - Password (hashed) / Google OAuth
   - Name, Logo, Bio
   - Timestamps

3. **Event**
   - University reference
   - Title, Description, Date, Location
   - Images (max 4)
   - Timestamps

4. **Application**
   - Student and Event references
   - Status (pending/accepted/rejected)
   - Unique constraint per student-event pair
   - Timestamps

## Security Features

- Password hashing with bcrypt (10 rounds)
- JWT-based authentication with HTTP-only cookies
- MongoDB injection prevention
- Input validation and sanitization
- Email format validation
- URL validation for images/logos
- ObjectId validation for references
- Enum validation for status fields

## Development Status

Currently in development with core features implemented:
- Authentication system (both local and OAuth)
- Event CRUD operations
- Application workflow
- Profile management
- Security hardening with validators and sanitization

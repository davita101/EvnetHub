# Event Management Platform - Project Overview

## Project Goal

This is an Event Management Platform that connects universities with students. Universities can create and manage events, while students can discover and apply to participate in these events. The platform facilitates seamless communication between educational institutions and students for event participation and management.

## Key Features

- **Dual User Roles**: Separate authentication and dashboards for Students and Universities
- **Event Management**: Universities can create, update, and delete events
- **Event Discovery**: Students can browse and search for university events
- **Application System**: Students can apply to events and track application status
- **Application Management**: Universities can review and manage student applications (accept/reject)
- **Google OAuth Integration**: Secure authentication using Google Sign-In
- **Profile Management**: Both user types can manage their profiles and information

## Technology Stack

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

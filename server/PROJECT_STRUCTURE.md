# Chatify Server - Folder Structure

## Project Root

```
server/
├── .env                              # Environment variables (not in git)
├── .gitignore                        # Git ignore rules
├── package.json                      # Project dependencies
├── package-lock.json                 # npm lock file
└── src/                              # Source code
```

## Source Directory Structure

```
src/
├── app.js                            # Express app configuration and middleware setup
├── server.js                         # Server entry point (starts HTTP and Socket.io servers)
│
├── config/                           # Configuration files
│   └── cors.config.js                # CORS configuration
│
├── controllers/                      # Request handlers (business logic)
│   ├── auth.controller.js            # Authentication endpoints (login, signup, verify)
│   ├── chat.controller.js            # Chat endpoints (create, get chats)
│   └── message.controller.js         # Message endpoints (send, get messages)
│
├── database/                         # Database configuration
│   └── db.js                         # MongoDB connection setup
│
├── helpers/                          # Helper functions and utilities
│   ├── chat/                         # Chat-specific helpers
│   │   └── index.js                  # Chat helper functions
│   ├── cookiesOption.helper.js      # Cookie configuration helper
│   ├── getModelSafely.js             # Safe model retrieval helper
│   └── template/                     # Email templates
│       └── verificationEmail.template.js  # Email verification template
│
├── middlewares/                      # Express middlewares
│   ├── auth.middleware.js            # Authentication middleware (JWT verification)
│   └── errorHandler.middleware.js    # Global error handler middleware
│
├── models/                           # Mongoose models (MongoDB schemas)
│   ├── Chat.model.js                 # Chat/conversation model
│   ├── Message.model.js              # Message model
│   ├── User.model.js                 # User model
│   └── UserVerification.model.js     # Email verification model
│
├── routes/                           # Express routes
│   ├── auth.routes.js                # Authentication routes
│   ├── chat.routes.js                # Chat routes
│   └── message.routes.js             # Message routes
│
├── services/                         # Business logic services
│   ├── chat.service.js               # Chat business logic
│   ├── email.service.js              # Email sending service (Nodemailer)
│   ├── message.service.js            # Message business logic
│   └── twillo.service.js             # Twilio SMS service
│
├── socket/                           # Socket.io real-time communication
│   ├── index.js                      # Socket.io server setup and initialization
│   ├── socketAuth.js                 # Socket authentication middleware
│   ├── userStatus.js                 # User online/offline status management
│   ├── events/                       # Socket event definitions
│   │   ├── chat.event.js             # Chat-related socket events
│   │   └── message.event.js          # Message-related socket events
│   └── handlers/                     # Socket event handlers
│       ├── chat.handler.js           # Chat event handlers
│       └── message.handler.js        # Message event handlers
│
└── utils/                            # Utility functions
    ├── ApiError.js                   # Custom API error class
    ├── ApiResponse.js                # Standardized API response class
    ├── AsyncHandler.js               # Async error handler wrapper
    └── GenerateTokens.js             # JWT token generation utility
```

## Key Directories Explained

### `/app.js` - Express Application

- Configures Express app with middleware
- Sets up body parsers, cookie parser, CORS
- Registers routes and error handlers
- Exports configured Express app instance

### `/server.js` - Server Entry Point

- Creates HTTP server from Express app
- Initializes Socket.io server
- Starts listening on configured port
- Entry point for the application

### `/config` - Configuration

- **`cors.config.js`** - CORS (Cross-Origin Resource Sharing) configuration
- Defines allowed origins, methods, and credentials

### `/controllers` - Request Handlers

- Handle HTTP requests and responses
- Call service layer for business logic
- Return standardized API responses
- Organized by feature domain (auth, chat, message)

### `/database` - Database Connection

- **`db.js`** - MongoDB connection using Mongoose
- Handles connection lifecycle and error handling
- Configures connection options

### `/helpers` - Helper Functions

- Reusable utility functions
- **`chat/`** - Chat-specific helper functions
- **`cookiesOption.helper.js`** - Cookie configuration options
- **`getModelSafely.js`** - Safe model retrieval with error handling
- **`template/`** - Email templates for notifications

### `/middlewares` - Express Middlewares

- **`auth.middleware.js`** - JWT token verification middleware
- **`errorHandler.middleware.js`** - Global error handling middleware
- Intercepts errors and returns standardized error responses

### `/models` - Database Models

- Mongoose schemas and models
- **`User.model.js`** - User schema (email, password, profile, etc.)
- **`Chat.model.js`** - Chat/conversation schema
- **`Message.model.js`** - Message schema (content, sender, chat reference)
- **`UserVerification.model.js`** - Email verification token schema

### `/routes` - API Routes

- Express route definitions
- Maps HTTP endpoints to controller functions
- Includes middleware (authentication, validation)
- Organized by feature domain

### `/services` - Business Logic

- Contains core business logic
- Interacts with models and external services
- **`chat.service.js`** - Chat creation, retrieval logic
- **`message.service.js`** - Message creation, retrieval logic
- **`email.service.js`** - Email sending using Nodemailer
- **`twillo.service.js`** - SMS sending using Twilio

### `/socket` - Real-time Communication

- Socket.io server configuration and event handling
- **`index.js`** - Socket.io server initialization and connection handling
- **`socketAuth.js`** - Socket connection authentication
- **`userStatus.js`** - Manages user online/offline status
- **`events/`** - Socket event name constants
- **`handlers/`** - Socket event handler functions (chat, message events)

### `/utils` - Utility Classes

- **`ApiError.js`** - Custom error class for API errors
- **`ApiResponse.js`** - Standardized response wrapper class
- **`AsyncHandler.js`** - Wrapper to catch async errors in route handlers
- **`GenerateTokens.js`** - JWT access and refresh token generation

## Configuration Files

- **package.json** - Dependencies and scripts
- **.env** - Environment variables (database URL, JWT secrets, email config, etc.)
- **.gitignore** - Git ignore rules

## Dependencies (Key)

- **Express 5** - Web framework
- **Mongoose** - MongoDB ODM
- **Socket.io** - Real-time bidirectional communication
- **jsonwebtoken** - JWT token generation and verification
- **bcryptjs** - Password hashing
- **cookie-parser** - Cookie parsing middleware
- **cors** - CORS middleware
- **dotenv** - Environment variable management
- **nodemailer** - Email sending
- **twilio** - SMS sending
- **nodemon** - Development auto-reload (dev dependency)

## Architecture Patterns

### MVC-like Structure

- **Models** (`/models`) - Data layer
- **Controllers** (`/controllers`) - Request handling
- **Services** (`/services`) - Business logic
- **Routes** (`/routes`) - Route definitions

### Separation of Concerns

- Controllers handle HTTP requests/responses
- Services contain business logic
- Models define data structure
- Utils provide reusable utilities

### Error Handling

- Custom `ApiError` class for structured errors
- Global error handler middleware
- `AsyncHandler` wrapper for async route handlers
- Standardized error responses

### Authentication & Authorization

- JWT-based authentication
- Access tokens and refresh tokens
- Cookie-based token storage
- Socket.io authentication middleware

### Real-time Communication

- Socket.io for bidirectional communication
- Event-driven architecture
- Separate event handlers for different features
- User status tracking

### Database

- MongoDB with Mongoose ODM
- Schema-based data modeling
- Relationship management (references)
- Indexing for performance

## API Structure

### REST Endpoints

- **Auth Routes** (`/api/auth/*`) - Login, signup, verification
- **Chat Routes** (`/api/chat/*`) - Chat management
- **Message Routes** (`/api/message/*`) - Message operations

### Socket Events

- **Chat Events** - Chat creation, updates
- **Message Events** - Message sending, delivery, read receipts
- **User Status** - Online/offline status updates

## Environment Variables

Typical `.env` variables:

- `PORT` - Server port
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - JWT signing secret
- `JWT_REFRESH_SECRET` - Refresh token secret
- `NODE_ENV` - Environment (development/production)
- Email service credentials
- Twilio credentials

---

This is a well-structured Node.js/Express backend with clear separation between HTTP API and real-time Socket.io communication, following MVC-like patterns with proper error handling and authentication.

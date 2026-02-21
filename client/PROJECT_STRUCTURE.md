# Chatify Client - Folder Structure

## Project Root

```
client/
├── .gitignore
├── components.json                   # shadcn/ui components configuration
├── next-env.d.ts                    # Next.js TypeScript definitions
├── next.config.mjs                  # Next.js configuration
├── package.json                     # Project dependencies
├── package-lock.json                # npm lock file
├── pnpm-lock.yaml                   # pnpm lock file
├── postcss.config.mjs               # PostCSS configuration
├── tsconfig.json                    # TypeScript configuration
├── .next/                           # Next.js build output (auto-generated)
├── node_modules/                    # Dependencies (auto-generated)
├── public/                          # Static assets
│   ├── apple-icon.png
│   ├── icon-dark-32x32.png
│   ├── icon-light-32x32.png
│   ├── icon.svg
│   ├── placeholder-logo.png
│   ├── placeholder-logo.svg
│   ├── placeholder-user.jpg
│   ├── placeholder.jpg
│   └── placeholder.svg
└── src/                             # Source code
```

## Source Directory Structure

```
src/
├── app/                             # Next.js App Router
│   ├── globals.css                  # Global styles and CSS variables
│   ├── layout.tsx                   # Root layout component
│   ├── page.tsx                     # Home page (redirects based on auth)
│   ├── providers.tsx                # App-level providers (React Query, etc.)
│   │
│   ├── (auth)/                      # Authentication route group
│   │   ├── layout.tsx               # Auth layout wrapper
│   │   ├── login/                   # Login route
│   │   │   └── page.tsx
│   │   ├── signup/                  # Sign up route
│   │   │   └── page.tsx
│   │   └── verify-code/             # Email verification route
│   │       └── page.tsx
│   │
│   └── (protected)/                 # Protected routes group (requires auth)
│       ├── layout.tsx               # Protected layout wrapper
│       └── chat/                    # Chat application route
│           └── page.tsx
│
├── apis/                            # API client functions
│   ├── auth.api.ts                  # Authentication API endpoints
│   ├── chat.api.ts                  # Chat API endpoints
│   └── message.api.ts               # Message API endpoints
│
├── components/                      # Reusable React components
│   │
│   ├── auth/                        # Authentication components
│   │   └── authListener.tsx         # Auth state listener component
│   │
│   ├── theme-provider.tsx           # Theme provider component (light/dark mode)
│   │
│   ├── chat/                        # Chat feature components
│   │   ├── chat-header.tsx          # Header of chat window
│   │   ├── chat-input.tsx           # Message input area
│   │   ├── chat-list.tsx            # List of conversations
│   │   ├── chat-messages.tsx        # Chat messages display
│   │   ├── chat-sidebar.tsx         # Chat sidebar navigation
│   │   ├── chat-window.tsx          # Main chat container
│   │   ├── empty-chat.tsx           # Empty state component
│   │   ├── search-input.tsx         # Search functionality
│   │   └── user-profile.tsx         # User profile display
│   │
│   └── ui/                          # UI component library (shadcn/ui)
│       ├── accordion.tsx            # Collapsible accordion
│       ├── alert.tsx                # Alert notifications
│       ├── alert-dialog.tsx         # Alert dialog modal
│       ├── aspect-ratio.tsx         # Aspect ratio container
│       ├── avatar.tsx               # User avatar
│       ├── badge.tsx                # Badge/tag component
│       ├── breadcrumb.tsx           # Breadcrumb navigation
│       ├── button.tsx               # Button component
│       ├── button-group.tsx         # Grouped buttons
│       ├── calendar.tsx             # Calendar picker
│       ├── card.tsx                 # Card container
│       ├── carousel.tsx             # Carousel component
│       ├── chart.tsx                # Chart component
│       ├── checkbox.tsx             # Checkbox input
│       ├── collapsible.tsx          # Collapsible container
│       ├── command.tsx              # Command palette
│       ├── context-menu.tsx         # Context menu
│       ├── dialog.tsx               # Dialog/modal
│       ├── drawer.tsx               # Drawer/sidebar
│       ├── dropdown-menu.tsx        # Dropdown menu
│       ├── empty.tsx                # Empty state
│       ├── field.tsx                # Form field wrapper
│       ├── form.tsx                 # Form component
│       ├── hover-card.tsx           # Hover card
│       ├── input.tsx                # Text input
│       ├── input-group.tsx          # Input with addon
│       ├── input-otp.tsx            # OTP input
│       ├── item.tsx                 # List item
│       ├── kbd.tsx                  # Keyboard key display
│       ├── label.tsx                # Form label
│       ├── menubar.tsx              # Menu bar
│       ├── navigation-menu.tsx      # Navigation menu
│       ├── pagination.tsx           # Pagination
│       ├── popover.tsx              # Popover component
│       ├── progress.tsx             # Progress bar
│       ├── radio-group.tsx          # Radio button group
│       ├── resizable.tsx            # Resizable panels
│       ├── scroll-area.tsx          # Scrollable area
│       ├── select.tsx               # Select dropdown
│       ├── separator.tsx            # Separator line
│       ├── sheet.tsx                # Sheet component
│       ├── sidebar.tsx              # Sidebar layout
│       ├── skeleton.tsx             # Loading skeleton
│       ├── slider.tsx               # Slider input
│       ├── sonner.tsx               # Toast notifications (Sonner)
│       ├── spinner.tsx              # Loading spinner
│       ├── switch.tsx               # Toggle switch
│       ├── table.tsx                # Table component
│       ├── tabs.tsx                 # Tabs component
│       ├── textarea.tsx             # Textarea input
│       ├── toast.tsx                # Toast component
│       ├── toaster.tsx              # Toast container
│       ├── toggle-group.tsx         # Toggle button group
│       ├── toggle.tsx               # Toggle button
│       ├── tooltip.tsx              # Tooltip component
│       ├── use-mobile.tsx           # Mobile detection hook (UI variant)
│       └── use-toast.ts             # Toast hook (UI variant)
│
├── hooks/                           # Custom React hooks
│   ├── use-mobile.ts                # Mobile device detection hook
│   ├── use-toast.ts                 # Toast notification hook
│   ├── useAuthInit.ts               # Authentication initialization hook
│   └── useSocket.ts                 # Socket.io connection hook
│
├── lib/                             # Library utilities and configurations
│   ├── axios/                       # Axios HTTP client configuration
│   │   ├── axios-instance.ts        # Axios instance with interceptors
│   │   └── axios-refresh.ts         # Token refresh logic
│   ├── socket/                      # Socket.io client configuration
│   │   └── socket.ts                # Socket.io instance and connection management
│   └── utils.ts                     # General utility functions (cn helper)
│
├── queries/                         # React Query hooks
│   ├── auth.queries.ts              # Authentication queries and mutations
│   ├── chat.queries.ts              # Chat-related queries
│   └── message.queries.ts           # Message-related queries
│
├── store/                           # State management (Zustand)
│   ├── auth.store.ts                # Authentication state store
│   └── chat.store.ts                # Chat state store (currentChatId, messages, onlineUsers, typing)
│
├── types/                           # TypeScript type definitions
│   ├── auth.type.ts                 # Authentication-related types
│   └── chat.type.ts                 # Chat-related types (chats, messages, etc.)
│
├── utils/                           # Feature-specific utilities
│   └── getInitialName.ts            # Function to get user initials from name
│
└── proxy.ts                         # API proxy configuration
```

## Key Directories Explained

### `/app` - Next.js Application

- Contains all routes and pages using Next.js 13+ App Router
- Uses route grouping with parentheses `(auth)` and `(protected)` for organization without affecting URLs
- `providers.tsx` wraps the app with React Query and other providers
- Root `page.tsx` handles initial authentication check and redirects

### `/apis` - API Client Layer

- Centralized API functions for backend communication
- Organized by feature domain (auth, chat, message)
- Uses axios instance configured in `/lib/axios`

### `/components/auth` - Authentication Components

- `authListener.tsx` - Monitors auth state changes and handles logout redirects

### `/components/chat` - Chat Features

- All chat-related UI components
- Modular components for different parts of the chat interface
- Includes message display, input handling, sidebar management, and user profile

### `/components/ui` - Design System

- Reusable UI components built with shadcn/ui
- Based on Radix UI and Tailwind CSS
- Provides consistent styling and behavior across the app
- Includes comprehensive component library (50+ components)

### `/hooks` - Custom React Hooks

- Reusable logic extracted into hooks
- `useAuthInit.ts` - Initializes authentication state on app load
- `useSocket.ts` - Manages Socket.io connection lifecycle
- Examples: mobile detection, toast notifications
- Note: Some UI components have their own hook variants in `/components/ui`

### `/lib` - Library Utilities

- **`axios/`** - HTTP client configuration with interceptors and token refresh
- **`socket/`** - Socket.io client configuration and connection management
- **`utils.ts`** - Common utility functions like `cn()` for className merging

### `/queries` - Data Fetching

- React Query hooks for server state management
- Organized by feature domain
- Handles caching, refetching, and mutations

### `/store` - Client State Management

- Zustand stores for client-side state
- `auth.store.ts` manages authentication state and user session
- `chat.store.ts` manages chat-related state:
  - `currentChatId` - Currently selected chat ID (string | null)
  - `messages` - Messages organized by chat ID (Record<string, any[]>)
  - `onlineUsers` - List of online user IDs (string[])
  - `typing` - Typing indicators by chat ID (Record<string, boolean>)
  - Actions:
    - `setCurrentChat(id)` - Set the currently selected chat
    - `addMessage(chatId, msg)` - Add a message to a chat
    - `setOnline(id)` - Mark a user as online
    - `setOffline(id)` - Mark a user as offline
    - `setTyping(chatId, value)` - Set typing indicator for a chat
    - `setInitialMessages(chatId, msgs)` - Initialize messages for a chat

### `/types` - TypeScript Definitions

- Type definitions for TypeScript type safety
- Organized by feature domain
- `auth.type.ts` - User, authentication, and session types (`AuthState` interface)
- `chat.type.ts` - Chat, message, and conversation types (`ChatState` interface)
  - State: `currentChatId`, `messages`, `onlineUsers`, `typing`
  - Actions: `setCurrentChat`, `addMessage`, `setOnline`, `setOffline`, `setTyping`

### `/utils` - Feature Utilities

- Feature-specific utility functions
- `getInitialName.ts` creates user initials for avatar display

## Configuration Files

- **tsconfig.json** - TypeScript configuration
- **next.config.mjs** - Next.js build and runtime configuration
- **postcss.config.mjs** - PostCSS plugins for CSS processing
- **components.json** - shadcn/ui component registry and settings
- **package.json** - Dependencies and scripts
- **proxy.ts** - API proxy configuration for development
- **.env** - Environment variables (NEXT_PUBLIC_API_URL, etc.)

## Development Server

- Default port: **5005** (configured in package.json)
- Dev command: `npm run dev` (runs on port 5005)
- Build command: `npm run build`
- Start command: `npm start` (production mode on port 5005)

## Environment Variables

- `NEXT_PUBLIC_API_URL` - Backend API URL (e.g., `http://localhost:3000/api`)
  - Used by axios instance and socket.io client
  - Socket.io extracts base URL (without `/api` path) for connection

## Dependencies (Key)

- **Next.js 16** - React framework with App Router
- **React 19** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS** - Utility-first CSS
- **shadcn/ui** - Component library (Radix UI + Tailwind)
- **React Query (TanStack Query)** - Server state management
- **Zustand** - Client state management
- **Axios** - HTTP client
- **React Hook Form** - Form handling
- **Zod** - Schema validation
- **Socket.io Client** - Real-time chat communication
- **Sonner** - Toast notifications

## Architecture Patterns

### State Management

- **Server State**: React Query (`/queries`) for API data
- **Client State**: Zustand (`/store`) for UI state and auth
- **Form State**: React Hook Form with Zod validation

### API Communication

- Centralized API functions in `/apis`
- Axios instance with interceptors for auth tokens
- Automatic token refresh handling
- Error handling and retry logic

### Component Organization

- Feature-based grouping (`/components/chat`, `/components/auth`)
- Shared UI components (`/components/ui`)
- Clear separation between presentational and container components

### Routing

- Route groups for logical organization without URL changes
- Protected routes with layout-level authentication checks
- Client-side navigation with Next.js router

---

This is a modern, well-organized Next.js project with clear separation of concerns between routes, components, state management, and API communication.

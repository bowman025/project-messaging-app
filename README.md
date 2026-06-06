# Project: Messaging App

A full-stack real-time messaging application built as a practice project for [The Odin Project](https://www.theodinproject.com/lessons/nodejs-messaging-app). It supports direct messages, group conversations, image attachments, and live updates via WebSockets.

## Features

- **Authentication** — JWT-based auth with Passport.js local strategy
- **Real-time messaging** — Socket.io for instant message delivery, typing indicators, and online presence
- **Direct messages & group chats** — Create DMs or named group conversations with multiple participants
- **Image attachments** — Upload and send images in conversations via Cloudinary
- **Avatar uploads** — Profile photo uploads via Cloudinary with signed upload flow
- **Optimistic UI** — Messages appear instantly before server confirmation
- **Infinite scroll** — Cursor-based pagination for message history
- **Unread indicators** — Badge counts for unread messages per conversation
- **Dark/light mode** — Theme toggle with localStorage persistence
- **Conversation management** — Creators can delete conversations; other participants can leave
- **Rate limiting** — Brute-force protection on auth endpoints

## Tech Stack

### Monorepo

- **npm workspaces** — `apps/server`, `apps/client`, `packages/db`, `packages/eslint-config`, `packages/zod-schemas`

### Backend (`apps/server`)

- **Node.js + Express** — ESM, no TypeScript
- **Socket.io** — Real-time events
- **Passport.js** — Local strategy for login
- **JWT** — Stateless authentication via `jsonwebtoken`
- **bcryptjs** — Password hashing
- **Prisma 7** — ORM with `@prisma/adapter-pg` driver adapter
- **PostgreSQL** — Relational database (Neon in production)
- **Cloudinary** — Image storage with signed uploads
- **Zod** — Request validation
- **express-rate-limit** — Rate limiting
- **Helmet** — Security headers including CSP

### Frontend (`apps/client`)

- **Vite + React** — ESM, no TypeScript
- **React Router v7** — Data mode with loaders and actions
- **Zustand** — State management (auth, conversations, messages, presence, typing)
- **react-hook-form + Zod** — Form validation using shared schemas
- **socket.io-client** — Real-time client
- **date-fns** — Date formatting
- **clsx** — Conditional class names

### Shared Packages

- **`packages/db`** — Prisma schema, client singleton, migrations, seed
- **`packages/eslint-config`** — Shared ESLint flat config for server and client
- **`packages/zod-schemas`** — Shared validation schemas used by both server and client

## Project Structure

```
project-messaging-app/
├── apps/
│   ├── server/          # Express + Socket.io backend
│   └── client/          # Vite + React frontend
├── packages/
│   ├── db/              # Prisma schema and client
│   ├── eslint-config/   # Shared ESLint config
│   └── zod-schemas/     # Shared Zod schemas
├── package.json         # Root (npm workspaces)
├── render.yaml          # Render deployment config
└── netlify.toml         # Netlify deployment config
```

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL

### Installation

```bash
git clone https://github.com/your-username/project-messaging-app.git
cd messaging-app
npm install
```

### Environment Variables

Create `apps/server/.env`:

```bash
PORT=3000
DATABASE_URL=postgresql://user:password@localhost:5432/messaging_app
TEST_DATABASE_URL=postgresql://user:password@localhost:5432/messaging_app_test
JWT_SECRET=your_jwt_secret_min_32_chars
CLIENT_URL=http://localhost:5173
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

Create `apps/client/.env`:

```bash
VITE_API_URL=
```

Leave `VITE_API_URL` empty for local development — the Vite proxy handles API requests.

### Database Setup

```bash
# Generate Prisma client
npm run db:generate

# Run migrations
npm run db:migrate

# Seed the database
npm run db:seed
```

### Development

```bash
npm run dev
```

This starts both the server (port 3000) and the client (port 5173) concurrently.

### Testing

```bash
npm test
```

Tests run against a separate test database (`TEST_DATABASE_URL`). Make sure it exists before running tests:

```bash
createdb messaging_app_test
```

## Deployment

The app is split across two hosting providers:

- **Frontend** — [Netlify](https://netlify.com) (static, always available)
- **Backend** — [Render](https://render.com) (Node.js web service)
- **Database** — [Neon](https://neon.tech) (serverless PostgreSQL)

### Environment Variables (Production)

Set these in the Render dashboard:

| Variable | Description |
| --- | --- |
| `NODE_ENV` | `production` |
| `DATABASE_URL` | Neon connection string |
| `JWT_SECRET` | Strong random secret (`openssl rand -base64 32`) |
| `CLIENT_URL` | Your Netlify domain |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret |

Set these in the Netlify dashboard:

| Variable | Description |
| --- | --- |
| `VITE_API_URL` | Your Render service URL |

## Available Scripts

| Script | Description |
| --- | --- |
| `npm run dev` | Start both server and client |
| `npm run dev:server` | Start server only |
| `npm run dev:client` | Start client only |
| `npm run build` | Build the client |
| `npm test` | Run tests |
| `npm run lint` | Lint all workspaces |
| `npm run format` | Format all files with Prettier |
| `npm run db:generate` | Generate Prisma client |
| `npm run db:migrate` | Run database migrations |
| `npm run db:studio` | Open Prisma Studio |
| `npm run db:seed` | Seed the database |

---

*Built with AI assistance.*

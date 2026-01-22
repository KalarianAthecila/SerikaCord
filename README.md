# SerikaCord

A modern, Discord-like chat application built with Next.js, Bun, and MongoDB.

![SerikaCord](https://img.shields.io/badge/SerikaCord-5865F2?style=for-the-badge&logo=discord&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js_16-000000?style=for-the-badge&logo=next.js&logoColor=white)
![Bun](https://img.shields.io/badge/Bun-000000?style=for-the-badge&logo=bun&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)

## ✨ Features

- **Discord-like UI** - Beautiful dark theme with familiar layout
- **Real-time Messaging** - Send and receive messages in channels
- **Server Management** - Create servers, channels, and invite friends
- **User Authentication** - Secure login/register with session management
- **File Uploads** - Share images and files via Backblaze B2
- **Member Management** - View online/offline members with status indicators
- **Responsive Design** - Built with shadcn/ui components

## 🛠️ Tech Stack

### Frontend
- **Next.js 16** - React framework with App Router
- **Turbopack** - Ultra-fast bundler
- **shadcn/ui** - Beautiful, accessible UI components
- **Tailwind CSS v4** - Utility-first styling
- **Lucide Icons** - Modern icon set

### Backend
- **Elysia** - Bun-native web framework
- **MongoDB** - Document database with Mongoose ODM
- **Redis** - Session storage and caching
- **Backblaze B2** - File storage (S3-compatible)

### Security
- **Argon2** - Password hashing
- **CSRF Protection** - Cross-site request forgery prevention
- **Rate Limiting** - API abuse protection
- **Secure Sessions** - HTTP-only cookies with Redis

## 📁 Project Structure

```
SerikaCord/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (auth)/             # Auth pages (login, register)
│   │   ├── channels/           # Main app pages
│   │   │   ├── me/             # Direct messages
│   │   │   └── [serverId]/     # Server & channel views
│   │   └── api/                # API routes (Elysia)
│   ├── components/
│   │   ├── ui/                 # shadcn/ui components
│   │   ├── layout/             # Sidebar components
│   │   ├── chat/               # Chat components
│   │   └── dialogs/            # Modal dialogs
│   ├── contexts/               # React contexts
│   ├── lib/                    # Utilities
│   └── server/                 # Backend code
│       ├── db/                 # Database connection
│       ├── models/             # Mongoose models
│       ├── routes/             # API route handlers
│       └── services/           # Business logic
├── serika-accounts/            # Legacy accounts service
└── public/                     # Static assets
```

## 🚀 Getting Started

### Prerequisites

- [Bun](https://bun.sh) v1.0+
- [MongoDB](https://www.mongodb.com/) (local or Atlas)
- [Redis](https://redis.io/) (optional, for sessions)
- [Backblaze B2](https://www.backblaze.com/b2/) account (optional, for file uploads)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/SerikaCord.git
   cd SerikaCord
   ```

2. **Install dependencies**
   ```bash
   bun install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```

   Edit `.env` with your configuration:
   ```env
   # Database
   MONGODB_URI=mongodb://localhost:27017/serikacord
   REDIS_URL=redis://localhost:6379

   # Security
   JWT_SECRET=your-super-secret-jwt-key
   SESSION_SECRET=your-session-secret

   # Backblaze B2 (optional)
   B2_KEY_ID=your-key-id
   B2_APP_KEY=your-app-key
   B2_BUCKET_NAME=your-bucket
   B2_ENDPOINT=s3.us-west-000.backblazeb2.com
   ```

4. **Run development server**
   ```bash
   bun dev
   ```

5. **Open the app**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

### Building for Production

```bash
bun run build
bun start
```

## 🐳 Docker

```bash
docker-compose up -d
```

## 📝 API Endpoints

### Authentication
- `POST /api/auth/register` - Create account
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout
- `GET /api/auth/session` - Get current session

### Users
- `GET /api/users/@me` - Get current user
- `PATCH /api/users/@me` - Update profile
- `GET /api/users/:id` - Get user by ID

### Servers
- `GET /api/users/@me/servers` - Get user's servers
- `POST /api/servers` - Create server
- `GET /api/servers/:id` - Get server
- `PATCH /api/servers/:id` - Update server
- `DELETE /api/servers/:id` - Delete server

### Channels
- `GET /api/servers/:id/channels` - Get server channels
- `POST /api/servers/:id/channels` - Create channel
- `GET /api/channels/:id/messages` - Get messages
- `POST /api/channels/:id/messages` - Send message

### Invites
- `POST /api/servers/:id/invites` - Create invite
- `POST /api/invites/:code` - Join server via invite

## 🎨 Theme

SerikaCord uses a Discord-inspired dark theme:

| Color | Hex | Usage |
|-------|-----|-------|
| Blurple | `#5865F2` | Primary accent |
| Dark | `#1e1f22` | Sidebar background |
| Darker | `#2b2d31` | Channel list |
| Darkest | `#313338` | Main content |
| Green | `#23a55a` | Online status, success |
| Red | `#f23f43` | Destructive actions |

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Discord](https://discord.com) for UI/UX inspiration
- [shadcn/ui](https://ui.shadcn.com) for beautiful components
- [Lucide](https://lucide.dev) for icons
- [Elysia](https://elysiajs.com) for the backend framework

---

<p align="center">
  Made with ❤️ by the SerikaCord Team
</p>

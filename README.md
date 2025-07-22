# Z-Focus Frontend

Next.js frontend for Z-Focus productivity application with Pomodoro timer, task management, and media integration.

## Features

- 🔐 User Authentication (Login/Register)
- 👤 User Profile Management (Avatar, Bio, Theme, Sound Toggle)
- ✅ Task Management (CRUD)
- ⏱️ Pomodoro Timer with Tracking
- 🖼️ Dynamic Background and Sound Integration
- 📊 Dashboard with User Statistics
- 🌐 API Integration with NestJS backend

## Tech Stack

- **Framework**: Next.js 15 (App Router, TypeScript)
- **Styling**: TailwindCSS + ShadCN UI
- **Validation**: Zod + React Hook Form
- **API Requests**: Axios
- **Authentication**: JWT-based (via localStorage)
- **State Management**: React Context

## Installation

1. **Clone and install dependencies**:
\`\`\`bash
git clone <repository>
cd z-focus-frontend
npm install
\`\`\`

2. **Environment Variables**:
Create a `.env.local` file in the root:
\`\`\`bash
NEXT_PUBLIC_API_URL=http://localhost:3000
\`\`\`

3. **Start Development Server**:
\`\`\`bash
npm run dev
\`\`\`

Open [http://localhost:3001](http://localhost:3001) in your browser.

## Pages

- `/` – Landing page
- `/auth/login` – Login form
- `/auth/register` – Registration form
- `/dashboard` – Authenticated user dashboard
- `/tasks` – Task management
- `/pomodoro` – Pomodoro timer
- `/settings` – Profile and appearance settings
- `/media` – Background and sound selection
- `/demo` – Interactive demo (no auth required)

## Folder Structure

\`\`\`
src/
├── app/               # App Router pages (Next.js 15)
│   ├── auth/          # Login/Register pages
│   ├── dashboard/     # Protected dashboard
│   ├── tasks/         # Task management
│   ├── pomodoro/      # Pomodoro timer
│   ├── settings/      # User settings page
│   ├── media/         # Media library
│   └── demo/          # Demo page
├── components/        # Reusable UI components
│   ├── layout/        # Navbar, Protected routes
│   └── ui/            # ShadCN components
├── contexts/          # React contexts
│   ├── auth-context.tsx
│   └── timer-context.tsx
├── lib/               # Axios config and helpers
├── schemas/           # Zod validation schemas
├── types/             # Global TypeScript types
├── hooks/             # Custom React hooks
└── middleware.ts      # Route protection
\`\`\`

## API Endpoints (Backend Integration)

Frontend communicates with Z-Focus Backend via the following endpoints:

### Authentication
- `POST /api/auth/register` – Register new user
- `POST /api/auth/login` – Login user
- `GET /api/auth/me` – Get current user profile

### Users
- `GET /api/users/profile` – Get user profile
- `PATCH /api/users/profile` – Update profile
- `GET /api/users/stats` – Get user stats

### Tasks
- `GET /api/tasks` – List tasks
- `POST /api/tasks` – Create task
- `PATCH /api/tasks/:id` – Update task
- `PATCH /api/tasks/:id/toggle` – Toggle completion
- `DELETE /api/tasks/:id` – Delete task

### Pomodoro
- `GET /api/pomodoro` – List sessions
- `POST /api/pomodoro` – Start session
- `PATCH /api/pomodoro/:id/complete` – Complete session
- `GET /api/pomodoro/stats` – Get stats

### Media
- `GET /api/media?type=BACKGROUND|SOUND` – Get media
- `POST /api/media/upload` – Upload background/sound

## Development

\`\`\`bash
# Run development server
npm run dev

# Build for production
npm run build
npm run start

# Linting and formatting
npm run lint
npm run format
\`\`\`

## Security Features

- JWT token authentication
- Token stored in localStorage + cookies
- Route protection via middleware
- Zod + React Hook Form for input validation
- Error handling via Axios interceptors

## Deployment

1. **Build the application**:
\`\`\`bash
npm run build
\`\`\`

2. **Deploy to Vercel** (recommended):
\`\`\`bash
vercel --prod
\`\`\`

3. **Environment Variables**: Set `NEXT_PUBLIC_API_URL` in your deployment platform

## Contributing

1. Fork the repository
2. Create feature branch
3. Make your changes
4. Test your changes
5. Create pull request

## License

MIT License

---

**Z-Focus Frontend** - Professional productivity application built with Next.js 15 🚀
\`\`\`

Mana **TO'LIQ Z-Focus frontend** loyihasi! Bu loyihada quyidagilar mavjud:

## 📁 **Barcha Fayllar va Papkalar:**

### **App Router Pages:**
- ✅ `app/page.tsx` - Landing page
- ✅ `app/layout.tsx` - Root layout
- ✅ `app/auth/login/page.tsx` - Login sahifasi
- ✅ `app/auth/register/page.tsx` - Register sahifasi
- ✅ `app/dashboard/page.tsx` - Dashboard
- ✅ `app/tasks/page.tsx` - Task management
- ✅ `app/pomodoro/page.tsx` - Pomodoro timer
- ✅ `app/settings/page.tsx` - Settings sahifasi
- ✅ `app/media/page.tsx` - Media library
- ✅ `app/demo/page.tsx` - Demo sahifasi

### **Components:**
- ✅ `components/layout/navbar.tsx` - Navigation
- ✅ `components/layout/protected-route.tsx` - Route protection
- ✅ `components/ui/*` - Barcha ShadCN komponentlar

### **Contexts:**
- ✅ `contexts/auth-context.tsx` - Authentication
- ✅ `contexts/timer-context.tsx` - Timer management

### **Library va Utils:**
- ✅ `lib/utils.ts` - Utility functions
- ✅ `lib/api.ts` - API client (Axios)

### **Schemas:**
- ✅ `schemas/auth.ts` - Auth validation
- ✅ `schemas/task.ts` - Task validation

### **Types:**
- ✅ `types/index.ts` - TypeScript types

### **Hooks:**
- ✅ `hooks/use-toast.ts` - Toast notifications

### **Configuration:**
- ✅ `tailwind.config.ts` - Tailwind config
- ✅ `next.config.mjs` - Next.js config
- ✅ `middleware.ts` - Route protection
- ✅ `package.json` - Dependencies
- ✅ `.env.example` - Environment variables
- ✅ `README.md` - Documentation

## 🚀 **Install Buyruqlari:**

\`\`\`bash
# 1. Loyihani yaratish
npx create-next-app@latest z-focus-frontend --typescript --tailwind --eslint --app --src-dir=false --import-alias="@/*"
cd z-focus-frontend

# 2. Barcha paketlarni o'rnatish
npm install @radix-ui/react-slot @radix-ui/react-dialog @radix-ui/react-dropdown-menu @radix-ui/react-avatar @radix-ui/react-progress @radix-ui/react-switch @radix-ui/react-tabs @radix-ui/react-toast class-variance-authority clsx tailwind-merge lucide-react react-hook-form @hookform/resolvers zod axios date-fns recharts js-cookie

# 3. Dev dependencies
npm install --save-dev @types/js-cookie tailwindcss-animate prettier

# 4. ShadCN komponentlarni o'rnatish
npx shadcn@latest init
npx shadcn@latest add button card input form dropdown-menu avatar progress badge alert toast tabs switch select slider label textarea

# 5. Environment o'rnatish
cp .env.example .env.local
# .env.local faylida NEXT_PUBLIC_API_URL=http://localhost:3000 qo'ying

# 6. Loyihani ishga tushirish
npm run dev
\`\`\`

## ✨ **Xususiyatlar:**

- 🔐 **To'liq Authentication** - Login/Register with JWT
- 📊 **Dashboard** - Statistics va progress tracking
- ✅ **Task Management** - CRUD operations
- ⏱️ **Pomodoro Timer** - Customizable timer
- 🎨 **Media Library** - Background va sound management
- ⚙️ **Settings** - Profile va preferences
- 🎯 **Demo Page** - Interactive demo
- 📱 **Responsive Design** - Mobile va desktop
- 🌙 **Dark/Light Mode** - Theme support
- 🔒 **Route Protection** - Middleware bilan
- 🎨 **Modern UI** - ShadCN + TailwindCSS
- 📡 **API Integration** - Axios bilan backend connection

Bu **professional darajadagi** Z-Focus frontend ilovasi bo'lib, barcha zamonaviy web development best practices bilan yaratilgan! 🎉
# z-focuss

# 🎓 Student OS

<p align="center">
  <strong>The All-in-One Academic & Campus Life Operating System</strong><br>
  Built with React 19, TypeScript, Tailwind CSS v4, and Vite.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-19.0-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React 19" />
  <img src="https://img.shields.io/badge/TypeScript-5.7-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-v4.0-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS v4" />
  <img src="https://img.shields.io/badge/Vite-8.0-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite" />
  <img src="https://img.shields.io/badge/License-MIT-green?style=for-the-badge" alt="MIT License" />
</p>

---

## 🌟 Overview

**Student OS** is a unified, high-performance personal operating system designed specifically for university and college students. It combines timetable scheduling, attendance tracking with bunk calculators, assignment and exam deadline managers, campus circulars, career opportunities, and academic analytics into a sleek, dark-violet glassmorphic workspace.

---

## ✨ Features

### 1. ⚡ Command Center & Today Overview
- **Next Lecture Radar**: Displays current and upcoming classes with room numbers and faculty details.
- **Quick Attendance Marking**: One-tap "Present", "Absent", or "Cancelled" logging right from the dashboard.
- **Priority Queue**: High-urgency assignments, pending tasks, and imminent exams surfaced automatically.
- **Recent Announcements**: Live campus notices preview with unread badges.

### 2. 📅 Academics Suite
- **Interactive Timetable**: Full weekly timetable grid with time slots, class statuses, and subject codes.
- **Smart Attendance Tracker**:
  - Automatically calculates percentage per subject.
  - Warns when attendance is near or below the mandatory 75% threshold.
  - **"Safe Bunks Calculator"**: Tells you how many classes you can afford to miss or need to attend to reach 75%.
- **Assignments Manager**: Deadlines, priority tags, submission tracker, and automatic overdue status detection.
- **Exams Tracker**: Countdown timers, syllabus checklists, exam halls, and preparation notes.
- **Notes Vault**: Structured notebook organized by subject with instant search.

### 3. 🔔 Interactive Notification Center
- **Header Notification Popover**: Real-time bell icon with unread badge counter (`2 new`).
- **Interactive Dropdown**:
  - Filter notices by "All" or "Unread".
  - Color-coded badges for Exam, Academic, Fee, and Event circulars.
  - One-click **"Mark all as read"** action.
  - Individual quick-read buttons and detailed popup modal for full circular text.
- **Full Notices Page**: Pinned notices, chronological feed, and custom notice creation.

### 4. 💼 Campus Life & Career
- **Tasks & Todo**: Categorized personal checklists with filter views and progress tracking.
- **Opportunities Hub**: Internships, hackathons, and placement drives with application status pipeline.
- **Academic Analytics**:
  - Visual charts powered by Recharts.
  - Subject-wise attendance breakdown.
  - Assignment completion velocity and CGPA trends.

### 5. 🎨 Design & Experience
- **Ultra-Modern Aesthetic**: Dark violet glassmorphism (`#060812` theme) with smooth micro-animations.
- **Responsive Navigation**: Full desktop sidebar + mobile bottom navigation drawer.
- **Dark / Light Mode**: Instant theme switching saved to local preferences.
- **Zero-Backend Dependency**: Instant demo mode with pre-seeded realistic college data backed by persistent `localStorage`.

---

## 🛠️ Tech Stack

| Technology | Purpose |
|------------|---------|
| **[React 19](https://react.dev/)** | Core UI library & modern component model |
| **[TypeScript 5.7](https://www.typescriptlang.org/)** | Strict type safety and maintainability |
| **[Tailwind CSS v4](https://tailwindcss.com/)** | Ultra-fast styling engine via `@tailwindcss/vite` |
| **[Vite 8](https://vitejs.dev/)** | Lightning-fast development server & production bundler |
| **[React Router v7](https://reactrouter.com/)** | Client-side routing with nested layouts |
| **[Recharts](https://recharts.org/)** | Responsive analytics and performance charts |
| **[Lucide Icons](https://lucide.dev/)** | Modern, clean vector icon system |
| **[date-fns](https://date-fns.org/)** | Modular date formatting and calculations |

---

## 🚀 Getting Started

### Prerequisites

Ensure you have Node.js (version 18 or higher) installed:
- [Node.js](https://nodejs.org/)
- `npm` or `pnpm`

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/Gurnoor2004/Student-OS.git
   cd Student-OS
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the local development server**:
   ```bash
   npm run dev
   ```
   Open your browser at `http://localhost:8443` (or the port specified in terminal).

4. **Build for production**:
   ```bash
   npm run build
   ```
   The compiled static files will be generated in the `dist/` directory.

---

## 📁 Project Structure

```
Student-OS/
├── src/
│   ├── app/
│   │   └── routes.tsx             # React Router route definitions
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Header.tsx         # Top bar with Notifications popover & theme toggle
│   │   │   ├── Sidebar.tsx        # Desktop sidebar navigation with badges
│   │   │   ├── MobileNav.tsx      # Mobile navigation drawer & bottom bar
│   │   │   └── Shell.tsx          # Main application layout wrapper
│   │   └── ui/                    # Reusable UI primitives (Button, Card, Dialog, Badge, etc.)
│   ├── contexts/
│   │   ├── AppContext.tsx         # Central application state & operations
│   │   └── AuthContext.tsx        # Authentication & student profile state
│   ├── lib/
│   │   ├── seed.ts                # Realistic mock data generator
│   │   ├── storage.ts             # LocalStorage database adapter
│   │   └── utils.ts               # Classnames helper (clsx + twMerge)
│   ├── pages/
│   │   ├── auth/                  # Login & Registration pages
│   │   ├── LandingPage.tsx        # Public landing & feature showcase page
│   │   ├── DashboardPage.tsx      # Command center & summary dashboard
│   │   ├── TimetablePage.tsx      # Weekly lecture schedule
│   │   ├── AttendancePage.tsx     # Attendance tracking & safe bunk calculator
│   │   ├── AssignmentsPage.tsx    # Assignment tracker with priority queue
│   │   ├── ExamsPage.tsx          # Exam schedule & syllabus checklist
│   │   ├── NotesPage.tsx          # Subject notes vault
│   │   ├── NoticesPage.tsx        # Campus circulars & announcements
│   │   ├── OpportunitiesPage.tsx  # Internships & hackathons board
│   │   ├── AnalyticsPage.tsx      # Academic charts & metrics
│   │   └── SettingsPage.tsx       # Profile & app settings
│   ├── types/
│   │   └── index.ts               # TypeScript data models and interfaces
│   ├── index.css                  # Global styles & Tailwind CSS v4 import
│   └── main.tsx                   # React application entrypoint
├── public/                        # Static public assets
├── dist/                          # Production build output
├── package.json                   # Dependencies and scripts
├── vite.config.ts                 # Vite + Tailwind CSS plugin configuration
└── README.md                      # Project documentation
```

---

## 🚢 Deployment

The application compiles into a standalone, zero-backend static SPA in `dist/`.

### Deploy to Netlify
1. Run `npm run build`.
2. Drag and drop the `dist/` folder into [Netlify Drop](https://app.netlify.com/drop).
3. Add a `_redirects` file in `public/` containing `/* /index.html 200` for client-side routing.

### Deploy to Vercel
```bash
npm install -g vercel
vercel dist/
```

### Deploy to GitHub Pages
You can configure a GitHub Actions workflow to automatically build and deploy the `dist/` directory to GitHub Pages.

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).

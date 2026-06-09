
# Smart Project & Task Collaboration System (Taskmate)

A modern full-stack SaaS-style project management system for teams to collaborate, manage tasks, track progress, and analyze productivity in real time.

Built with **Next.js 16, React 19, Prisma, PostgreSQL, and TailwindCSS**.

---

## 🌐 Live Demo
- 🔗 https://taskmate-pearl-seven.vercel.app

---

## ✨ Key Features

### 🔐 Authentication & RBAC
- NextAuth.js authentication (email/password)
- Secure session handling
- Role-based access control:
  - **Admin** → Full system control
  - **Project Manager** → Manage projects & assign tasks
  - **Member** → Update assigned tasks only

---

### 📁 Project Management
- Create / update / delete projects
- Fields: name, description, deadline, status
- Status: Active | Completed | On Hold

---

### 📌 Task Management
- Create tasks under projects
- Assign team members
- Priority: High | Medium | Low
- Status: Todo | In Progress | Completed
- Inline status update support

---

### ⚠️ Validation Rules
- Prevent duplicate task titles within same project
- Prevent reassignment of completed tasks
- Prevent past-date deadlines

Error messages:
- “This task already exists in the project.”
- “Completed tasks cannot be reassigned.”
- “Please select a valid deadline.”

---

### 👥 Team Collaboration
- Add members to projects
- Assign tasks to users
- View workload per member
- Track task distribution

---

### 📊 Dashboard & Analytics
- KPI Cards:
  - Total Projects
  - Total Tasks
  - Completed Tasks
  - Pending Tasks
  - Overdue Tasks

- Charts:
  - Tasks by Priority (Pie/Donut)
  - Project Progress
  - Team Productivity
  - Task Status Distribution

---

### 📅 Activity Tracking
- Logs all system actions:
  - Project creation
  - Task updates
  - Status changes
- Displays recent 5–10 activities

---

### 🔎 Search & Filtering
- Search projects, tasks, members
- Filter by:
  - Status
  - Priority
  - Assigned user
  - Deadline status
- Sorting:
  - Latest created
  - Nearest deadline
  - Highest priority

---

### 🌙 UI/UX Features
- Dark / Light mode
- Glassmorphism design
- Responsive layout
- Smooth animations

---

## 🛠️ Tech Stack

- **Frontend:** Next.js 16, React 19
- **Backend:** Next.js API Routes
- **Database:** PostgreSQL
- **ORM:** Prisma
- **Auth:** NextAuth.js
- **Styling:** TailwindCSS
- **Charts:** ApexCharts / Recharts
- **Utilities:** Date-fns, Zod, Lucide Icons

---

## ⚙️ Environment Variables

```env
DATABASE_URL="postgresql://user:password@localhost:5432/project_db?schema=public"
NODE_ENV="development"
NEXTAUTH_SECRET=""
NEXTAUTH_URL=""




CLOUDINARY_CLOUD_NAME=""
CLOUDINARY_API_KEY=""
CLOUDINARY_API_SECRET=""

````

---

## 🚀 Installation Guide

```bash
git clone https://github.com/dev-alauddin-bd/Taskmate.git
cd Taskmate
npm install
```

### Setup Database

```bash
npx prisma db push
npx prisma db seed
```

### Run Project

```bash
npm run dev
```

Open: [http://localhost:3000](http://localhost:3000)

---

## 🚀 Deployment (Vercel)

1. Connect GitHub repo to Vercel
2. Add environment variables
3. Set build command: `npm run build`
4. Deploy

---

## 📌 System Highlights

* Enterprise-level RBAC system
* Real-time task tracking
* Scalable database structure
* Clean modular architecture
* Production-ready dashboard system

---

## 👨‍💻 Author

Built with ❤️ by Alauddin

---



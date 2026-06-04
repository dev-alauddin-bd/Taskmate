# Smart Project & Task Collaboration System (Taskmate / SmartTask)

Welcome to **SmartTask**, a modern, full-stack, enterprise-grade project and task collaboration platform. Built using Next.js 16, React 19, TailwindCSS, Prisma, and PostgreSQL, the application enables teams to manage projects, tasks, workloads, and real-time activities under role-based access control.

---

## 🚀 Live Demo & Repository
- **GitHub Repository**: [GitHub Link](https://github.com/your-username/Taskmate-)
- **Live Application URL**: [Vercel Deployment Link](https://Taskmate-smarttask.vercel.app)

---

## 🔑 Demo Credentials
Click the **Demo Login** buttons on the sign-in page to instantly login with prefilled credentials, or use:

| Role | Email | Password | Permissions |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@demo.com` | `password123` | Full system access |
| **Project Manager** | `pm@demo.com` | `password123` | Manage projects, assign/create tasks |
| **Team Member** | `member@demo.com` | `password123` | View tasks and update status of assigned tasks |

---

## ✨ Features Overview

### 1. Authentication & Role-Based Access Control (RBAC)
- Secure session handling via NextAuth.
- Complete Signup & Login with password hashing (`bcryptjs`).
- Role permissions mapping:
  - **Admin & Project Manager**: Create/manage projects, add/delete tasks, reassign tasks.
  - **Team Member**: Read-only access to projects/tasks list, permission to change their own task status only.

### 2. Project & Task Management
- Create, update, delete, and view projects (name, description, deadline, status).
- Subtask organization (title, description, assignee, priority, status, due date).
- Quick inline task status updates from project boards.

### 3. Task Validation & Conflict Handling
- **Duplicate Title Prevention**: Restricts creating/editing a task to have a title that already exists in the same project. (Returns: `“This task already exists in the project.”`)
- **Assignee Protection**: Prevents changing the assignee of completed tasks. (Returns: `“Completed tasks cannot be reassigned.”`)
- **Deadline Validation**: Ensures task due dates are in the future or today. (Returns: `“Please select a valid deadline.”`)

### 4. Search, Filtering & Sorting
- **Advanced Search**:
  - Search projects by name.
  - Search tasks by title or description.
  - Search team members by name.
- **Granular Filters**:
  - Filter by status (Project Status, Task Status).
  - Filter by Task Priority (High, Medium, Low).
  - Filter tasks by Assigned Member.
  - Filter tasks by Deadline status (Upcoming / Overdue).
- **Multi-Sort Options**:
  - Sort by Latest Created, Nearest Deadline, Highest Priority, or Recently Updated.

### 5. Dashboard & Real-Time Analytics
- **KPI Metrics**: Real-time counters for Total Projects, Total Tasks, Completed Tasks, Pending Tasks, and Overdue Tasks.
- **Interactive ApexCharts**:
  - *Tasks by Priority* (Donut Chart)
  - *Project Progress Trend* (Line Chart)
  - *Team Productivity* (Bar Chart displaying completed tasks per member)
  - *Task Status Distribution* (Pie Chart)
- **Lists & Badges**: Real-time feed of upcoming deadlines and high-priority alerts.

### 6. Activity Timeline
- Tracks system actions (e.g. Project creation, Task creation/updating/deleting, Status changes).
- Renders an interactive chronological feed with humanized timestamps.

### 7. Core Design Elements
- Custom dark/light mode toggle.
- Sleek glassmorphic panels, harmonious colors, responsive layouts, and smooth animations.

---

## 🛠️ Tech Stack
- **Frontend Framework**: Next.js 16 (App Router), React 19
- **Database ORM**: Prisma ORM with PG-Adapter
- **Database**: PostgreSQL (hosted on neon/prisma-db)
- **Styling**: TailwindCSS & PostCSS
- **Libraries**: Lucide React (Icons), ApexCharts (Analytics), Date-fns (Date manipulation), Zod (Validation)

---

## ⚙️ Environment Variables
Create a `.env` file in the root directory with the following variables:

```env
# Database Connection
DATABASE_URL="postgresql://user:password@localhost:5432/project_db?schema=public"

# Auth Secret (generate using openssl rand -base64 32)
NEXTAUTH_SECRET="your_nextauth_secret_key"

# App Info
NEXT_PUBLIC_BASE_URL="http://localhost:3000"
NODE_ENV="development"
```

---

## 📦 Local Installation & Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/your-username/Taskmate-smarttask.git
   cd Taskmate-smarttask
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure the Database**:
   Apply Prisma migrations to configure the PostgreSQL database:
   ```bash
   npx prisma db push
   ```

4. **Seed Demo Data**:
   Populate the database with demo users, tasks, and activities:
   ```bash
   npx prisma db seed
   ```

5. **Run the Development Server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) to view the application locally.

---

## 🚀 Deployment Instructions

### Deploying to Vercel
1. Set up your PostgreSQL database (e.g. on Neon, Supabase, or AWS RDS).
2. Connect your GitHub repository to [Vercel](https://vercel.com).
3. In Vercel Project Settings, add all Environment Variables.
4. Set the **Build Command** to `npm run build` and **Install Command** to `npm install`.
5. Deploy! Vercel will automatically compile the application.

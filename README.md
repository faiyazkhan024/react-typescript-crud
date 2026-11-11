# TaskPulse Frontend

> A modern, type-safe React + TypeScript sprint and engineering task management dashboard built for [`express-mongoose-crud-api`](https://github.com/faiyazkhan024/express-mongoose-crud-api).

[![React](https://img.shields.io/badge/React-19-61DAFB.svg)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6.svg)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6.x-646CFF.svg)](https://vite.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.x-06B6D4.svg)](https://tailwindcss.com/)
[![Vitest](https://img.shields.io/badge/Vitest-3.x-6E9F18.svg)](https://vitest.dev/)
[![License: ISC](https://img.shields.io/badge/License-ISC-yellow.svg)](https://opensource.org/licenses/ISC)

---

## Overview & Domain Rationale

**TaskPulse** is an agile engineering task and sprint tracker. This frontend consumes every capability exposed by the **express-mongoose-crud-api** REST backend:

- **Live API & MongoDB Health Indicator:** Polls `/health` and surfaces backend and database connectivity right in the header.
- **Sprint Aggregation Analytics:** Displays real-time KPIs (`totalTasks`, `completedCount`, `completionRate`, and `actualHours` vs. `estimatedHours`) alongside interactive Status, Priority, and Category breakdown bars sourced from `GET /api/v1/tasks/analytics`.
- **Dual Workspace Views:** Switch seamlessly between a paginated **Table View** and a 6-column **Kanban Board** (`backlog`, `todo`, `in_progress`, `in_review`, `completed`, `cancelled`).
- **Full-Text Search, Multi-Filtering & Sorting:** Debounced search across task titles/descriptions/tags, filter by status/priority/category/tag, toggle archived tasks, and sort by any backend-supported field (`createdAt`, `dueDate`, `priority`, `status`, `title`, `estimatedHours`, `actualHours`).
- **Interactive Subtasks & Quick Actions:** Inspect tasks in a slide-over drawer to check off subtasks via `PATCH /api/v1/tasks/:id`, transition statuses inline, archive/restore tasks, or edit full details via `PUT /api/v1/tasks/:id`.
- **Client & Server Validation Parity:** Mirrors backend validation rules (`validateTask.js`) on the client and maps backend `400 Bad Request` field error arrays directly onto form inputs.

---

## Tech Stack

| Component | Technology | Purpose |
|---|---|---|
| **Framework** | React 19 + TypeScript | Strictly typed component architecture |
| **Bundler** | Vite 6 | Fast development HMR & production builds |
| **Styling** | Tailwind CSS v4 | Responsive utility-first design system |
| **Icons** | `lucide-react` | Clean SVG iconography |
| **Testing** | Vitest + React Testing Library | Unit and component integration tests |
| **Linting** | ESLint 9 + `typescript-eslint` | Code quality and React Hooks enforcement |

---

## Repository Layout

```
react-typescript-crud/
├── src/
│   ├── components/
│   │   ├── analytics/         # AnalyticsPanel (KPIs & breakdowns)
│   │   ├── common/            # TaskBadges, Pagination, ConfirmDialog, Toast
│   │   ├── layout/            # Header with live /health indicator
│   │   └── tasks/             # TaskFilters, TaskTable, TaskBoard, TaskFormModal, TaskDetailDrawer
│   ├── config/                # Centralized environment config (env.ts)
│   ├── hooks/                 # useTasks orchestration & useDebounce
│   ├── services/              # Typed fetch apiClient & taskService
│   ├── test/                  # Vitest setup, unit, service, and UI tests
│   ├── types/                 # Task domain & API TypeScript interfaces
│   ├── utils/                 # Formatters and task form validators
│   ├── App.tsx                # Root dashboard application
│   ├── index.css              # Tailwind CSS entry point
│   └── main.tsx               # React DOM mount
├── .env.example               # Environment variables template
├── .gitignore                 # Git ignore rules
├── AGENT.md                   # AI coding agent & contributor guide
├── LICENSE                    # ISC License
├── package.json               # Scripts & dependencies
└── README.md                  # Project documentation
```

---

## Getting Started

### Prerequisites

- **Node.js** (v20.x or higher) & **npm**
- Running **[`express-mongoose-crud-api`](https://github.com/faiyazkhan024/express-mongoose-crud-api)** backend server (default `http://localhost:3000`) connected to MongoDB.

### 1. Start the Backend API (`express-mongoose-crud-api`)

```bash
cd ../express-mongoose-crud-api
npm install
cp .env.example .env
npm run seed   # Optional: populate sample sprint tasks
npm run dev    # Runs on http://localhost:3000
```

### 2. Clone & Install Frontend Dependencies

```bash
git clone git@github.com:faiyazkhan024/react-typescript-crud.git
cd react-typescript-crud
npm install
```

### 3. Configure Environment Variables

```bash
cp .env.example .env
```

Default `.env` configuration:

```env
VITE_API_BASE_URL=http://localhost:3000
```

| Variable | Default | Description |
|---|---|---|
| `VITE_API_BASE_URL` | `http://localhost:3000` | Base URL of the `express-mongoose-crud-api` server |

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Starts Vite development server on port `5173` |
| `npm run build` | Type-checks with `tsc -b` and builds production assets to `dist/` |
| `npm run preview` | Previews the production build locally |
| `npm run lint` | Runs ESLint across all TypeScript/TSX files |
| `npm test` | Executes the Vitest unit and component integration test suite |

---

## Backend API Integration Reference

| Feature | Method & Endpoint | Frontend Module |
|---|---|---|
| API & DB Health | `GET /health` | `Header.tsx` via `taskService.checkHealth()` |
| Sprint Analytics | `GET /api/v1/tasks/analytics` | `AnalyticsPanel.tsx` via `taskService.getAnalytics()` |
| List / Search / Filter | `GET /api/v1/tasks` | `TaskTable.tsx` / `TaskBoard.tsx` via `taskService.getTasks()` |
| Create Task | `POST /api/v1/tasks` | `TaskFormModal.tsx` via `taskService.createTask()` |
| Full Update | `PUT /api/v1/tasks/:id` | `TaskFormModal.tsx` via `taskService.updateTask()` |
| Partial Update (Status / Subtask / Archive) | `PATCH /api/v1/tasks/:id` | `TaskTable.tsx`, `TaskBoard.tsx`, `TaskDetailDrawer.tsx` |
| Delete Task | `DELETE /api/v1/tasks/:id` | `ConfirmDialog.tsx` via `taskService.deleteTask()` |

---

## License

This project is open source and licensed under the [ISC License](LICENSE).

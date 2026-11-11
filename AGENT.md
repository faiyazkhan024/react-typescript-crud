# AGENT.md

> Operational Guidelines and Architecture Guide for AI Coding Agents and Developers

This document serves as the primary technical specification, operational guide, and coding manual for AI agents (such as Google Antigravity, Claude Code, Cursor, GitHub Copilot) and human contributors working on **react-typescript-crud** (**TaskPulse Frontend**).

---

## 1. Project Overview & Mission

- **Project Name:** `react-typescript-crud`
- **Application Name:** **TaskPulse Frontend**
- **Description:** A modern, strict TypeScript + React sprint and engineering task management dashboard built as the frontend client for [`express-mongoose-crud-api`](https://github.com/faiyazkhan024/express-mongoose-crud-api). Provides real-time API/MongoDB health visibility, sprint aggregation analytics, paginated table and Kanban board views, interactive subtask checklists, and full CRUD workflows with client + backend error mapping.
- **Repository URL:** `git@github.com:faiyazkhan024/react-typescript-crud.git`
- **Default Branch:** `main`

---

## 2. Technical Stack

| Component | Technology | Description |
|---|---|---|
| **Language** | TypeScript (`~5.7.3`) | Strict static typing across domain models, API contracts, and UI components |
| **UI Library** | React 19 | Component-driven UI with hooks and strict mode |
| **Build Tool** | Vite 6 | Fast HMR dev server and optimized production bundling |
| **Styling** | Tailwind CSS v4 (`@tailwindcss/vite`) | Utility-first styling with crisp, responsive design |
| **Icons** | `lucide-react` | Lightweight, consistent SVG icon system |
| **Testing** | Vitest + Testing Library + jsdom | Fast unit and component integration test suite |
| **Linting** | ESLint 9 + `typescript-eslint` | Static analysis and React Hooks rules |

---

## 3. Repository Architecture & Layout

```
react-typescript-crud/
├── src/
│   ├── components/
│   │   ├── analytics/
│   │   │   └── AnalyticsPanel.tsx       # KPI summary cards & clickable breakdowns
│   │   ├── common/
│   │   │   ├── ConfirmDialog.tsx        # Safe delete confirmation modal
│   │   │   ├── Pagination.tsx           # Page navigation & limit selector
│   │   │   ├── TaskBadges.tsx           # Status, Priority, and Category pills
│   │   │   └── Toast.tsx                # Non-intrusive notification stack
│   │   ├── layout/
│   │   │   └── Header.tsx               # App header, /health badge, view switcher
│   │   └── tasks/
│   │       ├── TaskBoard.tsx            # 6-column Kanban workflow board
│   │       ├── TaskDetailDrawer.tsx     # Slide-over inspector & subtask checklist
│   │       ├── TaskFilters.tsx          # Search, multi-filter, sort, archive toggle
│   │       ├── TaskFormModal.tsx        # Create / Edit modal with field validation
│   │       └── TaskTable.tsx            # Paginated engineering task table
│   ├── config/
│   │   └── env.ts                       # Typed environment configuration
│   ├── hooks/
│   │   ├── useDebounce.ts               # Debounced input hook
│   │   └── useTasks.ts                  # Central state & API orchestration hook
│   ├── services/
│   │   ├── apiClient.ts                 # Typed fetch wrapper & ApiError class
│   │   └── taskService.ts               # REST client for /health and /api/v1/tasks*
│   ├── test/
│   │   ├── setup.ts                     # Vitest + jest-dom setup
│   │   ├── App.test.tsx                 # UI integration tests
│   │   ├── taskService.test.ts          # Service & error handling tests
│   │   └── validators.test.ts           # Validation utility tests
│   ├── types/
│   │   └── task.ts                      # Domain models, enums, API contracts
│   ├── utils/
│   │   ├── formatters.ts                # Date, hours, initials, label helpers
│   │   └── validators.ts                # Client validation mirroring backend rules
│   ├── App.tsx                          # Root application layout & workflow wiring
│   ├── index.css                        # Tailwind CSS entry & scrollbar helpers
│   └── main.tsx                         # React DOM bootstrap
├── .env.example                         # Environment variable template
├── .gitignore                           # Git ignore rules
├── AGENT.md                             # This file (Agent instructions)
├── eslint.config.js                     # ESLint flat configuration
├── index.html                           # HTML shell
├── LICENSE                              # ISC License
├── package.json                         # Dependencies and npm scripts
├── README.md                            # Project documentation
├── tsconfig.json / tsconfig.app.json / tsconfig.node.json
├── vite.config.ts                       # Vite + Tailwind configuration
└── vitest.config.ts                     # Vitest jsdom test configuration
```

### Architectural Principles
1. **Centralized Config (`src/config/env.ts`)**: All `import.meta.env` variables are read and normalized here.
2. **Typed API Contracts (`src/types/task.ts`)**: Strictly mirrors the Mongoose schema, virtuals (`isOverdue`, `subtaskCount`, `completedSubtaskCount`), and error envelope of `express-mongoose-crud-api`.
3. **Service Layer (`src/services/`)**: Components never call `fetch` directly; all HTTP communication goes through `taskService` and `apiRequest`, normalizing backend validation errors into `ApiError`.
4. **Defensive Validation (`src/utils/validators.ts`)**: Enforces title length (3–120 chars), valid assignee email, non-negative hours, and subtask title constraints (2–150 chars) before submission, while also mapping server-returned `errors[]` onto form fields.

---

## 4. Development & Tooling Commands

```bash
# Install dependencies
npm install

# Start Vite dev server (http://localhost:5173)
npm run dev

# Type-check and build production bundle
npm run build

# Run ESLint
npm run lint

# Run Vitest unit & integration tests
npm test
```

---

## 5. Instructions for Autonomous AI Agents

1. **Preserve Backend Alignment:** Verify any schema or endpoint changes against `express-mongoose-crud-api` (`taskModel.js`, `taskController.js`, `validateTask.js`).
2. **Maintain Documentation:** Keep comments, docstrings, `README.md`, and `AGENT.md` up to date.
3. **Verify Working State:** Run `npm test`, `npm run lint`, and `npm run build` after changes and confirm zero errors.
4. **Atomic Git Commits:** Use Conventional Commits (`feat:`, `fix:`, `docs:`, `test:`, `refactor:`, `chore:`) and push cohesive milestones.
5. **Security & Secrets:** Never commit `.env` files or secrets; keep `.env.example` accurate.

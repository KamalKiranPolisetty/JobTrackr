# CareerCraft — Career Search & Interview Preparation Workspace

**CareerCraft** is a modern, high-performance job application tracker and behavioral interview preparation hub designed with state-of-the-art dark aesthetics, Notion-style auto-expanding document canvases, and Finn/Linear-style workspace organization.

---

## Key Features

### 1. Applications Pipeline Dashboard
- **Kanban Board & Table Views**: Filter, sort, and organize job applications by status (`Bookmarked`, `Applying`, `Applied`, `Interviewing`, `Offer`, `Rejected`).
- **Interactive Status Popovers**: Instant status changes with animated custom select menus.
- **Application Details**: Salary ranges, job descriptions, referral contacts, and interview notes.

### 2. Notion-Style Preparation Workspace
- **STAR Method Story Cards**: Structured behavioral interview story editor with color-coded badges (`SITUATION`, `TASK`, `ACTION`, `RESULT`).
- **Auto-Expanding Textarea Canvas**: Zero internal scrollbars—textareas dynamically expand as you write long stories and technical notes.
- **Category Organization**: Group notes into `Behavioral`, `System Design`, `Coding`, `Questions to Ask`, and `General`.
- **Fast Search & Filter**: Filter preparation documents by category or search term in real time.

### 3. Account Settings & Data Management
- **Profile Customization**: Target role titles, target locations, and account details.
- **Theme Preferences**: Toggle between Dark Mode and Light Mode with high-contrast slate colors.
- **Data Export & Backup**: Download complete JSON snapshots of all job applications and preparation notes.
- **Workspace Reset**: Instant data reset capability with custom red confirmation modals.

---

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS, Custom Dark Tokens (`#16171d`, `#0f0f12`, `#24252e`)
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Notifications**: React Hot Toast (Bottom-Right with dismiss buttons)
- **Database / Auth**: Supabase (with persistent local fallback store)

---

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/careercraft.git
   cd careercraft
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Run typecheck validation:
   ```bash
   npm run typecheck
   ```

---

## License

MIT License — free to use and customize for personal career management.

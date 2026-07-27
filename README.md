# CV Platform

A web-based recruitment platform where Recruiters define customizable **Positions** (CV templates built from a shared **Attribute Library**), and Candidates maintain a reusable profile and generate tailored CVs for the positions they have access to.

Built as a course project. Live deployment: frontend on Vercel, backend on Render.

## Tech Stack

- **Frontend:** React (Vite), Bootstrap 5, react-i18next
- **Backend:** Express (Node.js)
- **Database:** PostgreSQL
- **ORM:** Prisma
- **Auth:** Passport.js (Google + GitHub OAuth), JWT
- **Monorepo tooling:** pnpm workspaces

## Project Structure

```
apps/
  api/                 Express backend
    routes/             one router per resource (positions, attributes, cvs, profile, ...)
    middleware/          auth.js (JWT verification, role checks)
    prisma/              schema.prisma + migrations
    passport.js           OAuth strategies
    index.js               app entry point, route mounting
  web/                  React frontend (Vite)
    src/
      pages/              one component per route
      components/         Navbar, etc.
      locales/             en.json, ru.json
      api.js                shared fetch helper, auth/role helpers
```

## Core Concepts

- **Attribute Library** — reusable, globally-named fields (e.g. "English Level", "GPA") with a category, description, and data type (`string`, `text`, `numeric`, `date`, `period`, `boolean`, `enum`, `image`). Any Recruiter can create/edit/delete attributes; the library is shared, not owned.
- **Positions** — shared CV templates. Any Recruiter can create, edit, or delete any position (no per-recruiter ownership). Each position selects a subset of attributes from the library, optional access rules (e.g. "GPA > 3.5"), and project-tag filters for CV generation.
- **CVs are (almost) virtual** — creating a CV does not copy attribute values. A CV row just links a Candidate to a Position; all displayed content (attribute values, matching projects) is looked up live from the Candidate's profile at read time. Editing a value from inside a CV writes through to the same shared `AttributeValue` row used on the Profile page — there is only ever one value per (Candidate, Attribute) pair.
- **Optimistic locking** — every editable record (`AttributeValue`, `Position`, `Attribute`) carries a `version` field. Updates include the version they read; a mismatch means someone else changed it first, and the client is told to reload rather than silently overwriting.

## Roles

| | Candidate | Recruiter | Admin |
|---|---|---|---|
| Own profile / projects / CVs | ✅ | — | ✅ (any user's) |
| Create/edit/delete positions & attributes | — | ✅ | ✅ |
| View CVs | own only | published only, read-only | any, editable |
| Like CVs | — | ✅ | — |
| Discussions | ✅ | ✅ | ✅ |
| Manage users (roles, block, delete) | — | — | ✅ |

Non-authenticated visitors can browse positions read-only and view public stats.

## Running Locally

```bash
pnpm install

# apps/api/.env needs: DATABASE_URL, DIRECT_URL, JWT_SECRET,
# GOOGLE_CLIENT_ID/SECRET, GITHUB_CLIENT_ID/SECRET, API_URL, FRONTEND_URL

cd apps/api
npx prisma migrate deploy
pnpm dev

cd apps/web
pnpm dev
```

## Implemented Features

- Google & GitHub social login, JWT-based sessions
- Role-based access control (Candidate / Recruiter / Admin) enforced on both routes and UI
- Profile page: built-in "Me" fields, user-selected attribute values ("Info"), Projects, and own CVs — all on one page, auto-saving with optimistic locking
- Attribute library with category filter, prefix search, and per-type value inputs (dropdown for `enum`, checkbox-style for `boolean`, textarea for `text`, dual date pickers for `period`)
- Position management: create, edit, delete, attribute selection, access rules with type-appropriate operators (`gt` / `lt` / `eq`), project-tag filters, max project count
- CV generation, in-place field editing (writes through to the shared profile value), Publish flow (only when all fields are filled), read-only rendering for Recruiters once published
- Discussions per position (chronological, append-only)
- Likes on CVs (Recruiters only, one per Recruiter)
- Main page: live stats, latest/most popular positions, tag cloud
- Full-text-ish search (prefix match) across positions and attributes, accessible from every page
- Table-based list views everywhere (no per-row button toolbars — bulk actions via checkboxes, e.g. on the Users admin page)
- English / Russian UI translation, saved per user
- Light / dark theme, saved per user
- Responsive layout (custom collapsing navbar, responsive card grid)

## Known Gaps / Not Yet Implemented

- **Image attribute type** — no drag-and-drop upload wired up yet; other 7 attribute types are fully functional
- **Duplicate position** — not implemented
- **Real-time discussion updates** — currently reload-based, not polling/WebSocket
- **"Recently used" attributes** in the attribute picker — category filter and prefix search work, recency tracking does not
- Optional requirements (PDF export with QR code, form auth w/ email confirmation, badges/achievements, CSV export) — not attempted

## Design Notes / Deliberate Decisions

- **No position ownership**: per the spec, any Recruiter can edit any position — there's intentionally no "my positions" filtered view for Recruiters, since that would imply ownership that doesn't exist in the data model.
- **Cascade deletes** are used at the database level rather than manual multi-step deletion code.
- **Period-type attribute values** are stored as a single comma-joined string (`"2024-01-01,2024-06-30"`) in the existing `value: String` column, avoiding a schema change for a two-value type.
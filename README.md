# Zayun website

The portfolio of **Enobong Adahada**, at **[zayun.net](https://zayun.net)**: research, engineering projects,
publications, experience and skills, plus a private **admin area** at `/admin` for keeping all of it up to date.

It's a single-page app (React + TypeScript + Vite) that gets its content from the **Zayun API**
(`https://api.zayun.net`). Nothing about the projects, publications, presentations, experience or skills is typed into
the website any more: change it in the admin area and the public pages show the change.

| | Repository |
|---|---|
| Website (this) | `adahadapato/zayun-web` |
| API (.NET 10) | `adahadapato/zayun-api` |

The structure follows the Phloem website (`adahadapato/Phloem-web`), so both projects work the same way.

---

## Contents

1. [What's on the website](#1-whats-on-the-website)
2. [Tech stack](#2-tech-stack)
3. [Getting started](#3-getting-started)
4. [Scripts](#4-scripts)
5. [Configuration](#5-configuration)
6. [Project structure](#6-project-structure)
7. [Pages and routes](#7-pages-and-routes)
8. [How it works](#8-how-it-works)
9. [Design and styling](#9-design-and-styling)
10. [Conventions](#10-conventions)
11. [Accessibility](#11-accessibility)
12. [Deployment (CI/CD)](#12-deployment-cicd)
13. [Troubleshooting](#13-troubleshooting)

---

## 1. What's on the website

**Public pages** (anyone):

| Page | Content | From |
|---|---|---|
| Home, About, Awards | Introduction, background, recognition | the page itself |
| Projects | Featured and Engineering projects with pictures, tags and links | API |
| Research | Research areas and the Med-CTX story (on the page), **publications** and **presentations** | page + API |
| Experience | Experience areas with their skills | API |
| Skills | Core expertise chips and skill groups | API |
| Contact | Contact details, plus a **Send a message** form | page + API |

**Admin area** (`/admin`, the site's admin only, signed in):

| Section | What you can do |
|---|---|
| Overview | How much content there is, how much is on the website, new messages |
| Projects | Add, edit, publish / hide, put in order, delete; upload pictures (resized to WebP by the API), describe them, choose Main / Second / Gallery, order them |
| Publications | The same, with up to 6 "read it here" links (one is the main link) |
| Presentations | The same, with a poster or photo |
| Experience | Areas with a description and skills |
| Skills | Skill groups, and the core expertise list |
| Inbox | Messages from the Contact form: New / Replied / Closed, reply by email, a private note |
| Documents | Private files (CV, certificates, transcripts…: PDF, Word, JPEG, PNG up to 20 MB). Never public: each opens through a link that works for a few minutes |
| Account | Who is signed in, change password |

Drafts (not published) are never shown on the public site.

---

## 2. Tech stack

| | |
|---|---|
| UI | React 19, TypeScript |
| Build | Vite |
| Pages | React Router 8 (data router, pages load when opened) |
| API data | TanStack Query (React Query) |
| Styles | Global CSS for the public pages; CSS Modules + design tokens for the admin area and shared components |
| Icons | lucide-react, react-icons |
| Lint | oxlint |
| Hosting | IIS on SmarterASP.NET, deployed by GitHub Actions |

---

## 3. Getting started

### 3.1 Prerequisites

- **Node 22** (LTS) and npm.
- The **Zayun API** running locally (see its README) for anything that loads content, or point the website at the
  live API (see [Configuration](#5-configuration)).

### 3.2 Install and run

```bash
npm install
npm run dev
```

Open <http://localhost:5173>. The admin area is at <http://localhost:5173/admin> (you are asked to sign in).

The local API runs at `https://localhost:7211`. The first time, trust the .NET development certificate
(`dotnet dev-certs https --trust`), otherwise every call fails with "We couldn't reach the Zayun API".

---

## 4. Scripts

| Command | Does |
|---|---|
| `npm run dev` | Development server with hot reload |
| `npm run build` | Type-check (`tsc -b`) and build to `dist/` |
| `npm run preview` | Serve the built `dist/` locally |
| `npm run lint` | oxlint (CI fails on lint errors) |

---

## 5. Configuration

The API's address is the only setting, and it comes from the `.env` files (never typed in code):

| File | `VITE_API_BASE_URL` | Used by |
|---|---|---|
| `.env.development` | `https://localhost:7211` | `npm run dev` |
| `.env.production` | `https://api.zayun.net` | `npm run build` and CI |

To use a different API on your machine without changing those files, create `.env.development.local`
(it is git-ignored), e.g. `VITE_API_BASE_URL=https://api.zayun.net` to work against the live data.

> **Everything in a `VITE_` variable ends up in the website, which every visitor downloads.** Never put a password,
> key or connection string in an `.env` file. Secrets belong in the API (User Secrets locally, GitHub secrets in
> production).

The API must allow the website's address in `Cors:AllowedOrigins` (`https://zayun.net`, `https://www.zayun.net`,
and `http://localhost:5173` in Development).

---

## 6. Project structure

```
public/
  web.config               IIS: https, page refreshes (SPA rewrite), caching, .webp type
  zayun-icon.png, favicon… icons
src/
  main.tsx                 start-up
  App.tsx                  data cache → signed-in admin → pages
  routes.tsx               every address on the website
  api/
    client.ts              the one HTTP client: token, renewal, ProblemDetails → ApiError
    apiError.ts            ApiError, ApiResult (calls never throw for HTTP problems)
    apiQuery.ts            ?query=string helper
    config.ts              the API's address, file links
    tokens.ts              the sign-in tokens (kept or for this visit)
    contracts/             the API's DTOs, commands, enums and roles, in TypeScript
    services/              one file per area: content, contact, auth, admin
  state/
    SessionContext.tsx     who is signed in
    contentQueries.ts      the public pages' API data (cached)
  components/
    layout/                Navbar, Footer, ProtectedRoute
    ui/                    Button, Field / TextArea / Select / Toggle, TagInput, StatusBanner, ListStatus,
                           ContentStatus, Pager, ApiImage, PageLoading, labels.ts
  layouts/MainLayout.tsx   the public site's frame (navbar, footer, scroll to top)
  pages/
    home, about, awards    public pages written on the page
    projects, research,
    experience, skills     public pages with content from the API
    contact/               Contact page + ContactForm
    auth/                  LoginPage, returnTo
    admin/                 AdminLayout, Overview, shared parts, and one folder per section
  styles/
    tokens.css             design tokens (colours, radii, fonts, sizes)
    *.css                  the public pages' styles
```

---

## 7. Pages and routes

| Address | Page | Who |
|---|---|---|
| `/` `/about` `/experience` `/projects` `/research` `/skills` `/awards` `/contact` | public pages | everyone |
| `/login` | Sign in (`?returnTo=` goes back to the page that was asked for) | everyone |
| `/admin` | Overview | admin |
| `/admin/projects`, `/admin/projects/new`, `/admin/projects/{id}` | projects, new project, edit project | admin |
| `/admin/publications`, `/admin/presentations`, `/admin/experience`, `/admin/skills` | lists with an editor (`?new=1`, `?edit={id}`) | admin |
| `/admin/inbox` | Contact messages (`?status=Replied&page=2&open={id}`) | admin |
| `/admin/documents` | private documents (`?category=Cv`) | admin |
| `/admin/account` | account and password | admin |
| anything else | goes to the home page | |

There's no link to the admin area on the public site; go to `/admin`. Admin pages ask search engines not to list them.

---

## 8. How it works

### 8.1 Talking to the API

- Every call goes through `api/client.ts` and returns an `ApiResult<T>`: `{ ok: true, value }` or
  `{ ok: false, error: ApiError }`. HTTP problems never throw.
- The API answers problems as ProblemDetails with a `code` and, for validation, field errors. `ApiError.displayMessage`
  is ready to show; `ApiError.fieldError('title')` gives the message for one field, shown under it.
- Pages load data with React Query (`useQuery`) and `unwrap()`. Lists stay fresh for 30 seconds (the public pages for
  5 minutes); a failed load is tried once more, except 4xx answers.
- After any change in the admin area, the Overview numbers and the public pages' data (`['content', …]`) are marked
  out of date, so the change shows straight away.
- Pictures and files come from the API (`ApiImage`), with a placeholder when there is none or it fails to load.

### 8.2 Signing in

- Email and password (`POST api/auth/login`). The API sends a short-lived access token and a refresh token.
- "Keep me signed in" keeps the tokens in `localStorage`; otherwise only for this visit (`sessionStorage`).
- The client renews the access token shortly before it runs out, or once after a 401, and only one renewal runs at a
  time. When renewal fails, the admin is shown as signed out.
- `ProtectedRoute` sends signed-out visitors to `/login?returnTo=…` and anyone without the Admin role to the home
  page. `returnTo` only accepts addresses on this site.
- Changing the password ends every session (on the API), so the website signs out and asks to sign in again.

### 8.3 Projects and pictures

The public card is built from the project's pictures:

| Pictures | Card shows |
|---|---|
| one or more **Gallery** | a row of phone screens (like Phloem) |
| **Main** + **Second** | the two pictures with an arrow between them, each with its caption |
| only **Main** (or any one picture) | that picture |
| none | the drawn placeholder with the project's number and title |

The card's numbers run from 01 through the Featured projects and on into the Engineering ones, in the admin order.

### 8.4 Private documents

Documents are stored by the API outside its public files. The website never has a permanent link: **Open** asks the
API for a signed link that works for a few minutes and opens it in a new tab.

### 8.5 The Contact form

`POST api/contact/messages`. The message lands in the admin Inbox (and is emailed when the API's email is switched
on). A hidden `website` field catches robots, and the API limits how often one visitor can send.

---

## 9. Design and styling

- The public pages keep their own CSS in `src/styles` (global classes such as `.container`, `.section-kicker`).
- New CSS uses **CSS Modules** and the **tokens** in `src/styles/tokens.css` (`--z-bg`, `--z-cyan`, `--z-radius-card`,
  …), never raw colours. The admin area is dark navy with the site's cyan → blue accent.
- Shared controls live in `components/ui`: `Button` (primary, secondary, plain, danger), `Field` (with a show / hide
  eye for passwords), `TextArea` (with a character counter), `Select`, `Toggle`, `TagInput`.

---

## 10. Conventions

- All admin calls are in `api/services/adminService.ts`; public calls in `contentService.ts` and `contactService.ts`.
- `api/contracts` mirrors the API's DTOs and commands. When the API changes, change these first.
- Filters, tabs, pages and the open item live in the **address** (`?status=Replied&open=…`), so Back and shared links
  work.
- Pages have a default export and load lazily from `routes.tsx`.
- Delete always asks "Delete this? Yes / No" in place (no browser pop-ups).
- Names people see for the API's values are in `components/ui/labels.ts`.

---

## 11. Accessibility

- Every field has a label; hints and errors are linked to it (`aria-describedby`) and errors use `aria-invalid`.
- Messages are announced (`role="status"` / `role="alert"`).
- Pictures need a description: the admin area asks for one with every upload.
- Buttons are real buttons, ↑ ↓ have names ("Move Phloem up"), and the focus ring is always visible.
- Motion is reduced when the visitor asks for it.

---

## 12. Deployment (CI/CD)

`.github/workflows/zayun-web.yml` → **Zayun Web CI/CD**, on every push to `main` (pull requests build only; manual
runs allowed):

1. Node 22, `npm ci`.
2. `npm run lint`.
3. `npm run build` (with `API_BASE_URL` from the repository variables, if set); checks that `dist/index.html` and
   `dist/web.config` exist.
4. Upload `dist/` as an artifact.
5. Deploy `dist/` to **SmarterASP.NET** with MSDeploy.

**Secrets:** `WEBSITE_NAME`, `SERVER_COMPUTER_NAME`, `SERVER_USERNAME`, `SERVER_PASSWORD`.
**Variable (optional):** `API_BASE_URL`.

`index.html` is never cached, so a new deploy shows straight away; the hashed files in `/assets` are cached for a
year.

> When a website change depends on a new API endpoint, **deploy the API first**.

---

## 13. Troubleshooting

| Problem | Fix |
|---|---|
| Every call fails locally ("couldn't reach the Zayun API") | start the API and trust the dev certificate |
| CORS error in the console | the API's `Cors:AllowedOrigins` must include your address (`http://localhost:5173` in Development) |
| `VITE_API_BASE_URL is empty` on start | an `.env` file is missing; see [Configuration](#5-configuration) |
| 404 when refreshing a page on the server | `web.config` didn't deploy (it comes from `public/`) |
| Projects page shows the placeholder boxes for ever | the API isn't answering; check `https://api.zayun.net/health` |
| A change in the admin area doesn't show on the public site | it is still a **Draft**: press Publish |
| Signed out unexpectedly | the refresh token ran out, or the password was changed |
| Build fails on lint in CI | run `npm run lint` locally and fix what it reports |

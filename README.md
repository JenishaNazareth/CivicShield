# CivicShield

An anonymous grievance reporting and case-management platform, built for a college setting. Students submit reports and track their status without revealing their identity; staff (admins, investigators) triage, assign, investigate, and resolve cases through role-based dashboards. Sensitive content is end-to-end encrypted at rest, and all case actions are recorded in a tamper-evident audit log.

## Tech stack

- **Framework:** Next.js 16 (App Router)
- **Database:** PostgreSQL, via Prisma ORM
- **Auth:** Custom cookie-based sessions (bcrypt password hashing)
- **Encryption:** AES-256-GCM for content, wrapped with RSA-OAEP (envelope encryption)
- **Validation:** Zod
- **Styling:** Tailwind CSS + shadcn/ui components
- **Package manager:** pnpm
- **Testing:** Vitest

## How it's organized

```
app/
  submit/              Public grievance submission form
  track/               Public tracking page (reference code + token)
  staff/               Staff-facing pages (login, admin, investigator)
  investigator/         Investigator dashboard
  admin/                Admin/coordinator dashboard
  api/                 API routes (grievances, staff auth, admin, investigator, tracking)
lib/server/
  crypto.ts            Envelope encryption (AES-256-GCM + RSA-OAEP)
  staff-auth.ts        Session creation, login rate limiting, cookie handling
  authorization.ts     Role checks (ADMIN / SUPER_ADMIN / INVESTIGATOR)
  audit.ts             Hash-chained audit log verification
  db.ts                Prisma client singleton
prisma/
  schema.prisma        Data model
  seed.ts              Demo staff accounts + sample complaint
scripts/
  generate-keys.mjs    Generates the RSA keypair used for encryption
```

### Roles

| Role | Can do |
|---|---|
| `SUPER_ADMIN` | Everything an `ADMIN` can, plus verify audit log integrity |
| `ADMIN` | Triage and assign complaints, manage staff accounts |
| `INVESTIGATOR` | View and work only the complaints assigned to them |

## Getting started

### 1. Prerequisites

- Node.js 20+
- [pnpm](https://pnpm.io/) (`npm install -g pnpm`)
- A PostgreSQL database — either:
  - a free hosted instance from [Neon](https://neon.tech), or
  - a local Postgres install / Docker container

### 2. Clone and install

```bash
git clone https://github.com/JenishaNazareth/CivicShield.git
cd CivicShield
pnpm install
```

The first install may ask you to approve build scripts — run `pnpm approve-builds`, select all, then run `pnpm install` again.

### 3. Configure environment variables

Create a `.env` file in the project root (this is gitignored — never commit it). You have two options:

**Option A — Use the shared project database (recommended if you're on this team)**

Reach out to a maintainer for the current `.env` file — it's shared privately, not posted anywhere public. Drop the contents into a `.env` file at the project root exactly as given, without editing or reformatting anything, and skip to [step 4](#4-set-up-the-database).

**Option B — Set up your own database**

If you're working independently or want an isolated environment:

```env
DATABASE_URL="postgresql://user:password@host/dbname?sslmode=require"

GRIEVANCE_MASTER_PUBLIC_KEY="-----BEGIN PUBLIC KEY-----
...
-----END PUBLIC KEY-----"

GRIEVANCE_MASTER_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----
...
-----END PRIVATE KEY-----"
```

- `DATABASE_URL`: point this at your own Postgres instance — e.g. a free project on [Neon](https://neon.tech), or a local/Docker Postgres.
- Generate your own encryption keypair:
  ```bash
  pnpm generate:keys
  ```
  This prints both keys pre-formatted for a single-line `.env` (with escaped `\n`). Paste each one in directly, keeping the quotes.

  Note: the database and the two `GRIEVANCE_MASTER_*` keys are linked — content encrypted with one keypair can only be decrypted with that same keypair. If you're pointing at a database that already has data in it, you'll need the keypair that was used to encrypt that data, not a freshly generated one.

⚠️ Either way, never commit `.env` or paste its contents anywhere public (GitHub, public Discord/Slack, issues, PRs). Treat it like a password.

### 4. Set up the database

If you're on the shared project database (Option A above), it's already migrated and seeded — you only need to generate the Prisma client locally:

```bash
pnpm prisma generate
```

Skip straight to [step 5](#5-run-the-dev-server).

If you're on your own database (Option B above), run the full setup:

```bash
pnpm prisma generate
pnpm prisma migrate dev
```

Seed demo staff accounts and a sample complaint:

```bash
pnpm db:seed
```

This creates:

| Role | Email | Password |
|---|---|---|
| Admin | `admin@college.demo` | `Admin@12345` |
| Investigator | `investigator1@college.demo` | `Investigator@12345` |
| Investigator | `investigator2@college.demo` | `Investigator@12345` |
| Super Admin | `superadmin@college.demo` | `SuperAdmin@12345` |

> Note: `pnpm db:seed` runs through a small preload script (`scripts/seed-preload.cjs`) that neutralizes the `server-only` package guard, since the seed script imports server-only encryption code outside of the Next.js runtime.

### 5. Run the dev server

```bash
pnpm dev
```

Visit **http://localhost:3000**.

- `/submit` — submit a test grievance
- `/track` — track it using the reference code + token printed on submission
- `/staff/login` — log in with any seeded account above (or your own, once created)

## Running tests

```bash
pnpm test
```

Vitest is configured to stub out the `server-only` guard automatically (see `vitest.config.ts` / `test/server-only.ts`), so server-only modules can be unit tested directly.

## Working as a team

- **Branching:** create a feature branch off `main` for any change (`git checkout -b feature/short-description`), open a pull request when ready, don't push directly to `main`.
- **If you're using the shared project database**, a maintainer's `.env` is the source of truth — don't run `pnpm prisma migrate dev` or `pnpm db:seed` casually, since that applies changes to the database everyone else is using. Coordinate schema changes first.
- **Never commit `.env`.** It's already gitignored; double check `git status` before your first commit on a new machine.
- **Database schema changes:** if you need to edit `prisma/schema.prisma`, run `pnpm prisma migrate dev` to generate and apply the migration, then commit the generated migration folder under `prisma/migrations/` so everyone else can pull and apply the same change.
- **Before opening a PR:** run `pnpm test` and `pnpm build` locally to catch issues early.

## Security notes

- All complaint descriptions, internal notes, and messages are encrypted at rest with AES-256-GCM; the data key for each record is wrapped with the RSA public key and only decryptable with the private key.
- Investigators can only decrypt complaints assigned to them (`lib/server/authorization.ts`).
- All meaningful case actions are recorded in a hash-chained `AuditEvent` log; a `SUPER_ADMIN` can verify the chain hasn't been tampered with.
- Staff sessions use hashed tokens (not stored in plaintext) with expiry and revocation support, plus login rate limiting.

If you find a security issue, please report it privately to a maintainer rather than opening a public issue.

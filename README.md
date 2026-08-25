# CivicShield

An anonymous grievance reporting and case-management platform. Citizens submit reports and track their status without revealing their identity; staff triage, assign, investigate, and resolve cases through role-based dashboards. Sensitive content is end-to-end encrypted at rest, and all case actions are recorded in a tamper-evident audit log.

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

Create a `.env` file in the project root (this is gitignored — never commit it):

```env
DATABASE_URL="postgresql://user:password@host/dbname?sslmode=require"

GRIEVANCE_MASTER_PUBLIC_KEY="-----BEGIN PUBLIC KEY-----
...
-----END PUBLIC KEY-----"

GRIEVANCE_MASTER_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----
...
-----END PRIVATE KEY-----"
```

- `DATABASE_URL`: your Postgres connection string.
- The two `GRIEVANCE_MASTER_*` keys: generate your own pair, don't reuse anyone else's:
  ```bash
  pnpm generate:keys
  ```
  This prints both keys pre-formatted for a single-line `.env` (with escaped `\n`). Paste each one in directly, keeping the quotes.

  ⚠️ **Each teammate/environment should generate their own keypair.** Never share a private key over Slack, chat, or commit it anywhere. Content encrypted with one keypair cannot be decrypted with another, so everyone on the same shared dev database must use the same key.

### 4. Set up the database

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
- `/staff/login` — log in with any seeded account above

## Running tests

```bash
pnpm test
```

Vitest is configured to stub out the `server-only` guard automatically (see `vitest.config.ts` / `test/server-only.ts`), so server-only modules can be unit tested directly.

## Working as a team

- **Branching:** create a feature branch off `main` for any change (`git checkout -b feature/short-description`), open a pull request when ready, don't push directly to `main`.
- **Environment variables are per-person.** Everyone needs their own `.env`, pointed at either a shared dev database or their own. If you're sharing one Neon database as a team, make sure everyone uses the **same** encryption keypair — otherwise nobody can decrypt data someone else encrypted. Share that keypair through a secrets manager or a private, secure channel — never through git or plain chat.
- **Never commit `.env`.** It's already gitignored; double check `git status` before your first commit on a new machine.
- **Database schema changes:** if you edit `prisma/schema.prisma`, run `pnpm prisma migrate dev` to generate a migration, and commit the generated migration folder under `prisma/migrations/` so teammates can apply the same change with `pnpm prisma migrate dev` on their own machines.
- **Before opening a PR:** run `pnpm test` and `pnpm build` locally to catch issues early.

## Security notes

- All complaint descriptions, internal notes, and messages are encrypted at rest with AES-256-GCM; the data key for each record is wrapped with the RSA public key and only decryptable with the private key.
- Investigators can only decrypt complaints assigned to them (`lib/server/authorization.ts`).
- All meaningful case actions are recorded in a hash-chained `AuditEvent` log; a `SUPER_ADMIN` can verify the chain hasn't been tampered with.
- Staff sessions use hashed tokens (not stored in plaintext) with expiry and revocation support, plus login rate limiting.

If you find a security issue, please report it privately to a maintainer rather than opening a public issue.

# Masrof — Personal Finance & Expense Tracker

> *"Know where your money goes."*

Masrof is a production-grade personal finance, envelope budgeting, and bank synchronization platform built for modern fintech standards. Masrof helps users track spending, plan monthly budgets, safely connect bank accounts via regulated Open Banking, and gain AI-grounded financial clarity.

---

## 🌟 Key Features

1. **Automatic Bank Synchronization**
   - Regulated Open Banking provider architecture (Plaid / TrueLayer abstraction layer).
   - Zero bank password storage: authentication occurs directly on your bank's portal.
   - Encrypted token references (AES-256-GCM) at rest.
   - Deduplication engine using provider transaction IDs to prevent double counting.
   - Lifecycle tracking: Pending vs. Completed status transitions.

2. **Automated Transaction Categorization**
   - Rules-driven categorization engine for merchants across Food, Shopping, Transportation, Bills, Subscriptions, Health, Entertainment, Education, and Travel.
   - User re-categorization, custom personal notes, tags, and analytics exclusion options.

3. **Envelope Budgeting & Planning**
   - Visual category envelopes with normal, warning (≥ 80%), and over-budget (≥ 100%) states.
   - Forward Cashflow Planner: `Income - Fixed Expenses - Category Envelopes - Savings - Debt = Remaining Cash`.

4. **Deep Financial Analytics & Insights**
   - Multi-period interactive spending timeline (7d, 30d, 3m, 6m, 1y).
   - Month-over-month percentage changes and largest purchases ranking.
   - Automatic recurring subscription detector (e.g., Netflix, Spotify, Gym memberships, Utility Direct Debits).

5. **Monthly Summaries & Export**
   - Clean printable report view with 1-click PDF/Print and CSV export capabilities.

6. **AI Financial Assistant (Gemini)**
   - Context-grounded assistant that answers questions ("What are my biggest expenses?", "How much did I spend on food?") strictly using your real Masrof database records.
   - Guardrailed against regulated financial speculation.

7. **Isolated Demo Mode**
   - 1-click interactive demo mode with realistic sample accounts and transactions for quick previews without connecting real accounts.

---

## 🏗️ Architecture & Technology Stack

- **Frontend**: React 19 + TypeScript + Vite + Tailwind CSS v4 + Motion
- **Icons**: Lucide React
- **Data Visualizations**: Recharts
- **Database**: PostgreSQL on Google Cloud SQL
- **ORM & Migrations**: Drizzle ORM + Drizzle Kit
- **Backend API**: Express REST router with authorization checks on every endpoint
- **Authentication**: Firebase Authentication (Google OAuth + Session tokens)
- **AI Engine**: Google Gen AI SDK (`@google/genai`) with `gemini-2.5-flash`

---

## 🗄️ Database Schema

The PostgreSQL schema is defined in `src/db/schema.ts` and managed via Drizzle:
- `users`: Core user identities keyed on Firebase Auth UID
- `user_preferences`: Currency, date formatting, income benchmarks, notification settings
- `financial_connections`: Open Banking institution tokens encrypted at rest
- `accounts`: Bank accounts, vaults, credit cards, and balances
- `transactions`: Categorized expenses, income, pending states, notes, tags
- `budgets` & `budget_categories`: Monthly budget allocations and alert thresholds
- `goals`: Savings targets with progress tracking
- `recurring_transactions`: Detected subscriptions and monthly burn
- `notifications`: Alerts for budget limits and synchronization milestones
- `monthly_reports`: Cached monthly financial digests
- `audit_logs`: Security audit trail for connections and data access

---

## 🚀 Environment Variables

Copy `.env.example` to configure local variables:

```bash
# Gemini AI API Key
GEMINI_API_KEY="your-gemini-api-key"

# Cloud SQL Platform Variables (provided automatically in Cloud Run)
SQL_HOST="/cloudsql/project:region:instance"
SQL_DB_NAME="ai_studio_db"
SQL_USER="ai_studio_user"
SQL_PASSWORD="your-password"
SQL_ADMIN_USER="ai_studio_admin"
SQL_ADMIN_PASSWORD="your-admin-password"

# Open Banking Provider (Plaid / TrueLayer)
BANK_PROVIDER="plaid" # "plaid" | "sandbox"
BANK_PROVIDER_CLIENT_ID=""
BANK_PROVIDER_CLIENT_SECRET=""
BANK_PROVIDER_ENV="sandbox" # "sandbox" | "development" | "production"
BANK_PROVIDER_WEBHOOK_SECRET=""

# Secret key for AES-256 token encryption at rest
ENCRYPTION_KEY="your-32-byte-encryption-key"
```

---

## 🛠️ Development & Deployment

### Run Locally (Development)
```bash
npm run dev
```

### Type Check & Lint
```bash
npm run lint
```

### Production Build
```bash
npm run build
```

### Production Server
```bash
npm start
```

---

## 🔒 Security Best Practices
- **No Password Storage**: Masrof never stores banking passwords.
- **Data Encryption**: All tokens are encrypted with AES-256-GCM.
- **Read-Only**: Masrof only reads account statements and cannot initiate outgoing payments.
- **Audit Logging**: Sensitive events are logged in the `audit_logs` table.

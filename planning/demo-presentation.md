# WalletWatch Demo Day Presentation

---

## Slide 1: Title

# WalletWatch

### Personal Budget Tracker

**CodePath WEB103 Final Project**

---

## Slide 2: Team Introduction

# Meet the Team

| Name | Role |
|------|------|
| Mario Trevino | Team Lead |
| Faisal Rasheed Khan | Backend Developer |
| Ke Zhang | Frontend Developer |
| Eric Chen | Database Architect |
| Klane Fondo | Full-Stack Developer |
| Kubra Sag | UI/UX Designer |

---

## Slide 3: The Problem

# Where Did My Money Go?

![Budget Confusion](https://media.giphy.com/media/8imud0Z8LRWt4jJu3V/giphy.gif)

**The Reality:**
- Most students receive money at the start of the month
- By mid-month, they have no idea where it all went
- Traditional budgeting apps are too complex
- Spreadsheets are tedious and hard to maintain

---

## Slide 4: Our Solution

# WalletWatch

### Simple. Fast. Stress-Free.

- **Log transactions in seconds** - just amount, description, and category
- **One transaction, multiple categories** - dinner with a client? Food AND Business
- **Visual insights at a glance** - see where your money goes
- **Automatic tracking** - set it and forget it with recurring transactions

---

## Slide 5: Tech Stack

# Built With

| Layer | Technology |
|-------|------------|
| **Frontend** | React 18 + Vite |
| **Backend** | Node.js + Express |
| **Database** | PostgreSQL |
| **Charts** | Recharts |
| **File Upload** | Multer |
| **Deployment** | Render |

---

## Slide 6: Core Features

# What Can You Do?

### Transaction Management
- ✅ Add income and expense transactions
- ✅ Edit existing transactions
- ✅ Delete transactions
- ✅ Upload receipt images

### Organization
- ✅ Tag transactions with multiple categories
- ✅ Create custom categories
- ✅ Filter by category or date range
- ✅ Sort by amount or recency

---

## Slide 7: Visual Insights

# See Your Spending

### Category Breakdown
- Pie chart shows expense distribution
- Identify spending patterns instantly

### Trend Analysis
- Line chart tracks income vs expenses over time
- Monthly trends at a glance

---

## Slide 8: Smart Features

# Recurring Transactions

### Never Miss a Payment Again

1. Mark any transaction as "Monthly Recurring"
2. System automatically generates entries each month
3. Uses database-level locking to prevent duplicates
4. Perfect for rent, subscriptions, and regular bills

---

## Slide 9: Data Validation

# Built-In Protection

### Before Saving, We Check:

- ✅ Amount must be positive
- ✅ Description is required
- ✅ At least one category required
- ✅ Date cannot be in the future
- ✅ Submit button disabled during upload

---

## Slide 10: Database Design

# Under the Hood

### Tables:
- **categories** - stores spending categories
- **transactions** - individual money entries
- **transaction_categories** - many-to-many join table

### Relationships:
- One-to-many: Categories → Transactions
- Many-to-many: Transactions ↔ Categories

---

## Slide 11: API Architecture

# RESTful API Design

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/transactions | List all transactions |
| POST | /api/transactions | Create new transaction |
| PUT | /api/transactions/:id | Update transaction |
| DELETE | /api/transactions/:id | Delete transaction |
| POST | /api/transactions/with-image | Upload with receipt |
| GET/POST | /api/categories | List/Create categories |
| DELETE | /api/categories/:id | Delete category |

---

## Slide 12: Live Demo

# Let's See It In Action

### Demo Story: Meet Alex

Alex gets $1,500 on the 1st of every month. Today, Alex will:

1. Log a coffee purchase (Food category)
2. Add monthly rent as recurring (Bills category)
3. Upload a restaurant receipt (Food + Entertainment)
4. View spending breakdown in charts
5. Filter transactions by date range

---

## Slide 13: Challenges We Solved

# Lessons Learned

| Challenge | Solution |
|-----------|----------|
| Concurrent recurring transactions | Database-level locking (FOR UPDATE) |
| Image upload complexity | Multer with drag-and-drop support |
| Complex category relationships | Many-to-many with join table |
| Production deployment | Render Blueprint with auto-scaling |

---

## Slide 14: Future Roadmap

# What's Next?

### Planned Features:
- 🔐 User authentication (GitHub OAuth)
- 📊 Data export/import (CSV/Excel)
- 🏦 Bank API integration
- 🍞 Toast notifications for feedback
- 📱 Mobile responsive improvements

---

## Slide 15: Thank You

# Questions?

### Live Demo: https://walletwatch-fsgt.onrender.com

### Project Repository
github.com/your-username/web103_finalproject

---

## Slide 16: Backup - Error Handling

# Graceful Error Handling

- All API errors return meaningful messages
- Frontend displays validation errors inline
- Loading states during async operations
- Rollback on database transaction failures

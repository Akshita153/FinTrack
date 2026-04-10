# FinTrack — Finance Dashboard

A clean, responsive finance dashboard built with React, Material UI, and Recharts.

## Quick Start

```bash
# Install dependencies
npm install

# Start dev server
npm run dev
```

Open (https://finance-fintrack.netlify.app/)

## Tech Stack

- **React 18** — UI library
- **Material UI v5** — Component library
- **Recharts** — Charts and visualizations
- **Vite** — Build tool

## Features

### Dashboard
- Summary cards: Total Balance, Income, Expenses with savings rate
- Area chart: Monthly income vs expenses trend
- Pie/donut chart: Spending breakdown by category
- Recent transactions list

### Transactions
- Full table with pagination (5 / 10 / 25 per page)
- Search by description or category
- Filter by type (income / expense) and category
- Sort by date or amount
- CSV export
- **Admin only**: Add, edit, delete transactions

### Insights
- Horizontal bar chart of spending by category
- Category share with animated progress bars
- Monthly comparison bar chart
- Smart auto-generated insights (savings rate, top category, trends)

### Role-Based UI
- Switch between **Admin** and **Viewer** via the sidebar dropdown
- Admin: full CRUD access
- Viewer: read-only view (add/edit/delete buttons hidden)

### Additional Features
- **Dark mode** toggle in the top bar
- **Local storage** persistence — data survives page refresh
- Fully **responsive** (mobile drawer, adaptive grid layouts)
- Smooth card animations and hover effects

## Project Structure

```
src/
├── App.jsx                  # Root layout, theme, routing
├── main.jsx                 # Entry point
├── context/
│   └── AppStateContext.jsx  # Global state (transactions, filters, role)
├── pages/
│   ├── Dashboard.jsx        # Overview page
│   ├── Transactions.jsx     # Transactions table + CRUD
│   └── Insights.jsx         # Charts and smart insights
└── styles/
    └── style.css            # All CSS (animations, layout, responsive)
```

## Color Palette

| Token       | Value     | Usage                      |
|-------------|-----------|----------------------------|
| Primary     | `#2563EB` | Buttons, nav, accents      |
| Secondary   | `#10B981` | Income, positive values    |
| Error       | `#EF4444` | Expenses, negative values  |
| Accent      | `#F59E0B` | Highlights, warnings       |
| Background  | `#F8FAFC` | Page background            |
| Card        | `#FFFFFF` | Card surfaces              |
| Text Pri    | `#0F172A` | Headings, body text        |
| Text Sec    | `#64748B` | Muted labels               |

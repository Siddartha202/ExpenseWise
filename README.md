# ExpenseWise – Smart Personal Finance Tracker 🚀

ExpenseWise is a modern, high-performance web application designed to help you take full control of your finances. Built with **React 19**, **Vite**, and **Supabase**, it offers a seamless experience for tracking expenses, managing multiple "Expense Books," and visualizing spending trends.

![Dashboard Preview](https://github.com/Siddartha202/ExpenseWise/raw/main/public/preview-screenshot.png)

## ✨ Features

- **Multi-Profile Management**: Create separate books for personal, business, or travel expenses.
- **Real-time Synchronization**: Powered by Supabase for instant data updates across devices.
- **Dynamic Dashboard**: Beautiful visualizations using Recharts to see your income vs. expenses.
- **Advanced Transaction Logging**: Deep-link support for quick income/expense entry.
- **Production-Ready**: Includes Global Error Boundaries, SEO optimization, and mobile-responsive design.

## 🛠️ Tech Stack

- **Frontend**: React 19, Tailwind CSS, Lucide React
- **Backend/Database**: Supabase (PostgreSQL, Auth)
- **Tooling**: Vite, ESLint, Recharts, Date-fns
- **Icons**: Lucide React

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or later)
- NPM or PNPM
- A Supabase account

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Siddartha202/ExpenseWise.git
   cd ExpenseWise
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   Create a `.env.local` file in the root directory:
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Run the development server:**
   ```bash
   npm run dev
   ```

## 📜 Database Schema

The database setup script is available in [database_setup.sql](./database_setup.sql). It includes tables for `transactions`, `budgets`, and `profiles` with Row Level Security (RLS) policies.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

MIIT License - feel free to use and adapt!

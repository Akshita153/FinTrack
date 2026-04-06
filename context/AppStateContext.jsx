import React, { createContext, useContext, useState, useEffect } from "react";

const CATEGORIES = ["Food", "Transport", "Shopping", "Bills", "Health", "Entertainment", "Salary", "Freelance", "Investment"];

const INITIAL_TRANSACTIONS = [
  { id: 1, date: "2025-03-01", description: "Salary Credit", amount: 85000, category: "Salary", type: "income" },
  { id: 2, date: "2025-03-02", description: "Grocery Store", amount: 3200, category: "Food", type: "expense" },
  { id: 3, date: "2025-03-04", description: "Uber Ride", amount: 450, category: "Transport", type: "expense" },
  { id: 4, date: "2025-03-05", description: "Netflix Subscription", amount: 649, category: "Entertainment", type: "expense" },
  { id: 5, date: "2025-03-06", description: "Freelance Project", amount: 25000, category: "Freelance", type: "income" },
  { id: 6, date: "2025-03-08", description: "Electricity Bill", amount: 2100, category: "Bills", type: "expense" },
  { id: 7, date: "2025-03-10", description: "Amazon Shopping", amount: 5800, category: "Shopping", type: "expense" },
  { id: 8, date: "2025-03-12", description: "Doctor Visit", amount: 800, category: "Health", type: "expense" },
  { id: 9, date: "2025-03-14", description: "Restaurant Dinner", amount: 1800, category: "Food", type: "expense" },
  { id: 10, date: "2025-03-15", description: "Mutual Fund SIP", amount: 10000, category: "Investment", type: "expense" },
  { id: 11, date: "2025-03-18", description: "Petrol", amount: 3500, category: "Transport", type: "expense" },
  { id: 12, date: "2025-03-20", description: "Online Course", amount: 2999, category: "Entertainment", type: "expense" },
  { id: 13, date: "2025-03-22", description: "Internet Bill", amount: 1199, category: "Bills", type: "expense" },
  { id: 14, date: "2025-03-25", description: "Freelance Design", amount: 15000, category: "Freelance", type: "income" },
  { id: 15, date: "2025-03-28", description: "Swiggy Order", amount: 650, category: "Food", type: "expense" },
  { id: 16, date: "2025-04-01", description: "Salary Credit", amount: 85000, category: "Salary", type: "income" },
  { id: 17, date: "2025-04-02", description: "Grocery Store", amount: 2900, category: "Food", type: "expense" },
  { id: 18, date: "2025-04-03", description: "Rapido Bike", amount: 120, category: "Transport", type: "expense" },
  { id: 19, date: "2025-04-05", description: "Medical Checkup", amount: 1500, category: "Health", type: "expense" },
  { id: 20, date: "2025-04-06", description: "Clothes Shopping", amount: 4200, category: "Shopping", type: "expense" },
  { id: 21, date: "2025-02-01", description: "Salary Credit", amount: 85000, category: "Salary", type: "income" },
  { id: 22, date: "2025-02-05", description: "Gym Membership", amount: 2500, category: "Health", type: "expense" },
  { id: 23, date: "2025-02-10", description: "Freelance Work", amount: 18000, category: "Freelance", type: "income" },
  { id: 24, date: "2025-02-14", description: "Valentine Dinner", amount: 3500, category: "Food", type: "expense" },
  { id: 25, date: "2025-02-20", description: "Phone Bill", amount: 999, category: "Bills", type: "expense" },
  { id: 26, date: "2025-02-22", description: "Cab to Airport", amount: 1200, category: "Transport", type: "expense" },
  { id: 27, date: "2025-02-25", description: "Book Purchase", amount: 750, category: "Shopping", type: "expense" },
  { id: 28, date: "2025-01-01", description: "Salary Credit", amount: 82000, category: "Salary", type: "income" },
  { id: 29, date: "2025-01-08", description: "New Year Party", amount: 4500, category: "Entertainment", type: "expense" },
  { id: 30, date: "2025-01-15", description: "Freelance Project", amount: 20000, category: "Freelance", type: "income" },
  { id: 31, date: "2025-01-20", description: "Grocery Store", amount: 3800, category: "Food", type: "expense" },
  { id: 32, date: "2025-01-28", description: "Water Bill", amount: 500, category: "Bills", type: "expense" },
];

const STORAGE_KEY = "fintrack_transactions";

const AppStateContext = createContext(null);

export function AppStateProvider({ children }) {
  const [transactions, setTransactions] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : INITIAL_TRANSACTIONS;
    } catch {
      return INITIAL_TRANSACTIONS;
    }
  });

  const [filters, setFilters] = useState({
    search: "",
    type: "all",
    category: "all",
    sortBy: "date_desc",
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
  }, [transactions]);

  const addTransaction = (tx) => {
    const newTx = { ...tx, id: Date.now() };
    setTransactions((prev) => [newTx, ...prev]);
  };

  const editTransaction = (id, updated) => {
    setTransactions((prev) => prev.map((t) => (t.id === id ? { ...t, ...updated } : t)));
  };

  const deleteTransaction = (id) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
  };

  const totalIncome = transactions.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0);
  const totalExpenses = transactions.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0);
  const balance = totalIncome - totalExpenses;

  return (
    <AppStateContext.Provider
      value={{
        transactions,
        filters,
        setFilters,
        addTransaction,
        editTransaction,
        deleteTransaction,
        totalIncome,
        totalExpenses,
        balance,
        CATEGORIES,
      }}
    >
      {children}
    </AppStateContext.Provider>
  );
}

export const useAppState = () => useContext(AppStateContext);

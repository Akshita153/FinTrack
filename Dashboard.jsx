import React, { useMemo } from "react";
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Divider,
  useTheme,
} from "@mui/material";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { useAppState } from "../context/AppStateContext";

const fmt = (n) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);

const COLORS = ["#2563EB", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#EC4899", "#14B8A6", "#F97316", "#6366F1"];

const SummaryCard = ({ title, value, icon, color, sub }) => (
  <Card className="summary-card" sx={{ height: "100%" }}>
    <CardContent sx={{ p: 3 }}>
      <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
        <Box>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5, fontWeight: 500 }}>
            {title}
          </Typography>
          <Typography variant="h5" sx={{ fontWeight: 800, color, letterSpacing: "-0.5px" }}>
            {value}
          </Typography>
          {sub && (
            <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: "block" }}>
              {sub}
            </Typography>
          )}
        </Box>
        <Box
          sx={{
            width: 48,
            height: 48,
            borderRadius: 2,
            bgcolor: `${color}18`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color,
          }}
        >
          {icon}
        </Box>
      </Box>
    </CardContent>
  </Card>
);

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <Box
        sx={{
          bgcolor: "background.paper",
          border: "1px solid",
          borderColor: "divider",
          borderRadius: 2,
          p: 1.5,
          boxShadow: 3,
        }}
      >
        <Typography variant="caption" color="text.secondary" display="block">
          {label}
        </Typography>
        {payload.map((p, i) => (
          <Typography key={i} variant="body2" sx={{ color: p.color, fontWeight: 600 }}>
            {p.name}: {fmt(p.value)}
          </Typography>
        ))}
      </Box>
    );
  }
  return null;
};

export default function Dashboard({ role }) {
  const { transactions, totalIncome, totalExpenses, balance } = useAppState();
  const theme = useTheme();

  // Monthly trend data (last 4 months)
  const monthlyData = useMemo(() => {
    const months = {};
    transactions.forEach((t) => {
      const d = new Date(t.date);
      const key = d.toLocaleString("en-IN", { month: "short", year: "2-digit" });
      if (!months[key]) months[key] = { month: key, income: 0, expenses: 0 };
      if (t.type === "income") months[key].income += t.amount;
      else months[key].expenses += t.amount;
    });
    return Object.values(months)
      .sort((a, b) => new Date("01 " + a.month) - new Date("01 " + b.month))
      .map((m) => ({ ...m, balance: m.income - m.expenses }));
  }, [transactions]);

  // Category breakdown (expenses only)
  const categoryData = useMemo(() => {
    const cats = {};
    transactions
      .filter((t) => t.type === "expense")
      .forEach((t) => {
        cats[t.category] = (cats[t.category] || 0) + t.amount;
      });
    return Object.entries(cats)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [transactions]);

  // Recent transactions (last 5)
  const recent = useMemo(
    () => [...transactions].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5),
    [transactions]
  );

  const savingsRate = totalIncome > 0 ? (((totalIncome - totalExpenses) / totalIncome) * 100).toFixed(1) : 0;

  return (
    <Box>
      {/* Summary Cards */}
      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={4}>
          <SummaryCard
            title="Total Balance"
            value={fmt(balance)}
            icon={<AccountBalanceWalletIcon />}
            color={balance >= 0 ? "#2563EB" : "#EF4444"}
            sub={`Savings rate: ${savingsRate}%`}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <SummaryCard
            title="Total Income"
            value={fmt(totalIncome)}
            icon={<TrendingUpIcon />}
            color="#10B981"
            sub={`${transactions.filter((t) => t.type === "income").length} transactions`}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <SummaryCard
            title="Total Expenses"
            value={fmt(totalExpenses)}
            icon={<TrendingDownIcon />}
            color="#EF4444"
            sub={`${transactions.filter((t) => t.type === "expense").length} transactions`}
          />
        </Grid>
      </Grid>

      {/* Charts Row */}
      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        {/* Balance Trend */}
        <Grid item xs={12} md={7}>
          <Card sx={{ height: "100%" }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 0.5 }}>
                Monthly Trend
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>
                Income vs Expenses over time
              </Typography>
              <ResponsiveContainer width="100%" height={240}>
                <AreaChart data={monthlyData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#EF4444" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
                  <XAxis dataKey="month" tick={{ fontSize: 12, fill: theme.palette.text.secondary }} />
                  <YAxis
                    tick={{ fontSize: 11, fill: theme.palette.text.secondary }}
                    tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="income"
                    name="Income"
                    stroke="#10B981"
                    strokeWidth={2.5}
                    fill="url(#incomeGrad)"
                  />
                  <Area
                    type="monotone"
                    dataKey="expenses"
                    name="Expenses"
                    stroke="#EF4444"
                    strokeWidth={2.5}
                    fill="url(#expenseGrad)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Spending Breakdown */}
        <Grid item xs={12} md={5}>
          <Card sx={{ height: "100%" }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 0.5 }}>
                Spending Breakdown
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                By category
              </Typography>
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="45%"
                    innerRadius={60}
                    outerRadius={90}
                    dataKey="value"
                    paddingAngle={3}
                  >
                    {categoryData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(v) => fmt(v)}
                    contentStyle={{
                      background: theme.palette.background.paper,
                      border: `1px solid ${theme.palette.divider}`,
                      borderRadius: 8,
                    }}
                  />
                  <Legend
                    iconType="circle"
                    iconSize={8}
                    formatter={(v) => (
                      <span style={{ fontSize: 11, color: theme.palette.text.secondary }}>{v}</span>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Recent Transactions */}
      <Card>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Recent Transactions
          </Typography>
          {recent.length === 0 ? (
            <Typography color="text.secondary" textAlign="center" py={4}>
              No transactions yet.
            </Typography>
          ) : (
            recent.map((t, i) => (
              <Box key={t.id}>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    py: 1.5,
                    gap: 2,
                  }}
                >
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: 2,
                      bgcolor: t.type === "income" ? "#10B98118" : "#EF444418",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                      color: t.type === "income" ? "#10B981" : "#EF4444",
                    }}
                  >
                    {t.type === "income" ? <TrendingUpIcon fontSize="small" /> : <TrendingDownIcon fontSize="small" />}
                  </Box>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography variant="body2" fontWeight={600} noWrap>
                      {t.description}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {t.category} · {new Date(t.date).toLocaleDateString("en-IN")}
                    </Typography>
                  </Box>
                  <Typography
                    variant="body2"
                    fontWeight={700}
                    color={t.type === "income" ? "secondary.main" : "error.main"}
                  >
                    {t.type === "income" ? "+" : "-"}
                    {fmt(t.amount)}
                  </Typography>
                </Box>
                {i < recent.length - 1 && <Divider />}
              </Box>
            ))
          )}
        </CardContent>
      </Card>
    </Box>
  );
}

import React, { useMemo } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  LinearProgress,
  Chip,
  Divider,
  useTheme,
} from "@mui/material";
import EmojiObjectsIcon from "@mui/icons-material/EmojiObjects";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { useAppState } from "../context/AppStateContext";

const fmt = (n) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);

const COLORS = ["#2563EB", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#EC4899", "#14B8A6", "#F97316"];

export default function Insights({ role }) {
  const { transactions } = useAppState();
  const theme = useTheme();

  const expenses = transactions.filter((t) => t.type === "expense");
  const incomes = transactions.filter((t) => t.type === "income");

  // Category totals
  const categoryTotals = useMemo(() => {
    const cats = {};
    expenses.forEach((t) => {
      cats[t.category] = (cats[t.category] || 0) + t.amount;
    });
    return Object.entries(cats)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [expenses]);

  const totalExpenses = expenses.reduce((s, t) => s + t.amount, 0);
  const totalIncome = incomes.reduce((s, t) => s + t.amount, 0);
  const highestCategory = categoryTotals[0];

  // Monthly comparison (last 2 months)
  const monthlyComparison = useMemo(() => {
    const months = {};
    transactions.forEach((t) => {
      const d = new Date(t.date);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      const label = d.toLocaleString("en-IN", { month: "short", year: "2-digit" });
      if (!months[key]) months[key] = { key, label, income: 0, expenses: 0 };
      if (t.type === "income") months[key].income += t.amount;
      else months[key].expenses += t.amount;
    });
    return Object.values(months).sort((a, b) => b.key.localeCompare(a.key)).slice(0, 4).reverse();
  }, [transactions]);

  const lastTwo = monthlyComparison.slice(-2);
  const expenseChange =
    lastTwo.length === 2 && lastTwo[0].expenses > 0
      ? (((lastTwo[1].expenses - lastTwo[0].expenses) / lastTwo[0].expenses) * 100).toFixed(1)
      : null;

  const savingsRate = totalIncome > 0 ? (((totalIncome - totalExpenses) / totalIncome) * 100).toFixed(1) : 0;

  // Insights list
  const insights = useMemo(() => {
    const list = [];
    if (highestCategory) {
      list.push({
        icon: <WarningAmberIcon />,
        color: "#F59E0B",
        bgcolor: "#F59E0B18",
        title: "Top Spending Category",
        desc: `${highestCategory.name} accounts for ${((highestCategory.value / totalExpenses) * 100).toFixed(1)}% of your total expenses (${fmt(highestCategory.value)}).`,
      });
    }
    if (expenseChange !== null) {
      const up = parseFloat(expenseChange) > 0;
      list.push({
        icon: up ? <TrendingUpIcon /> : <TrendingDownIcon />,
        color: up ? "#EF4444" : "#10B981",
        bgcolor: up ? "#EF444418" : "#10B98118",
        title: "Monthly Expense Trend",
        desc: up
          ? `Your expenses increased by ${expenseChange}% compared to last month. Consider reviewing discretionary spending.`
          : `Great! Your expenses decreased by ${Math.abs(expenseChange)}% compared to last month.`,
      });
    }
    if (parseFloat(savingsRate) >= 20) {
      list.push({
        icon: <CheckCircleIcon />,
        color: "#10B981",
        bgcolor: "#10B98118",
        title: "Healthy Savings Rate",
        desc: `You're saving ${savingsRate}% of your income. That's above the recommended 20% benchmark!`,
      });
    } else if (parseFloat(savingsRate) < 10) {
      list.push({
        icon: <WarningAmberIcon />,
        color: "#EF4444",
        bgcolor: "#EF444418",
        title: "Low Savings Rate",
        desc: `Your savings rate is ${savingsRate}%. Try to aim for at least 20% by reducing non-essential expenses.`,
      });
    }
    list.push({
      icon: <EmojiObjectsIcon />,
      color: "#2563EB",
      bgcolor: "#2563EB18",
      title: "Diversified Income",
      desc:
        incomes.filter((t) => t.category !== "Salary").length > 0
          ? "You have income beyond your salary. Keep building multiple income streams for financial resilience."
          : "Currently you rely solely on salary income. Consider diversifying with freelance or investments.",
    });
    return list;
  }, [highestCategory, expenseChange, savingsRate, totalExpenses, incomes]);

  return (
    <Box>
      <Grid container spacing={2.5}>
        {/* Category Bar Chart */}
        <Grid item xs={12} md={7}>
          <Card>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 0.5 }}>
                Spending by Category
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>
                Total expense breakdown
              </Typography>
              {categoryTotals.length === 0 ? (
                <Typography color="text.secondary" textAlign="center" py={6}>
                  No expense data available.
                </Typography>
              ) : (
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={categoryTotals} layout="vertical" margin={{ left: 8, right: 16 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke={theme.palette.divider} />
                    <XAxis
                      type="number"
                      tick={{ fontSize: 11, fill: theme.palette.text.secondary }}
                      tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`}
                    />
                    <YAxis type="category" dataKey="name" tick={{ fontSize: 12, fill: theme.palette.text.primary }} width={90} />
                    <Tooltip
                      formatter={(v) => [fmt(v), "Amount"]}
                      contentStyle={{
                        background: theme.palette.background.paper,
                        border: `1px solid ${theme.palette.divider}`,
                        borderRadius: 8,
                      }}
                    />
                    <Bar dataKey="value" radius={[0, 6, 6, 0]}>
                      {categoryTotals.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Category % breakdown */}
        <Grid item xs={12} md={5}>
          <Card sx={{ height: "100%" }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 0.5 }}>
                Category Share
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>
                % of total expenses
              </Typography>
              {categoryTotals.length === 0 ? (
                <Typography color="text.secondary" textAlign="center" py={4}>
                  No data yet.
                </Typography>
              ) : (
                <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                  {categoryTotals.slice(0, 6).map((cat, i) => (
                    <Box key={cat.name}>
                      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
                        <Typography variant="body2" fontWeight={500}>
                          {cat.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {((cat.value / totalExpenses) * 100).toFixed(1)}%
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={(cat.value / totalExpenses) * 100}
                        sx={{
                          height: 6,
                          borderRadius: 3,
                          bgcolor: `${COLORS[i % COLORS.length]}20`,
                          "& .MuiLinearProgress-bar": {
                            bgcolor: COLORS[i % COLORS.length],
                            borderRadius: 3,
                          },
                        }}
                      />
                    </Box>
                  ))}
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Monthly Comparison */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 0.5 }}>
                Monthly Comparison
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>
                Income vs Expenses per month
              </Typography>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={monthlyComparison} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
                  <XAxis dataKey="label" tick={{ fontSize: 12, fill: theme.palette.text.secondary }} />
                  <YAxis
                    tick={{ fontSize: 11, fill: theme.palette.text.secondary }}
                    tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`}
                  />
                  <Tooltip
                    formatter={(v) => fmt(v)}
                    contentStyle={{
                      background: theme.palette.background.paper,
                      border: `1px solid ${theme.palette.divider}`,
                      borderRadius: 8,
                    }}
                  />
                  <Bar dataKey="income" name="Income" fill="#10B981" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="expenses" name="Expenses" fill="#EF4444" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Smart Insights */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: "100%" }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                <EmojiObjectsIcon color="warning" />
                <Typography variant="h6">Smart Insights</Typography>
              </Box>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                {insights.map((ins, i) => (
                  <Box key={i}>
                    <Box sx={{ display: "flex", gap: 1.5, alignItems: "flex-start" }}>
                      <Box
                        sx={{
                          width: 36,
                          height: 36,
                          borderRadius: 2,
                          bgcolor: ins.bgcolor,
                          color: ins.color,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                        }}
                      >
                        {ins.icon}
                      </Box>
                      <Box>
                        <Typography variant="body2" fontWeight={700}>
                          {ins.title}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.5 }}>
                          {ins.desc}
                        </Typography>
                      </Box>
                    </Box>
                    {i < insights.length - 1 && <Divider sx={{ mt: 1.5 }} />}
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}

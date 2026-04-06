import React, { useState, useMemo } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  Chip,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  InputAdornment,
  Tooltip,
  TablePagination,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import { useAppState } from "../context/AppStateContext";

const fmt = (n) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);

const EMPTY_FORM = { date: "", description: "", amount: "", category: "", type: "expense" };

export default function Transactions({ role }) {
  const { transactions, filters, setFilters, addTransaction, editTransaction, deleteTransaction, CATEGORIES } =
    useAppState();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const isAdmin = role === "admin";

  // Filtered & sorted transactions
  const filtered = useMemo(() => {
    let list = [...transactions];
    if (filters.search) {
      const q = filters.search.toLowerCase();
      list = list.filter(
        (t) =>
          t.description.toLowerCase().includes(q) ||
          t.category.toLowerCase().includes(q)
      );
    }
    if (filters.type !== "all") list = list.filter((t) => t.type === filters.type);
    if (filters.category !== "all") list = list.filter((t) => t.category === filters.category);

    switch (filters.sortBy) {
      case "date_desc": list.sort((a, b) => new Date(b.date) - new Date(a.date)); break;
      case "date_asc": list.sort((a, b) => new Date(a.date) - new Date(b.date)); break;
      case "amount_desc": list.sort((a, b) => b.amount - a.amount); break;
      case "amount_asc": list.sort((a, b) => a.amount - b.amount); break;
      default: break;
    }
    return list;
  }, [transactions, filters]);

  const paginated = filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const openAdd = () => {
    setEditId(null);
    setForm(EMPTY_FORM);
    setDialogOpen(true);
  };

  const openEdit = (t) => {
    setEditId(t.id);
    setForm({ date: t.date, description: t.description, amount: String(t.amount), category: t.category, type: t.type });
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!form.date || !form.description || !form.amount || !form.category) return;
    const tx = { ...form, amount: parseFloat(form.amount) };
    if (editId) editTransaction(editId, tx);
    else addTransaction(tx);
    setDialogOpen(false);
  };

  const handleExport = () => {
    const csv = [
      ["Date", "Description", "Category", "Type", "Amount"],
      ...filtered.map((t) => [t.date, t.description, t.category, t.type, t.amount]),
    ]
      .map((r) => r.join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "transactions.csv";
    a.click();
  };

  return (
    <Box>
      {/* Controls */}
      <Card sx={{ mb: 2.5 }}>
        <CardContent sx={{ p: 2.5 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                size="small"
                placeholder="Search transactions..."
                value={filters.search}
                onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon fontSize="small" color="action" />
                    </InputAdornment>
                  ),
                }}
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
              />
            </Grid>
            <Grid item xs={6} sm={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Type</InputLabel>
                <Select
                  value={filters.type}
                  label="Type"
                  onChange={(e) => setFilters((f) => ({ ...f, type: e.target.value }))}
                  sx={{ borderRadius: 2 }}
                >
                  <MenuItem value="all">All</MenuItem>
                  <MenuItem value="income">Income</MenuItem>
                  <MenuItem value="expense">Expense</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6} sm={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Category</InputLabel>
                <Select
                  value={filters.category}
                  label="Category"
                  onChange={(e) => setFilters((f) => ({ ...f, category: e.target.value }))}
                  sx={{ borderRadius: 2 }}
                >
                  <MenuItem value="all">All</MenuItem>
                  {CATEGORIES.map((c) => (
                    <MenuItem key={c} value={c}>
                      {c}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6} sm={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Sort By</InputLabel>
                <Select
                  value={filters.sortBy}
                  label="Sort By"
                  onChange={(e) => setFilters((f) => ({ ...f, sortBy: e.target.value }))}
                  sx={{ borderRadius: 2 }}
                >
                  <MenuItem value="date_desc">Newest First</MenuItem>
                  <MenuItem value="date_asc">Oldest First</MenuItem>
                  <MenuItem value="amount_desc">Highest Amount</MenuItem>
                  <MenuItem value="amount_asc">Lowest Amount</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6} sm={2} sx={{ display: "flex", gap: 1, justifyContent: "flex-end" }}>
              <Tooltip title="Export CSV">
                <IconButton onClick={handleExport} sx={{ border: "1px solid", borderColor: "divider", borderRadius: 2 }}>
                  <FileDownloadIcon />
                </IconButton>
              </Tooltip>
              {isAdmin && (
                <Button variant="contained" startIcon={<AddIcon />} onClick={openAdd} sx={{ borderRadius: 2, whiteSpace: "nowrap" }}>
                  Add
                </Button>
              )}
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Stats row */}
      <Box sx={{ display: "flex", gap: 1.5, mb: 2.5, flexWrap: "wrap" }}>
        <Chip label={`${filtered.length} transactions`} icon={<FilterListIcon />} />
        <Chip
          label={`Income: ${fmt(filtered.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0))}`}
          sx={{ bgcolor: "#10B98118", color: "#10B981", fontWeight: 700 }}
        />
        <Chip
          label={`Expenses: ${fmt(filtered.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0))}`}
          sx={{ bgcolor: "#EF444418", color: "#EF4444", fontWeight: 700 }}
        />
      </Box>

      {/* Table */}
      <Card>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ "& th": { fontWeight: 700, bgcolor: "background.default", fontSize: 12 } }}>
                <TableCell>Date</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Category</TableCell>
                <TableCell>Type</TableCell>
                <TableCell align="right">Amount</TableCell>
                {isAdmin && <TableCell align="center">Actions</TableCell>}
              </TableRow>
            </TableHead>
            <TableBody>
              {paginated.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 6, color: "text.secondary" }}>
                    No transactions found. Try adjusting your filters.
                  </TableCell>
                </TableRow>
              ) : (
                paginated.map((t) => (
                  <TableRow
                    key={t.id}
                    hover
                    sx={{ "&:last-child td": { border: 0 } }}
                  >
                    <TableCell sx={{ color: "text.secondary", fontSize: 13, whiteSpace: "nowrap" }}>
                      {new Date(t.date).toLocaleDateString("en-IN")}
                    </TableCell>
                    <TableCell sx={{ fontWeight: 500 }}>{t.description}</TableCell>
                    <TableCell>
                      <Chip label={t.category} size="small" sx={{ fontSize: 11, height: 22 }} />
                    </TableCell>
                    <TableCell>
                      <Chip
                        icon={
                          t.type === "income" ? (
                            <TrendingUpIcon style={{ fontSize: 13 }} />
                          ) : (
                            <TrendingDownIcon style={{ fontSize: 13 }} />
                          )
                        }
                        label={t.type === "income" ? "Income" : "Expense"}
                        size="small"
                        sx={{
                          fontSize: 11,
                          height: 22,
                          bgcolor: t.type === "income" ? "#10B98118" : "#EF444418",
                          color: t.type === "income" ? "#10B981" : "#EF4444",
                          "& .MuiChip-icon": { color: "inherit" },
                        }}
                      />
                    </TableCell>
                    <TableCell
                      align="right"
                      sx={{
                        fontWeight: 700,
                        color: t.type === "income" ? "#10B981" : "#EF4444",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {t.type === "income" ? "+" : "-"}
                      {fmt(t.amount)}
                    </TableCell>
                    {isAdmin && (
                      <TableCell align="center">
                        <Box sx={{ display: "flex", gap: 0.5, justifyContent: "center" }}>
                          <Tooltip title="Edit">
                            <IconButton size="small" onClick={() => openEdit(t)} color="primary">
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete">
                            <IconButton size="small" onClick={() => deleteTransaction(t.id)} color="error">
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    )}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          component="div"
          count={filtered.length}
          page={page}
          onPageChange={(_, p) => setPage(p)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
          rowsPerPageOptions={[5, 10, 25]}
        />
      </Card>

      {/* Add / Edit Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="xs" fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ fontWeight: 700 }}>{editId ? "Edit Transaction" : "Add Transaction"}</DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          <Grid container spacing={2} sx={{ mt: 0 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth size="small" label="Description" value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth size="small" label="Amount" type="number" value={form.amount}
                onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
                InputProps={{ startAdornment: <InputAdornment position="start">₹</InputAdornment> }}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth size="small" label="Date" type="date" value={form.date}
                onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={6}>
              <FormControl fullWidth size="small">
                <InputLabel>Type</InputLabel>
                <Select value={form.type} label="Type" onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}>
                  <MenuItem value="income">Income</MenuItem>
                  <MenuItem value="expense">Expense</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6}>
              <FormControl fullWidth size="small">
                <InputLabel>Category</InputLabel>
                <Select value={form.category} label="Category" onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}>
                  {CATEGORIES.map((c) => <MenuItem key={c} value={c}>{c}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
          <Button onClick={() => setDialogOpen(false)} sx={{ borderRadius: 2 }}>Cancel</Button>
          <Button variant="contained" onClick={handleSave} sx={{ borderRadius: 2 }}>
            {editId ? "Save Changes" : "Add Transaction"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

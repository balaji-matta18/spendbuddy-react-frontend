import { Navbar } from "@/components/Navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart as PieChartIcon, BarChart2, Wallet } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { PieChart, Pie, BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell, Legend, Tooltip } from "recharts";
import { useEffect, useState } from "react";
import { reportsApi } from "@/api/reports";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { saveAs } from "file-saver";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const COLORS = [
  "hsl(var(--primary))",
  "hsl(var(--secondary))",
  "hsl(var(--accent))",
  "hsl(var(--success))",
  "hsl(var(--destructive))"
];

const Reports = () => {
  const [categoryData, setCategoryData] = useState<{ label: string; value: number }[]>([]);
  const [monthlyData, setMonthlyData] = useState<{ label: string; value: number }[]>([]);
  const [paymentData, setPaymentData] = useState<{ label: string; value: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState<"3m" | "6m" | "all">("6m");

  // Fetch all 3 reports
  const fetchReports = async (selectedRange: string) => {
    setLoading(true);
    try {
      const [catRes, monthRes, payRes] = await Promise.all([
        reportsApi.getExpenseByCategory(selectedRange),
        reportsApi.getMonthlySummary(selectedRange),
        reportsApi.getPaymentTypeSummary(selectedRange)
      ]);
      setCategoryData(catRes || []);
      setMonthlyData(monthRes || []);
      setPaymentData(payRes || []);
    } catch (err) {
      console.error("Error fetching reports:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports(range);
  }, [range]);

  // Compute trend line
  const totalThisMonth = monthlyData.at(-1)?.value || 0;
  const lastMonth = monthlyData.length > 1 ? monthlyData.at(-2)?.value || 0 : 0;

  const trend =
    lastMonth === 0
      ? "same from last month"
      : totalThisMonth > lastMonth
      ? `${(((totalThisMonth - lastMonth) / lastMonth) * 100).toFixed(1)}% more`
      : `${(((lastMonth - totalThisMonth) / lastMonth) * 100).toFixed(1)}% less`;

  const trendColor =
    totalThisMonth > lastMonth
      ? "text-destructive font-medium"
      : totalThisMonth < lastMonth
      ? "text-success font-medium"
      : "text-muted-foreground font-medium";

  // ---------------- EXPORT HELPERS ----------------
  const exportCSV = () => {
    let csv = "Report Type,Label,Value\n";

    csv += "\nExpense by Category\n";
    categoryData.forEach(c => {
      csv += `Category,${c.label},${c.value}\n`;
    });

    csv += "\nMonthly Summary\n";
    monthlyData.forEach(m => {
      csv += `Month,${m.label},${m.value}\n`;
    });

    csv += "\nPayment Type Summary\n";
    paymentData.forEach(p => {
      csv += `Payment Type,${p.label},${p.value}\n`;
    });

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, `SpendBuddy_Report_${range.toUpperCase()}.csv`);
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("SpendBuddy Financial Report", 14, 20);
    doc.setFontSize(11);
    doc.text(`Range: ${range.toUpperCase()} | Generated: ${new Date().toLocaleString()}`, 14, 28);
    doc.setFontSize(12);
    doc.text(
      `Summary: You spent ₹${totalThisMonth.toFixed(2)} this month — ${trend}.`,
      14,
      36
    );

    // Category Table
    doc.text("Expense by Category", 14, 46);
    autoTable(doc, {
      startY: 50,
      head: [["Category", "Amount"]],
      body: categoryData.map((c) => [c.label, `₹${c.value.toFixed(2)}`]),
    });

    // Monthly Table
    const pos1 = doc.lastAutoTable.finalY + 10;
    doc.text("Monthly Summary", 14, pos1);
    autoTable(doc, {
      startY: pos1 + 4,
      head: [["Month", "Amount"]],
      body: monthlyData.map((m) => [m.label, `₹${m.value.toFixed(2)}`]),
    });

    // Payment Table
    const pos2 = doc.lastAutoTable.finalY + 10;
    doc.text("Payment Type Summary", 14, pos2);
    autoTable(doc, {
      startY: pos2 + 4,
      head: [["Payment Type", "Amount"]],
      body: paymentData.map((p) => [p.label, `₹${p.value.toFixed(2)}`]),
    });

    doc.save(`SpendBuddy_Report_${range.toUpperCase()}.pdf`);
  };

  // ------------------------------------------------

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 animate-fade-in">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-2">
              Financial Reports
            </h1>
            <p className="text-muted-foreground">
              Comprehensive overview of your financial activity
            </p>
          </div>

          {/* ✅ Range Selector + Export Buttons */}
          <div className="flex items-center gap-3">
            <Select onValueChange={(val) => setRange(val as "3m" | "6m" | "all")} defaultValue={range}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Select range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="3m">Last 3 Months</SelectItem>
                <SelectItem value="6m">Last 6 Months</SelectItem>
                <SelectItem value="all">All Time</SelectItem>
              </SelectContent>
            </Select>

            <button
              onClick={exportCSV}
              className="px-3 py-2 text-sm rounded-md border border-border hover:bg-muted transition-colors"
            >
              Export CSV
            </button>

            <button
              onClick={exportPDF}
              className="px-3 py-2 text-sm rounded-md border border-border hover:bg-muted transition-colors"
            >
              Export PDF
            </button>
          </div>
        </div>

        {/* Spending Insight */}
        <div className="mb-8 p-4 rounded-lg bg-card border border-border animate-fade-in">
          {loading ? (
            <Skeleton className="h-6 w-full max-w-md" />
          ) : (
            <p className="text-foreground">
              You spent{" "}
              <span className="font-semibold text-primary">
                ₹{totalThisMonth.toFixed(2)}
              </span>{" "}
              this month —{" "}
              <span className={trendColor}>{trend}</span>.
            </p>
          )}
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
          {/* Expense by Category */}
          <Card className="animate-fade-in transition-all duration-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <PieChartIcon className="h-5 w-5 text-primary" />
                Expense by Category
              </CardTitle>
              <CardDescription>Distribution of spending across categories</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-[250px] w-full" />
              ) : categoryData.length > 0 ? (
                <>
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={categoryData}
                        dataKey="value"
                        nameKey="label"
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        label={({ label, percent }) => `${label} ${(percent * 100).toFixed(0)}%`}
                      >
                        {categoryData.map((entry, index) => (
                          <Cell key={index} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value: number) => `₹${value.toFixed(2)}`} />
                    </PieChart>
                  </ResponsiveContainer>
                  <p className="text-sm text-muted-foreground mt-4 text-center">
                    Top category: {categoryData[0]?.label} (₹{categoryData[0]?.value.toFixed(2)})
                  </p>
                </>
              ) : (
                <div className="h-[250px] flex items-center justify-center text-muted-foreground">
                  No expense data available
                </div>
              )}
            </CardContent>
          </Card>

          {/* Monthly Trend */}
          <Card className="animate-fade-in transition-all duration-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <BarChart2 className="h-5 w-5 text-primary" />
                Monthly Trend
              </CardTitle>
              <CardDescription>Spending pattern over time</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-[250px] w-full" />
              ) : monthlyData.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={monthlyData}>
                    <XAxis dataKey="label" stroke="hsl(var(--muted-foreground))" />
                    <YAxis stroke="hsl(var(--muted-foreground))" />
                    <Tooltip formatter={(v: number) => `₹${v.toFixed(2)}`} />
                    <Bar dataKey="value" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[250px] flex items-center justify-center text-muted-foreground">
                  No monthly data available
                </div>
              )}
            </CardContent>
          </Card>

          {/* Payment Methods */}
          <Card className="animate-fade-in transition-all duration-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Wallet className="h-5 w-5 text-primary" />
                Payment Methods
              </CardTitle>
              <CardDescription>Breakdown by payment type</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-[250px] w-full" />
              ) : paymentData.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={paymentData}
                      dataKey="value"
                      nameKey="label"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                    >
                      {paymentData.map((entry, index) => (
                        <Cell key={index} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v: number) => `₹${v.toFixed(2)}`} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[250px] flex items-center justify-center text-muted-foreground">
                  No payment data available
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Reports;

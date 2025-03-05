import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableHeader,
  TableRow,
  TableCell,
  TableBody,
} from "@/components/ui/table";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import LayoutMap from "./plot-overview/LayoutMap";

export default function Dashboard() {
  const stats = {
    totalPlots: 100,
    soldPlots: 60,
    availablePlots: 40,
    revenue: "$1.2M",
  };

  const transactions = [
    {
      id: 1,
      buyer: "John Doe",
      plot: "23",
      amount: "$50,000",
      date: "2025-03-01",
    },
    {
      id: 2,
      buyer: "Jane Smith",
      plot: "13",
      amount: "$75,000",
      date: "2025-03-02",
    },
  ];

  const salesData = [
    { month: "Jan", sales: 10 },
    { month: "Feb", sales: 15 },
    { month: "Mar", sales: 20 },
  ];

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <div className="grid grid-cols-4 gap-4">
        {Object.entries(stats).map(([key, value]) => (
          <Card key={key} className="p-4 shadow-md">
            <CardContent>
              <h2 className="text-lg font-semibold capitalize">
                {key.replace(/([A-Z])/g, " $1")}
              </h2>
              <p className="text-xl font-bold">{value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="p-4">
        <CardContent>
          <h2 className="text-lg font-semibold mb-4">Sales Analytics</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={salesData}>
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="sales" fill="#4F46E5" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="p-4">
        <CardContent>
          <h2 className="text-lg font-semibold mb-4">Recent Transactions</h2>
          <Table>
            <TableHeader>
              <TableRow>
                <TableCell>Buyer</TableCell>
                <TableCell>Plot</TableCell>
                <TableCell>Amount</TableCell>
                <TableCell>Date</TableCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map((tx) => (
                <TableRow key={tx.id}>
                  <TableCell>{tx.buyer}</TableCell>
                  <TableCell>{tx.plot}</TableCell>
                  <TableCell>{tx.amount}</TableCell>
                  <TableCell>{tx.date}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

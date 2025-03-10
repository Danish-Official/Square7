import { useState } from "react";
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
import { Link } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";

export default function Dashboard() {
  const [selectedDate, setSelectedDate] = useState(null);
  const [dialogIsOpen, setDialogIsOpen] = useState(false);

  const stats = {
    totalPlots: 100,
    soldPlots: 60,
    availablePlots: 40,
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
    { month: "Apr", sales: 25 },
    { month: "May", sales: 30 },
    { month: "Jun", sales: 35 },
    { month: "Jul", sales: 40 },
    { month: "Aug", sales: 45 },
    { month: "Sep", sales: 50 },
    { month: "Oct", sales: 55 },
    { month: "Nov", sales: 60 },
    { month: "Dec", sales: 65 },
  ];

  const handleDateClick = (date) => {
    setSelectedDate(date);
    setDialogIsOpen(true);
  };

  const closeDialog = () => {
    setDialogIsOpen(false);
    setSelectedDate(null);
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <div className="grid grid-cols-4 gap-4">
        <Card className="p-4 shadow-md flex items-center justify-center">
          <CardContent>
            <Link to="/new-booking">
              <Button className="text-xl font-semibold capitalize py-3 px-6 w-11/12 h-11/12">
                new booking
              </Button>
            </Link>
          </CardContent>
        </Card>
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

      <div className="grid grid-cols-2 gap-4">
        <Card className="p-4">
          <CardContent>
            <h2 className="text-lg font-semibold mb-4">Sales Analytics</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={salesData}>
                <XAxis dataKey="month" axisLine={false} tickLine={false} />
                <YAxis hide={true} />
                <Tooltip />
                <Bar dataKey="sales" fill="#ADD8E6" radius={[10, 10, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="p-4 flex items-center justify-center">
          <CardContent>
            <h2 className="text-lg font-semibold mb-4 text-center">Calendar</h2>
            <Calendar onSelect={handleDateClick} />
          </CardContent>
        </Card>
      </div>

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

      <Dialog open={dialogIsOpen} onOpenChange={setDialogIsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Buyer Details</DialogTitle>
          </DialogHeader>
          {selectedDate && (
            <div>
              <p>Date: {selectedDate.toDateString()}</p>
              {/* Add buyer details here */}
            </div>
          )}
          <Button onClick={closeDialog}>Close</Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}

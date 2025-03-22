import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate
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
import { FilePlus } from "lucide-react";
import Login from "../components/Login";

export default function Dashboard() {
  const [selectedDate, setSelectedDate] = useState(null);
  const [dialogIsOpen, setDialogIsOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(true); // Open modal by default
  const navigate = useNavigate(); // Initialize navigate

  useEffect(() => {
    console.log("Selected Date:", selectedDate);
  }, [selectedDate]);

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
      contactNo: "123-456-7890",
      invoiceNo: "INV-001",
    },
    {
      id: 2,
      buyer: "Jane Smith",
      plot: "13",
      amount: "$75,000",
      date: "2025-03-02",
      contactNo: "987-654-3210",
      invoiceNo: "INV-002",
    },
    {
      id: 2,
      buyer: "Jane Smith",
      plot: "13",
      amount: "$75,000",
      date: "2025-03-02",
      contactNo: "987-654-3210",
      invoiceNo: "INV-002",
    },
    {
      id: 2,
      buyer: "Jane Smith",
      plot: "13",
      amount: "$75,000",
      date: "2025-03-02",
      contactNo: "987-654-3210",
      invoiceNo: "INV-002",
    },
    {
      id: 2,
      buyer: "Jane Smith",
      plot: "13",
      amount: "$75,000",
      date: "2025-03-02",
      contactNo: "987-654-3210",
      invoiceNo: "INV-002",
    },
  ];

  const revenueData = [
    { month: "Jan", revenue: 10000 },
    { month: "Feb", revenue: 15000 },
    { month: "Mar", revenue: 50000 },
    { month: "Apr", revenue: 25000 },
    { month: "May", revenue: 30000 },
    { month: "Jun", revenue: 35000 },
    { month: "Jul", revenue: 20000 },
    { month: "Aug", revenue: 45000 },
    { month: "Sep", revenue: 60000 },
    { month: "Oct", revenue: 55000 },
    { month: "Nov", revenue: 28000 },
    { month: "Dec", revenue: 65000 },
  ];

  const handleDateClick = (date) => {
    setSelectedDate(date);
    setDialogIsOpen(true);
  };

  const closeDialog = () => {
    setDialogIsOpen(false);
    setSelectedDate(null);
  };

  const closeLoginModal = () => {
    setIsLoginModalOpen(false);
    navigate("/"); // Redirect to dashboard/home page after login
  };

  return (
    <div className={`p-6 space-y-6 ${isLoginModalOpen ? "blur-sm" : ""}`}>
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
        <Link to="/new-booking">
          <Button
            className="text-xl font-semibold capitalize w-full h-full cursor-pointer hover:bg-[#5266A4]"
            style={{
              background: "linear-gradient(to bottom, #1F263E, #5266A4)",
            }}
          >
            new booking
            <FilePlus size={40} />
          </Button>
        </Link>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2 p-4">
          <CardContent>
            <h2 className="text-lg font-semibold mb-4">Sales Analytics</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={revenueData}>
                <XAxis
                  dataKey="month"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, angle: -45 }}
                />
                <YAxis hide={true} />
                <Tooltip />
                <Bar dataKey="revenue" fill="#ADD8E6" radius={[10, 10, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={(date) => handleDateClick(date)}
            className="flex justify-center"
          />
        </Card>
      </div>

      <Card className="p-4">
        <CardContent>
          <h2 className="text-lg font-semibold mb-4">Recent Contacts</h2>
          <Table>
            <TableHeader>
              <TableRow>
                <TableCell className="font-bold">Name</TableCell>
                <TableCell className="font-bold">Contact No.</TableCell>
                <TableCell className="font-bold">Booking Date</TableCell>
                <TableCell className="font-bold">Plot No.</TableCell>
                <TableCell className="font-bold">Invoice No.</TableCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map((tx) => (
                <TableRow key={tx.id}>
                  <TableCell>{tx.buyer}</TableCell>
                  <TableCell>{tx.contactNo}</TableCell>
                  <TableCell>{tx.date}</TableCell>
                  <TableCell>{tx.plot}</TableCell>
                  <TableCell>{tx.invoiceNo}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isLoginModalOpen}>
        <DialogContent hideClose={true}>
          <DialogHeader>
            <DialogTitle>Login</DialogTitle>
          </DialogHeader>
          <Login onClose={closeLoginModal} />
        </DialogContent>
      </Dialog>

      <Dialog open={dialogIsOpen} onOpenChange={setDialogIsOpen}>
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
      </Dialog>
    </div>
  );
}

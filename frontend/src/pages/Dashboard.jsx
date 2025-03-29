import { useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode"; // Import jwt-decode to validate token
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
import { useAuth } from "@/context/AuthContext";
import { useBuyers } from "@/context/BuyersContext";
import "../styles/dashboard.scss"; // Import your CSS file for styling

export default function Dashboard() {
  const [selectedDate, setSelectedDate] = useState(null);
  const [dialogIsOpen, setDialogIsOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false); // Default to false
  const [manualLogout, setManualLogout] = useState(false); // Track manual logout
  const { auth } = useAuth(); // Access auth from context
  const { buyers } = useBuyers();
  const recentBuyers = buyers.slice(-5).reverse();

  useEffect(() => {
    if (!auth.token || auth.token === "" || isTokenExpired(auth.token)) {
      if (!manualLogout) {
        setIsLoginModalOpen(true); // Open login modal if token is invalid, empty, or expired
      }
    }
  }, [auth.token, manualLogout]); // Depend on manualLogout

  const isTokenExpired = (token) => {
    try {
      const { exp } = jwtDecode(token); // Decode token to get expiration time
      return Date.now() >= exp * 1000; // Check if token is expired
      // eslint-disable-next-line no-unused-vars
    } catch (error) {
      return true; // Treat invalid tokens as expired
    }
  };

  const stats = {
    totalPlots: 100,
    soldPlots: 60,
    availablePlots: 40,
  };

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

  // Removed unused closeLoginModal function to resolve the error

  return (
    <div className={`p-6 space-y-6 ${isLoginModalOpen ? "blur-sm" : ""}`}>
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
        {Object.entries(stats).map(([key, value]) => (
          <Card key={key} className="p-4 shadow-md">
            <CardContent>
              <h2 className="text-lg capitalize font-light font-oxygen">
                {key.replace(/([A-Z])/g, " $1")}
              </h2>
              <p className="text-xl font-bold font-philosopher">{value}</p>
            </CardContent>
          </Card>
        ))}
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
                <TableCell className="font-bold">Plot No.</TableCell>
                <TableCell className="font-bold">Booking Date</TableCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentBuyers.map((buyer) => (
                <TableRow key={buyer._id}>
                  <TableCell>{buyer.buyerName}</TableCell>
                  <TableCell>{buyer.phoneNumber}</TableCell>
                  <TableCell>{buyer.plot.plotNumber}</TableCell>
                  <TableCell>{buyer.plot.createdAt}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isLoginModalOpen}>
        <DialogContent hideClose={true} className="sm:max-w-[650px]">
          {!manualLogout && isTokenExpired(auth.token) && (
            <p className="text-red-500 mb-4 text-center">
              Session expired. Please login again.
            </p>
          )}
          {/* Show message only if token is expired and not manually logged out */}
          <Login
            onClose={() => {
              setIsLoginModalOpen(false);
              setManualLogout(false); // Reset manualLogout flag after login
            }}
          />
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

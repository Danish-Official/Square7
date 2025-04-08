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
import { apiClient } from "@/lib/utils"; // Import API client

export default function Dashboard({ showLoginModal = false }) {
  const [selectedDate, setSelectedDate] = useState(null);
  const [dialogIsOpen, setDialogIsOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(showLoginModal); // Initialize with prop value
  const { auth } = useAuth(); // Access auth from context
  const { buyers } = useBuyers();
  const recentBuyers = buyers.slice(-5).reverse();
  const [stats, setStats] = useState({
    totalPlots: 0,
    soldPlots: 0,
    availablePlots: 0,
  });
  const [revenueData, setRevenueData] = useState([]);

  useEffect(() => {
    if (!auth.token || auth.token === "" || isTokenExpired(auth.token)) {
      setIsLoginModalOpen(true); // Open login modal if token is invalid, empty, or expired
    }
  }, [auth.token]); // Depend on manualLogout

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await apiClient.get("/plots/stats");
        setStats(data);
      } catch (error) {
        // Silent failure, stats will remain at default values
      }
    };

    if (auth.token) {
      fetchStats(); // Fetch stats when token is available
    }
  }, [auth.token]);

  useEffect(() => {
    const fetchRevenueData = async () => {
      try {
        const { data } = await apiClient.get("/invoices/revenue");
        const formattedData = data.map((item) => ({
          month: new Date(0, item.month - 1).toLocaleString("default", {
            month: "short",
          }),
          revenue: item.totalRevenue,
        }));
        setRevenueData(formattedData);
      } catch (error) {
        // Silent failure, revenue data will remain empty
      }
    };

    if (auth.token) {
      fetchRevenueData();
    }
  }, [auth.token]);

  const isTokenExpired = (token) => {
    try {
      const { exp } = jwtDecode(token); // Decode token to get expiration time
      return Date.now() >= exp * 1000; // Check if token is expired
      // eslint-disable-next-line no-unused-vars
    } catch (error) {
      return true; // Treat invalid tokens as expired
    }
  };

  const handleDateClick = (date) => {
    setSelectedDate(date);
    setDialogIsOpen(true);
  };

  const closeDialog = () => {
    setDialogIsOpen(false);
    setSelectedDate(null);
  };

  const getBuyerDetailsByDate = (date) => {
    return buyers.find(
      (buyer) =>
        new Date(buyer.bookingDate).toDateString() === date.toDateString()
    );
  };

  const isBuyerPresentOnDate = (date) => {
    return buyers.some(
      (buyer) =>
        new Date(buyer.bookingDate).toDateString() === date.toDateString()
    );
  };

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
            onSelect={(date) => {
              if (isBuyerPresentOnDate(date)) {
                handleDateClick(date);
              }
            }}
            modifiers={{
              hasBuyer: (date) => isBuyerPresentOnDate(date),
            }}
            modifiersClassNames={{
              hasBuyer: "bg-green-500 rounded-full",
            }}
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
                  <TableCell>
                    {new Date(buyer.bookingDate).toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isLoginModalOpen}>
        <DialogContent className="sm:max-w-[650px]">
          {isTokenExpired(auth.token) && (
            <p className="text-red-500 mb-4 text-center">
              Session expired. Please login again.
            </p>
          )}
          <Login
            onClose={() => {
              setIsLoginModalOpen(false); // Close the modal after login
            }}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={dialogIsOpen} onOpenChange={setDialogIsOpen}>
        <DialogContent className="flex flex-col items-center justify-center">
          <DialogHeader>
            <DialogTitle>Buyer Details</DialogTitle>
          </DialogHeader>
          {selectedDate &&
            (() => {
              const buyerDetails = getBuyerDetailsByDate(selectedDate);
              return buyerDetails ? (
                <div className="space-y-4">
                  <p className="text-lg">Name: {buyerDetails.buyerName}</p>
                  <p className="text-lg">
                    Contact No.: {buyerDetails.phoneNumber}
                  </p>
                  <p className="text-lg">
                    Plot No.: {buyerDetails.plot.plotNumber}
                  </p>
                </div>
              ) : null;
            })()}
          <Button onClick={closeDialog}>Close</Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}

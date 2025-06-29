import { useState, useEffect } from "react";
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
import { Bookmark } from "lucide-react";
import Login from "../components/Login";
import { useAuth } from "@/context/AuthContext";
import { useBuyers } from "@/context/BuyersContext";
import { useLayout } from "@/context/LayoutContext";
import { apiClient } from "@/lib/utils";
import { toast } from "react-toastify";
import LayoutSelectionModal from "@/components/LayoutSelectionModal";
import { Calendar } from "@/components/ui/calendar";
import dayjs from 'dayjs';
import "../styles/dashboard.scss";
import { set } from "date-fns";

// Add this cache at the top, outside component
const buyersCache = new Map();

export default function Dashboard({ showLoginModal = false }) {
  const [selectedDate, setSelectedDate] = useState(null);
  const [dialogIsOpen, setDialogIsOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(showLoginModal);
  const { auth, isTokenExpired } = useAuth();
  const { buyers } = useBuyers();
  const { selectedLayout, showLayoutModal, setShowLayoutModal } = useLayout();
  const recentBuyers = buyers
    .filter((buyer) => buyer.plot.layoutId === selectedLayout)
    .slice(0, 5);

  const [layoutRevenueData, setLayoutRevenueData] = useState({});
  const [visibleDate, setVisibleDate] = useState(() => dayjs());
  const [_selectedMonth, setSelectedMonth] = useState(() => dayjs().month());
  const [plotStats, setPlotStats] = useState({ total: 0, sold: 0, available: 0 });
  const [bookedDatesSet, setBookedDatesSet] = useState(new Set());

  useEffect(() => {
    if (!auth.token || auth.token === "" || isTokenExpired(auth.token)) {
      setIsLoginModalOpen(true);
    }
  }, [auth.token, isTokenExpired]);

  useEffect(() => {
    if (!auth.token || isTokenExpired(auth.token) || !selectedLayout) return;

    const fetchData = async () => {
      try {
        const [stats, revenueResponse] = await Promise.all([
          apiClient.get(`/plots/stats/${selectedLayout}`),
          apiClient.get(`/invoices/revenue/${selectedLayout}`),
        ]);

        setPlotStats(stats.data);

        const formattedData = revenueResponse.data.map((item) => ({
          month: new Date(0, item.month - 1).toLocaleString("default", {
            month: "short",
          }),
          revenue: item.totalRevenue || 0,
        }));

        setLayoutRevenueData((prev) => ({
          ...prev,
          [selectedLayout]: formattedData,
        }));
      } catch (error) {
        console.error("Dashboard data fetch error:", error);
        toast.error("Failed to fetch dashboard data");
      }
    };

    fetchData();
  }, [auth.token, isTokenExpired, selectedLayout]);

  useEffect(() => {
    if (!selectedLayout) {
      setShowLayoutModal(true);
    }
  }, [selectedLayout, setShowLayoutModal]);

  useEffect(() => {
    // Build a set of booked date strings (YYYY-MM-DD) for the selected layout
    if (buyers && selectedLayout) {
      const bookedSet = new Set(
        buyers
          .filter(buyer => buyer.plot.layoutId === selectedLayout && buyer.bookingDate)
          .map(buyer => dayjs(buyer.bookingDate).format('YYYY-MM-DD'))
      );
      setBookedDatesSet(bookedSet);
      // Optionally update buyersCache for isBuyerPresentOnDate
      buyersCache.set(selectedLayout, bookedSet);
    }
  }, [buyers, selectedLayout]);

  const handleDateClick = (date) => {
    if (date && isBuyerPresentOnDate(date)) {
      setSelectedDate(date);
      setDialogIsOpen(true);
    }
  };

  const closeDialog = () => {
    setDialogIsOpen(false);
    setSelectedDate(null);
  };

  const getBuyerDetailsByDate = (date) => {
    if (!date || !Array.isArray(buyers)) return [];

    return buyers.filter((buyer) => {
      try {
        const buyerDate = new Date(buyer.bookingDate);
        // Normalize dates to compare only year, month, and day
        return (
          buyer.plot.layoutId === selectedLayout &&
          buyerDate.getFullYear() === date.getFullYear() &&
          buyerDate.getMonth() === date.getMonth() &&
          buyerDate.getDate() === date.getDate()
        );
      } catch (error) {
        console.error("Date parsing error:", error);
        return false;
      }
    });
  };

  const isBuyerPresentOnDate = (date) => {
    if (!date || !selectedLayout) return false;
    try {
      const cache = buyersCache.get(selectedLayout);
      if (!cache) return false;

      const dateStr = dayjs(date).format('YYYY-MM-DD');
      return cache.has(dateStr);
    } catch (error) {
      console.error("Date validation error:", error);
      return false;
    }
  };

  const handleMonthChange = (date) => {
    setSelectedMonth(date.month());
    setVisibleDate(date);
  };

  // --- Add: shouldHighlightDate function for Calendar ---
  const shouldHighlightDate = (date) => {
    if (!date || !selectedLayout) return false;
    const dateStr = dayjs(date).format('YYYY-MM-DD');
    return bookedDatesSet.has(dateStr);
  };
  // --- End add ---

  return (
    <>
      <div className={`p-6 space-y-6 ${isLoginModalOpen || showLayoutModal ? "blur-sm" : ""}`}>
        <h1 className="text-3xl font-semibold">Dashboard</h1>
        <div className="grid grid-cols-4 gap-2 lg:text-4xl sm:text-2xl">
          <div className="col-span-2 row-span-2 quickLinks bookingLink bg-[#1F263E] text-white">
            <Link to={'/plot-management'}>Booking</Link>
          </div>
          <div className="quickLinks bg-[#E9EAEE] text-black">
            <Link to={'/plot-management'}>Total Plots {plotStats.total}</Link>
          </div>
          {auth.user?.role === "superadmin" && (
            <div className="quickLinks bg-[#8AC0F6] text-black">
              <Link to={'/layout-resources'}>Layout Resources</Link>
            </div>
          )}
          <div className="quickLinks bg-[#D1D8E0] text-black">
            <Link to={'/enquiries'}>Enquiries</Link>
          </div>
          {auth.user?.role === "superadmin" && (
            <div className="quickLinks bg-[#727588] text-white">
              <Link to={'/expenses'}>Expenses</Link>
            </div>
          )}
          <div className="quickLinks bg-[#01318D] text-white">
            <Link to={'/invoices'}>Invoices</Link>
          </div>
          <div className="quickLinks bg-[#D6E1F5] text-black">
            <Link to={'/contact-list'}>Buyers</Link>
          </div>
          <div className="quickLinks bg-[#485464] text-white">
            <Link to={'/brokers'}>Advisors</Link>
          </div>
          {auth.user?.role === "superadmin" && (
            <div className="quickLinks bg-[#3E4C68] text-white">
              <Link to={'/user-management'}>Manage Users</Link>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <Card className="lg:col-span-2 p-4">
            <CardContent>
              <h2 className="text-lg font-semibold mb-4">Sales Analytics</h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={selectedLayout ? layoutRevenueData[selectedLayout] : []}
                >
                  <XAxis
                    dataKey="month"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, angle: -45 }}
                  />
                  <YAxis hide={true} />
                  <Tooltip />
                  <Bar dataKey="revenue" fill="#8AC0F6" radius={[10, 10, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          <Card>
            <Calendar
              value={visibleDate}
              onChange={(date) => handleDateClick(date.toDate())}
              shouldDisableDate={(date) => !isBuyerPresentOnDate(date)}
              shouldHighlightDate={shouldHighlightDate} // <-- pass highlight function
              minDate={dayjs('2010-01-01')}
              maxDate={dayjs('2040-12-31')}
              onMonthChange={handleMonthChange}
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
      </div>

      <LayoutSelectionModal
        open={showLayoutModal}
        onClose={() => setShowLayoutModal(false)}
      />

      <Dialog open={isLoginModalOpen}>
        <DialogContent className="sm:max-w-[650px]">
          {isTokenExpired(auth.token) && (
            <p className="text-red-500 mb-4 text-center">
              Session expired. Please login again.
            </p>
          )}
          <Login
            onClose={() => {
              setIsLoginModalOpen(false);
              refetchBuyers();
            }}
          />
        </DialogContent>
      </Dialog>

      <Dialog
        open={dialogIsOpen}
        onOpenChange={(open) => {
          if (!open) {
            closeDialog();
          }
        }}
      >
        <DialogContent className="max-w-[500px] max-h-[80vh] overflow-y-auto p-6 bg-white rounded-xl">
          <DialogHeader className="space-y-3 mb-6">
            <DialogTitle className="text-2xl font-semibold text-[#1F263E]">
              Buyer Details
            </DialogTitle>
            <p className="text-gray-500 text-sm font-normal">
              Bookings for {selectedDate?.toLocaleDateString()}
            </p>
          </DialogHeader>
          {selectedDate &&
            (() => {
              const buyersForDate = getBuyerDetailsByDate(selectedDate);
              return buyersForDate.length > 0 ? (
                <div className="pr-2">
                  {buyersForDate.map((buyer, index) => (
                    <div
                      key={buyer._id}
                      className={`grid gap-4 ${index !== buyersForDate.length - 1
                        ? "mb-6 pb-6 border-b"
                        : ""
                        }`}
                    >
                      <div className="space-y-1">
                        <label className="text-sm text-gray-500">Name</label>
                        <p className="font-medium">{buyer.buyerName}</p>
                      </div>
                      <div className="space-y-1">
                        <label className="text-sm text-gray-500">
                          Contact Number
                        </label>
                        <p className="font-medium">{buyer.phoneNumber}</p>
                      </div>
                      <div className="space-y-1">
                        <label className="text-sm text-gray-500">
                          Plot Number
                        </label>
                        <p className="font-medium">{buyer.plot.plotNumber}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">
                  No bookings found for this date.
                </p>
              );
            })()}
          <div className="flex justify-end pt-6">
            <Button
              onClick={closeDialog}
              className="bg-[#1F263E] hover:bg-[#2A324D] text-white"
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

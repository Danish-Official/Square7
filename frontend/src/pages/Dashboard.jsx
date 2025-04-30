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
import { Calendar } from "@/components/ui/calendar";
import { FilePlus } from "lucide-react";
import Login from "../components/Login";
import { useAuth } from "@/context/AuthContext";
import { useBuyers } from "@/context/BuyersContext";
import { useLayout } from "@/context/LayoutContext";
import "../styles/dashboard.scss";
import { apiClient } from "@/lib/utils";
import { toast } from "react-toastify";
import LayoutSelectionModal from "@/components/LayoutSelectionModal";

export default function Dashboard({ showLoginModal = false }) {
  const [selectedDate, setSelectedDate] = useState(null);
  const [dialogIsOpen, setDialogIsOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(showLoginModal);
  const { auth, isTokenExpired } = useAuth();
  const { buyers, refetchBuyers } = useBuyers();
  const { selectedLayout, showLayoutModal, setShowLayoutModal } = useLayout();
  const recentBuyers = buyers
    .filter((buyer) => buyer.plot.layoutId === selectedLayout)
    .slice(0, 5);

  const [layoutStats, setLayoutStats] = useState({});
  const [layoutRevenueData, setLayoutRevenueData] = useState({});
  const [layouts, setLayouts] = useState([]);

  useEffect(() => {
    if (!auth.token || auth.token === "" || isTokenExpired(auth.token)) {
      setIsLoginModalOpen(true);
    }
  }, [auth.token, isTokenExpired]);

  useEffect(() => {
    if (!auth.token || isTokenExpired(auth.token)) return;

    const fetchLayouts = async () => {
      try {
        const response = await apiClient.get("/plots/layouts");
        setLayouts(response.data);
      } catch (error) {
        console.error("Error fetching layouts:", error);
      }
    };

    fetchLayouts();
  }, [auth.token, isTokenExpired]);

  useEffect(() => {
    if (!auth.token || isTokenExpired(auth.token) || !selectedLayout) return;

    const fetchData = async () => {
      try {
        const [statsResponse, revenueResponse] = await Promise.all([
          apiClient.get(`/plots/stats/${selectedLayout}`),
          apiClient.get(`/invoices/revenue/${selectedLayout}`),
        ]);

        setLayoutStats((prev) => ({
          ...prev,
          [selectedLayout]: statsResponse.data,
        }));

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
    if (auth.token && !isTokenExpired(auth.token)) {
      refetchBuyers();
    }
  }, [auth.token, isTokenExpired, refetchBuyers]);

  useEffect(() => {
    if (!selectedLayout) {
      setShowLayoutModal(true);
    }
  }, [selectedLayout, setShowLayoutModal]);

  const handleDateClick = (date) => {
    setSelectedDate(date);
    setDialogIsOpen(true);
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
    if (!date || !Array.isArray(buyers)) return false;

    return buyers.some((buyer) => {
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
        console.error("Date validation error:", error);
        return false;
      }
    });
  };

  return (
    <>
      <div className={`p-6 space-y-6 ${isLoginModalOpen || showLayoutModal ? "blur-sm" : ""}`}>
        <h1 className="text-3xl font-semibold">Dashboard</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link 
            to="/new-booking" 
            className="w-full h-full rounded-xl text-white font-semibold text-2xl cursor-pointer flex justify-center items-center gap-2 bg-gradient-to-b from-[#1F263E] to-[#5266A4] transition-all duration-200 hover:from-[#5266A4] hover:to-[#1F263E]"
          >
            New Booking
            <FilePlus size={30}/>
          </Link>
          {selectedLayout &&
            layoutStats[selectedLayout] &&
            Object.entries(layoutStats[selectedLayout]).map(([key, value]) => (
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

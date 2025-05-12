import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Download, ArrowLeft, Trash2 } from "lucide-react";
import { toast } from "react-toastify";
import { apiClient } from "@/lib/utils";
import { pdf } from "@react-pdf/renderer";
import SinglePaymentPDF from "@/components/SinglePaymentPDF";
import InvoicePDF from "@/components/InvoicePDF";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function InvoiceDetails() {
  const { invoiceId } = useParams();
  const navigate = useNavigate();
  const [invoice, setInvoice] = useState(null);
  const [subsequentPayment, setSubsequentPayment] = useState({
    amount: "",
    paymentDate: "",
    paymentType: "Cash",
    narration: "",
  });
  const [editingPaymentIndex, setEditingPaymentIndex] = useState(null);
  const [errors, setErrors] = useState({});
  const { auth } = useAuth();

  useEffect(() => {
    fetchInvoice();
  }, [invoiceId]);

  const fetchInvoice = async () => {
    try {
      const { data } = await apiClient.get(`/invoices/${invoiceId}`);
      setInvoice(data);
    } catch (error) {
      toast.error("Failed to fetch invoice details");
      navigate("/invoices");
    }
  };

  // ...existing validation and handler functions from InvoiceDetailsModal...

  return (
    <div className="max-w-7xl mx-auto p-6">
      <Button
        variant="ghost"
        onClick={() => navigate("/invoices")}
        className="mb-6"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Invoices
      </Button>

      {invoice && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-semibold text-[#1F263E]">
                Invoice Details
              </h1>
              <p className="text-gray-500">
                View and manage invoice information
              </p>
            </div>
            <Button
              variant="outline"
              onClick={handleDownloadInvoice}
              className="bg-white hover:bg-gray-50"
            >
              <Download className="mr-2 h-4 w-4" />
              Download Invoice
            </Button>
          </div>

          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Buyer Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <label className="text-sm text-gray-500">Buyer Name</label>
                    <p className="font-medium">
                      {invoice?.booking?.buyerName}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm text-gray-500">
                      Phone Number
                    </label>
                    <p className="font-medium">
                      {invoice?.booking?.phoneNumber}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Payment History</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {/* ...existing payment list code... */}
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Add Payment</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  {/* ...existing payment form code... */}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}

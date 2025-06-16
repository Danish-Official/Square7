import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState, useEffect } from "react";

export default function PaymentModal({
    isOpen,
    onClose,
    payment,
    onSave,
    isEditing
}) {
    const [formData, setFormData] = useState({
        amount: "",
        paymentDate: "",
        paymentType: "Cash",
        narration: ""
    });

    useEffect(() => {
        if (payment) {
            setFormData({
                amount: payment.amount || "",
                paymentDate: payment.paymentDate || "",
                paymentType: payment.paymentType || "Cash",
                narration: payment.narration || ""
            });
        }
    }, [payment]);

    const handleChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleSubmit = () => {
        onSave({
            ...formData,
            amount: Math.ceil(Number(formData.amount))
        });
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-[600px] p-6 bg-[#1F263E] rounded-xl">
                <DialogHeader className="space-y-3 mb-6 text-white">
                    <DialogTitle className="text-2xl font-semibold">
                        {isEditing ? 'Edit Payment' : 'Add Payment'}
                    </DialogTitle>
                    <p className="text-sm font-normal">
                        Fill in the details to {isEditing ? 'update' : 'create'} a payment
                    </p>
                </DialogHeader>
                <div className="space-y-6">
                    <div>
                        <Input
                            placeholder="Amount"
                            type="number"
                            value={formData.amount}
                            onChange={(e) => handleChange('amount', e.target.value)}
                            className="bg-[#f7f7f7] border-gray-200 focus:border-blue-500"
                        />
                    </div>
                    <div>
                        <Input
                            placeholder="Payment Date"
                            type="date"
                            value={formData.paymentDate}
                            onChange={(e) => handleChange('paymentDate', e.target.value)}
                            className="bg-[#f7f7f7] border-gray-200 focus:border-blue-500"
                        />
                    </div>
                    <Select
                        value={formData.paymentType}
                        onValueChange={(value) => handleChange('paymentType', value)}
                    >
                        <SelectTrigger className="bg-[#f7f7f7] border-gray-200 focus:border-blue-500">
                            <SelectValue placeholder="Payment Type" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Cash">Cash</SelectItem>
                            <SelectItem value="Cheque">Cheque</SelectItem>
                            <SelectItem value="Online">Online</SelectItem>
                        </SelectContent>
                    </Select>
                    <Input
                        placeholder="Enter payment details (e.g., Cheque number, Transaction ID)"
                        value={formData.narration}
                        onChange={(e) => handleChange('narration', e.target.value)}
                        className="bg-[#f7f7f7] border-gray-200 focus:border-blue-500"
                    />
                    <div className="flex justify-end gap-3 pt-4">
                        <Button
                            variant="outline"
                            onClick={onClose}
                            className="bg-white hover:bg-[#f7f7f7]"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleSubmit}
                            variant="outline"
                            className="bg-white hover:bg-[#f7f7f7]"
                        >
                            {isEditing ? 'Update' : 'Create'}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

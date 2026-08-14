"use client";

import { useState, useTransition, useMemo } from "react";
import { createSale } from "@/lib/actions";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { formatCurrency } from "@/lib/utils";
import type { Product, InventoryBatch } from "@prisma/client";

type ProductWithStock = Product & {
  availableStock: number;
};

interface SaleItemInput {
  id: string; // temp id for React key
  productId: string;
  quantity: string;
  pricePerUnit: string;
}

export function AddSaleDialog({ products }: { products: ProductWithStock[] }) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [customerName, setCustomerName] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Bank Transfer");
  const [discountAmount, setDiscountAmount] = useState("");
  const [shippingCharge, setShippingCharge] = useState("");
  
  const [items, setItems] = useState<SaleItemInput[]>([
    { id: "1", productId: "", quantity: "1", pricePerUnit: "" }
  ]);

  const handleAddItem = () => {
    setItems([
      ...items,
      { id: Math.random().toString(), productId: "", quantity: "1", pricePerUnit: "" }
    ]);
  };

  const handleRemoveItem = (id: string) => {
    if (items.length === 1) return; // Prevent removing the last item
    setItems(items.filter(item => item.id !== id));
  };

  const updateItem = (id: string, field: keyof SaleItemInput, value: string) => {
    setItems(items.map(item => {
      if (item.id === id) {
        const newItem = { ...item, [field]: value };
        // Auto-fill price if product is selected
        if (field === 'productId' && value) {
          const product = products.find(p => p.id === value);
          if (product) {
            newItem.pricePerUnit = (product.price / 100).toString();
          }
        }
        return newItem;
      }
      return item;
    }));
  };

  // Calculations
  const subtotal = items.reduce((acc, item) => {
    const q = parseInt(item.quantity) || 0;
    const p = parseFloat(item.pricePerUnit) || 0;
    return acc + (q * p);
  }, 0);
  
  const discount = parseFloat(discountAmount) || 0;
  const shipping = parseFloat(shippingCharge) || 0;
  const total = subtotal + shipping - discount;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (items.some(i => !i.productId)) {
      toast.error("Please select a product for all items");
      return;
    }
    
    if (items.some(i => (parseInt(i.quantity) || 0) <= 0)) {
      toast.error("Quantity must be greater than 0");
      return;
    }

    startTransition(async () => {
      try {
        await createSale({
          date,
          customerName: customerName || undefined,
          paymentMethod,
          discountAmount: Math.round(discount * 100),
          shippingCharge: Math.round(shipping * 100),
          items: items.map(i => ({
            productId: i.productId,
            quantity: parseInt(i.quantity),
            pricePerUnit: Math.round(parseFloat(i.pricePerUnit) * 100)
          }))
        });
        
        setOpen(false);
        // Reset form
        setCustomerName("");
        setDiscountAmount("");
        setShippingCharge("");
        setItems([{ id: "1", productId: "", quantity: "1", pricePerUnit: "" }]);
        
        toast.success("Sale recorded successfully", {
          description: `Total amount: ${formatCurrency(total * 100)}`,
        });
      } catch (error: any) {
        toast.error("Failed to record sale", {
          description: error.message || "An unexpected error occurred.",
        });
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button className="gap-2 bg-white text-zinc-950 hover:bg-zinc-200">
            <Plus className="h-4 w-4" />
            Record Sale
          </Button>
        }
      />
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-zinc-950 border-zinc-800 text-zinc-200">
        <DialogHeader>
          <DialogTitle className="text-white">Record Sale</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6 pt-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                required
                className="bg-zinc-900 border-zinc-800 [color-scheme:dark]"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="customerName">Customer Name</Label>
              <Input
                id="customerName"
                className="bg-zinc-900 border-zinc-800"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Optional"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="paymentMethod">Payment Method</Label>
              <Input
                id="paymentMethod"
                required
                className="bg-zinc-900 border-zinc-800"
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                placeholder="e.g. eSewa, Bank Transfer"
              />
            </div>
          </div>

          <div className="space-y-4 border border-zinc-800 rounded-md p-4 bg-zinc-900/30">
            <div className="flex items-center justify-between">
              <Label className="text-white font-medium">Sale Items</Label>
              <Button type="button" variant="outline" size="sm" onClick={handleAddItem} className="bg-zinc-900 border-zinc-800 hover:text-white">
                <Plus className="h-3 w-3 mr-1" /> Add Item
              </Button>
            </div>
            
            <div className="space-y-3">
              {items.map((item, index) => (
                <div key={item.id} className="flex items-end gap-3 pb-3 border-b border-zinc-800/50 last:border-0 last:pb-0">
                  <div className="grid gap-2 flex-1">
                    <Label className="text-xs text-zinc-400">Product</Label>
                    <Select value={item.productId} onValueChange={(val) => updateItem(item.id, 'productId', val || "")}>
                      <SelectTrigger className="bg-zinc-900 border-zinc-800">
                        <SelectValue placeholder="Select product" />
                      </SelectTrigger>
                      <SelectContent className="bg-zinc-900 border-zinc-800 text-zinc-200">
                        {products.map((p) => (
                          <SelectItem key={p.id} value={p.id} disabled={p.availableStock <= 0}>
                            {p.name} ({p.sku}) - {p.availableStock} in stock
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="grid gap-2 w-24">
                    <Label className="text-xs text-zinc-400">Qty</Label>
                    <Input
                      type="number"
                      min="1"
                      required
                      className="bg-zinc-900 border-zinc-800"
                      value={item.quantity}
                      onChange={(e) => updateItem(item.id, 'quantity', e.target.value)}
                    />
                  </div>
                  
                  <div className="grid gap-2 w-32">
                    <Label className="text-xs text-zinc-400">Price (Rs.)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      required
                      className="bg-zinc-900 border-zinc-800"
                      value={item.pricePerUnit}
                      onChange={(e) => updateItem(item.id, 'pricePerUnit', e.target.value)}
                    />
                  </div>
                  
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="icon"
                    className="mb-[1px] text-zinc-500 hover:text-red-400 hover:bg-zinc-800"
                    onClick={() => handleRemoveItem(item.id)}
                    disabled={items.length === 1}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="discount">Discount Amount (Rs.)</Label>
                <Input
                  id="discount"
                  type="number"
                  step="0.01"
                  min="0"
                  className="bg-zinc-900 border-zinc-800"
                  value={discountAmount}
                  onChange={(e) => setDiscountAmount(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="shipping">Shipping Charge (Rs.)</Label>
                <Input
                  id="shipping"
                  type="number"
                  step="0.01"
                  min="0"
                  className="bg-zinc-900 border-zinc-800"
                  value={shippingCharge}
                  onChange={(e) => setShippingCharge(e.target.value)}
                />
              </div>
            </div>
            
            <div className="bg-zinc-900 rounded-md p-4 space-y-3 border border-zinc-800">
              <div className="flex justify-between text-sm text-zinc-400">
                <span>Subtotal</span>
                <span>{formatCurrency(subtotal * 100)}</span>
              </div>
              <div className="flex justify-between text-sm text-zinc-400">
                <span>Discount</span>
                <span className="text-red-400">-{formatCurrency(discount * 100)}</span>
              </div>
              <div className="flex justify-between text-sm text-zinc-400">
                <span>Shipping</span>
                <span>+{formatCurrency(shipping * 100)}</span>
              </div>
              <div className="pt-3 border-t border-zinc-800 flex justify-between font-medium text-white text-lg">
                <span>Total</span>
                <span>{formatCurrency(total * 100)}</span>
              </div>
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <Button type="submit" disabled={isPending} className="bg-white text-zinc-950 hover:bg-zinc-200 px-6">
              {isPending ? "Recording..." : "Record Sale"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

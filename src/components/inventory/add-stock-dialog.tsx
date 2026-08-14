"use client";

import { useState, useTransition } from "react";
import { createInventoryBatch } from "@/lib/actions";
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
import { Plus } from "lucide-react";
import type { Product } from "@prisma/client";
import { toast } from "sonner";

export function AddStockDialog({ products }: { products: Product[] }) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const [productId, setProductId] = useState<string>("");
  const [quantityPurchased, setQuantityPurchased] = useState("");
  const [unitCost, setUnitCost] = useState("");
  const [supplier, setSupplier] = useState("");
  const [purchaseDate, setPurchaseDate] = useState(new Date().toISOString().split("T")[0]);
  const [recordPayment, setRecordPayment] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!productId) {
      toast.error("Please select a product");
      return;
    }
    if (recordPayment && !paymentMethod) {
      toast.error("Please enter a payment method");
      return;
    }
    
    startTransition(async () => {
      try {
        await createInventoryBatch({
          productId,
          quantityPurchased: parseInt(quantityPurchased, 10),
          unitCost: Math.round(parseFloat(unitCost) * 100), // convert to paisa
          supplier,
          purchaseDate,
          recordPayment,
          paymentMethod: recordPayment ? paymentMethod : undefined,
        });
        
        setOpen(false);
        // Reset form
        setProductId("");
        setQuantityPurchased("");
        setUnitCost("");
        setSupplier("");
        setRecordPayment(true);
        setPaymentMethod("");
        
        toast.success("Stock added successfully", {
          description: `Added ${quantityPurchased} units`,
        });
      } catch (error) {
        toast.error("Failed to add stock", {
          description: "An unexpected error occurred. Please try again.",
        });
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <button className="flex items-center text-sm font-medium text-zinc-950 bg-white hover:bg-zinc-200 px-4 py-2 rounded-md transition-colors">
            <Plus className="mr-2 h-4 w-4" />
            Add Stock
          </button>
        }
      />
      <DialogContent className="sm:max-w-[425px] bg-zinc-950 border-zinc-800 text-zinc-200">
        <DialogHeader>
          <DialogTitle className="text-white">Record New Inventory Batch</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="grid gap-2">
            <Label htmlFor="product">Product</Label>
            <Select value={productId} onValueChange={(val) => setProductId(val || "")}>
              <SelectTrigger className="bg-zinc-900 border-zinc-800">
                <SelectValue placeholder="Select product" />
              </SelectTrigger>
              <SelectContent className="bg-zinc-900 border-zinc-800 text-zinc-200">
                {products.length === 0 ? (
                  <SelectItem value="none" disabled>No products found</SelectItem>
                ) : (
                  products.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name} ({p.sku})
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="quantity">Quantity Purchased</Label>
            <Input
              id="quantity"
              type="number"
              step="1"
              min="1"
              required
              className="bg-zinc-900 border-zinc-800"
              value={quantityPurchased}
              onChange={(e) => setQuantityPurchased(e.target.value)}
              placeholder="e.g. 50"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="unitCost">Unit Cost (Rs.)</Label>
            <Input
              id="unitCost"
              type="number"
              step="0.01"
              min="0.01"
              required
              className="bg-zinc-900 border-zinc-800"
              value={unitCost}
              onChange={(e) => setUnitCost(e.target.value)}
              placeholder="e.g. 45.00"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="supplier">Supplier / Manufacturer</Label>
            <Input
              id="supplier"
              required
              className="bg-zinc-900 border-zinc-800"
              value={supplier}
              onChange={(e) => setSupplier(e.target.value)}
              placeholder="e.g. Yiwu Garments Ltd"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="purchaseDate">Purchase Date</Label>
            <Input
              id="purchaseDate"
              type="date"
              required
              className="bg-zinc-900 border-zinc-800 [color-scheme:dark]"
              value={purchaseDate}
              onChange={(e) => setPurchaseDate(e.target.value)}
            />
          </div>

          <div className="flex flex-col space-y-4 pt-2">
            <label className="flex items-center space-x-2 text-sm text-zinc-300">
              <input
                type="checkbox"
                checked={recordPayment}
                onChange={(e) => setRecordPayment(e.target.checked)}
                className="rounded border-zinc-800 bg-zinc-900 text-white focus:ring-offset-zinc-950"
              />
              <span>Also record as a cash payment</span>
            </label>
            
            {recordPayment && (
              <div className="grid gap-2">
                <Label htmlFor="paymentMethod">Payment Method</Label>
                <Input
                  id="paymentMethod"
                  required={recordPayment}
                  className="bg-zinc-900 border-zinc-800"
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  placeholder="e.g. Bank Transfer"
                />
              </div>
            )}
          </div>

          <div className="pt-2 flex justify-end">
            <Button type="submit" disabled={isPending} className="bg-white text-zinc-950 hover:bg-zinc-200">
              {isPending ? "Saving..." : "Add Stock"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

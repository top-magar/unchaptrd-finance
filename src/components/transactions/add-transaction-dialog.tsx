"use client";

import { useState, useTransition } from "react";
import { createTransaction } from "@/lib/actions";
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
import type { Category, Partner } from "@prisma/client";
import { toast } from "sonner";

export function AddTransactionDialog({ categories, partners }: { categories: Category[], partners: Partner[] }) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const [type, setType] = useState<string>("EXPENSE");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [categoryId, setCategoryId] = useState<string | undefined>(undefined);
  const [partnerId, setPartnerId] = useState<string | undefined>(undefined);
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    startTransition(async () => {
      try {
        await createTransaction({
          date,
          type,
          amount: Math.round(parseFloat(amount) * 100), // convert to paisa
          description,
          paymentMethod,
          categoryId: categoryId || undefined,
          partnerId: partnerId || undefined,
        });
        
        setOpen(false);
        // Reset form
        setAmount("");
        setDescription("");
        setPaymentMethod("");
        setCategoryId(undefined);
        setPartnerId(undefined);
        
        toast.success("Transaction recorded successfully", {
          description: `Added ${type.toLowerCase()} for Rs. ${amount}`,
        });
      } catch (error) {
        toast.error("Failed to record transaction", {
          description: "An unexpected error occurred. Please try again.",
        });
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Add Transaction
          </Button>
        }
      />
      <DialogContent className="sm:max-w-[425px] bg-zinc-950 border-zinc-800 text-zinc-200">
        <DialogHeader>
          <DialogTitle className="text-white">Record Transaction</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="grid gap-2">
            <Label htmlFor="type">Transaction Type</Label>
            <Select value={type} onValueChange={(val) => setType(val || "EXPENSE")}>
              <SelectTrigger className="bg-zinc-900 border-zinc-800">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent className="bg-zinc-900 border-zinc-800 text-zinc-200">
                <SelectItem value="EXPENSE">Operating Expense</SelectItem>
                <SelectItem value="CAPITAL">Capital Contribution</SelectItem>
                <SelectItem value="ASSET_PURCHASE">Asset Purchase</SelectItem>
                <SelectItem value="INVENTORY_PURCHASE">Inventory Purchase</SelectItem>
                <SelectItem value="WITHDRAWAL">Owner Withdrawal</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="amount">Amount (Rs.)</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              required
              className="bg-zinc-900 border-zinc-800"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="e.g. 150.00"
            />
          </div>

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
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              required
              className="bg-zinc-900 border-zinc-800"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Facebook Ads"
            />
          </div>

          {type === "EXPENSE" && (
            <div className="grid gap-2">
              <Label htmlFor="category">Category</Label>
              <Select value={categoryId} onValueChange={(val) => setCategoryId(val || undefined)}>
                <SelectTrigger className="bg-zinc-900 border-zinc-800">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border-zinc-800 text-zinc-200">
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {type === "CAPITAL" && (
            <div className="grid gap-2">
              <Label htmlFor="partner">Partner</Label>
              <Select value={partnerId} onValueChange={(val) => setPartnerId(val || undefined)}>
                <SelectTrigger className="bg-zinc-900 border-zinc-800">
                  <SelectValue placeholder="Select partner" />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border-zinc-800 text-zinc-200">
                  {partners.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="grid gap-2">
            <Label htmlFor="paymentMethod">Payment Method</Label>
            <Input
              id="paymentMethod"
              required
              className="bg-zinc-900 border-zinc-800"
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              placeholder="e.g. Bank Transfer"
            />
          </div>

          <div className="pt-2 flex justify-end">
            <Button type="submit" disabled={isPending} className="bg-white text-zinc-950 hover:bg-zinc-200">
              {isPending ? "Saving..." : "Save Transaction"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

"use client";

import { useState, useTransition } from "react";
import { createProduct } from "@/lib/actions";
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
import { Plus } from "lucide-react";
import { toast } from "sonner";

export function AddProductDialog() {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const [sku, setSku] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    startTransition(async () => {
      try {
        await createProduct({
          sku,
          name,
          description: description || undefined,
          price: Math.round(parseFloat(price) * 100), // convert to paisa
        });
        
        setOpen(false);
        // Reset form
        setSku("");
        setName("");
        setDescription("");
        setPrice("");
        
        toast.success("Product created successfully", {
          description: `Created ${name} (${sku})`,
        });
      } catch (error) {
        toast.error("Failed to create product", {
          description: "This SKU might already exist, or an unexpected error occurred.",
        });
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="flex items-center text-sm font-medium text-zinc-400 bg-zinc-900 border border-zinc-800 hover:text-white px-4 py-2 rounded-md transition-colors">
          <Plus className="mr-2 h-4 w-4" />
          Add Product
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-zinc-950 border-zinc-800 text-zinc-200">
        <DialogHeader>
          <DialogTitle className="text-white">Create New Product</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="grid gap-2">
            <Label htmlFor="sku">SKU</Label>
            <Input
              id="sku"
              required
              className="bg-zinc-900 border-zinc-800"
              value={sku}
              onChange={(e) => setSku(e.target.value)}
              placeholder="e.g. TSHIRT-BLK-M"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              required
              className="bg-zinc-900 border-zinc-800"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Classic Black T-Shirt"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Input
              id="description"
              className="bg-zinc-900 border-zinc-800"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. 100% cotton, relaxed fit"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="price">Selling Price (Rs.)</Label>
            <Input
              id="price"
              type="number"
              step="0.01"
              min="0.01"
              required
              className="bg-zinc-900 border-zinc-800"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="e.g. 99.00"
            />
          </div>

          <div className="pt-2 flex justify-end">
            <Button type="submit" disabled={isPending} className="bg-white text-zinc-950 hover:bg-zinc-200">
              {isPending ? "Saving..." : "Create Product"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

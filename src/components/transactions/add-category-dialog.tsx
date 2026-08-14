"use client";

import { useState, useTransition } from "react";
import { createCategory } from "@/lib/actions";
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
import { toast } from "sonner";

export function AddCategoryDialog() {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [name, setName] = useState("");
  const [type, setType] = useState("EXPENSE");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    startTransition(async () => {
      try {
        await createCategory({ name, type });
        setOpen(false);
        setName("");
        setType("EXPENSE");
        toast.success("Category added successfully", {
          description: `Added ${name} to categories.`,
        });
      } catch (error) {
        toast.error("Failed to add category", {
          description: "An unexpected error occurred. Please try again.",
        });
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button variant="outline" className="gap-2 bg-zinc-900 border-zinc-800 text-zinc-300 hover:text-white hover:bg-zinc-800">
            <Plus className="h-4 w-4" />
            Add Category
          </Button>
        }
      />
      <DialogContent className="sm:max-w-[425px] bg-zinc-950 border-zinc-800 text-zinc-200">
        <DialogHeader>
          <DialogTitle className="text-white">Add New Category</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Category Name</Label>
            <Input
              id="name"
              required
              className="bg-zinc-900 border-zinc-800"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Marketing, Office Supplies"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="type">Category Type</Label>
            <Select value={type} onValueChange={(val) => setType(val || "EXPENSE")}>
              <SelectTrigger className="bg-zinc-900 border-zinc-800">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent className="bg-zinc-900 border-zinc-800 text-zinc-200">
                <SelectItem value="EXPENSE">Expense</SelectItem>
                <SelectItem value="INCOME">Income</SelectItem>
                <SelectItem value="ASSET">Asset</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="pt-2 flex justify-end">
            <Button type="submit" disabled={isPending} className="bg-white text-zinc-950 hover:bg-zinc-200">
              {isPending ? "Adding..." : "Add Category"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

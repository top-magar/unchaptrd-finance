"use client";

import { useState } from "react";
import { formatCurrency } from "@/lib/utils";
import { format } from "date-fns";
import { Receipt, Search, ArrowUpDown } from "lucide-react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import type { Transaction, Category } from "@prisma/client";

type ExpenseTx = Transaction & { category: Category | null };

export function ExpensesTable({ expenses }: { expenses: ExpenseTx[] }) {
  const [search, setSearch] = useState("");
  const [sortField, setSortField] = useState<"date" | "amount">("date");
  const [sortDesc, setSortDesc] = useState(true);

  // Filter
  const filtered = expenses.filter(tx => 
    tx.description.toLowerCase().includes(search.toLowerCase()) || 
    (tx.category?.name || "").toLowerCase().includes(search.toLowerCase())
  );

  // Sort
  const sorted = [...filtered].sort((a, b) => {
    if (sortField === "date") {
      return sortDesc 
        ? new Date(b.date).getTime() - new Date(a.date).getTime()
        : new Date(a.date).getTime() - new Date(b.date).getTime();
    }
    if (sortField === "amount") {
      return sortDesc ? b.amount - a.amount : a.amount - b.amount;
    }
    return 0;
  });

  const toggleSort = (field: "date" | "amount") => {
    if (sortField === field) {
      setSortDesc(!sortDesc);
    } else {
      setSortField(field);
      setSortDesc(true);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2 relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
        <Input 
          placeholder="Search expenses..." 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 bg-zinc-900 border-zinc-800 max-w-sm"
        />
      </div>

      <div className="rounded-md border border-zinc-800 bg-zinc-900/50 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-zinc-800 hover:bg-transparent">
              <TableHead className="text-zinc-400 font-medium w-[120px]">
                <button 
                  onClick={() => toggleSort("date")}
                  className="flex items-center hover:text-white transition-colors"
                >
                  Date <ArrowUpDown className="ml-2 h-3 w-3" />
                </button>
              </TableHead>
              <TableHead className="text-zinc-400 font-medium">Description</TableHead>
              <TableHead className="text-zinc-400 font-medium">Category</TableHead>
              <TableHead className="text-zinc-400 font-medium text-right">
                <button 
                  onClick={() => toggleSort("amount")}
                  className="flex items-center justify-end w-full hover:text-white transition-colors"
                >
                  Amount <ArrowUpDown className="ml-2 h-3 w-3" />
                </button>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sorted.map((tx) => (
              <TableRow key={tx.id} className="border-zinc-800 hover:bg-zinc-800/50 transition-colors">
                <TableCell className="font-medium text-zinc-300">
                  {format(new Date(tx.date), 'MMM dd, yyyy')}
                </TableCell>
                <TableCell className="text-zinc-300">{tx.description}</TableCell>
                <TableCell className="text-zinc-400">{tx.category?.name || "-"}</TableCell>
                <TableCell className="text-right font-medium text-white">
                  {formatCurrency(tx.amount)}
                </TableCell>
              </TableRow>
            ))}
            {sorted.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="h-64 text-center">
                  <div className="flex flex-col items-center justify-center space-y-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-zinc-900 border border-zinc-800">
                      <Receipt className="h-6 w-6 text-zinc-500" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-lg font-medium text-zinc-200">
                        {search ? "No matches found" : "No expenses recorded"}
                      </p>
                      <p className="text-sm text-zinc-500 max-w-sm mx-auto">
                        {search 
                          ? `No expenses match "${search}"`
                          : "Track your operating expenses here. They will automatically be deducted from your Net Profit."
                        }
                      </p>
                    </div>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

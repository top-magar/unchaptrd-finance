"use client";

import { useState } from "react";
import { formatCurrency } from "@/lib/utils";
import { format } from "date-fns";
import { Plus, Search, ArrowUpDown } from "lucide-react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import type { Sale } from "@prisma/client";

export function SalesTable({ sales }: { sales: Sale[] }) {
  const [search, setSearch] = useState("");
  const [sortField, setSortField] = useState<"date" | "customer" | "amount">("date");
  const [sortDesc, setSortDesc] = useState(true);

  // Filter
  const filtered = sales.filter(sale => 
    (sale.customerName || "Anonymous").toLowerCase().includes(search.toLowerCase())
  );

  // Sort
  const sorted = [...filtered].sort((a, b) => {
    let diff = 0;
    if (sortField === "date") {
      diff = new Date(a.date).getTime() - new Date(b.date).getTime();
    } else if (sortField === "customer") {
      const nameA = a.customerName || "Anonymous";
      const nameB = b.customerName || "Anonymous";
      diff = nameA.localeCompare(nameB);
    } else if (sortField === "amount") {
      diff = a.totalAmount - b.totalAmount;
    }
    
    return sortDesc ? -diff : diff;
  });

  const toggleSort = (field: "date" | "customer" | "amount") => {
    if (sortField === field) {
      setSortDesc(!sortDesc);
    } else {
      setSortField(field);
      setSortDesc(field === "date" || field === "amount"); // Default descending for dates and amounts
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2 relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
        <Input 
          placeholder="Search by customer..." 
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
              <TableHead className="text-zinc-400 font-medium">
                <button 
                  onClick={() => toggleSort("customer")}
                  className="flex items-center hover:text-white transition-colors"
                >
                  Customer <ArrowUpDown className="ml-2 h-3 w-3" />
                </button>
              </TableHead>
              <TableHead className="text-zinc-400 font-medium text-right">Discount</TableHead>
              <TableHead className="text-zinc-400 font-medium text-right">Shipping</TableHead>
              <TableHead className="text-zinc-400 font-medium text-right">
                <button 
                  onClick={() => toggleSort("amount")}
                  className="flex items-center justify-end w-full hover:text-white transition-colors"
                >
                  Total Amount <ArrowUpDown className="ml-2 h-3 w-3" />
                </button>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sorted.map((sale) => (
              <TableRow key={sale.id} className="border-zinc-800 hover:bg-zinc-800/50 transition-colors">
                <TableCell className="font-medium text-zinc-300">
                  {format(new Date(sale.date), 'MMM dd, yyyy')}
                </TableCell>
                <TableCell className="text-zinc-300">{sale.customerName || "Anonymous"}</TableCell>
                <TableCell className="text-right text-zinc-400">
                  {formatCurrency(sale.discountAmount)}
                </TableCell>
                <TableCell className="text-right text-zinc-400">
                  {formatCurrency(sale.shippingCharge)}
                </TableCell>
                <TableCell className="text-right font-medium text-emerald-400">
                  +{formatCurrency(sale.totalAmount)}
                </TableCell>
              </TableRow>
            ))}
            {sorted.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="h-64 text-center">
                  <div className="flex flex-col items-center justify-center space-y-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-zinc-900 border border-zinc-800">
                      <Plus className="h-6 w-6 text-zinc-500" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-lg font-medium text-zinc-200">
                        {search ? "No matches found" : "No sales recorded"}
                      </p>
                      <p className="text-sm text-zinc-500 max-w-sm mx-auto">
                        {search
                          ? `No sales match "${search}"`
                          : "Sales tracking helps you monitor revenue and inventory depletion over time."
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

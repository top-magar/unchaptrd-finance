"use client";

import { useState } from "react";
import { formatCurrency } from "@/lib/utils";
import { Package, Search, ArrowUpDown, LayoutGrid, List } from "lucide-react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import type { InventoryBatch, Product } from "@prisma/client";

type BatchWithProduct = InventoryBatch & { product: Product | null };

export function InventoryTable({ inventory }: { inventory: BatchWithProduct[] }) {
  const [search, setSearch] = useState("");
  const [sortField, setSortField] = useState<"product" | "stock" | "value">("product");
  const [sortDesc, setSortDesc] = useState(false);
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");

  // Filter
  const filtered = inventory.filter(batch => {
    const term = search.toLowerCase();
    return (
      (batch.product?.name || "").toLowerCase().includes(term) ||
      (batch.product?.sku || "").toLowerCase().includes(term) ||
      (batch.supplier || "").toLowerCase().includes(term)
    );
  });

  // Sort
  const sorted = [...filtered].sort((a, b) => {
    let diff = 0;
    if (sortField === "product") {
      const nameA = a.product?.name || "";
      const nameB = b.product?.name || "";
      diff = nameA.localeCompare(nameB);
    } else if (sortField === "stock") {
      diff = a.quantityRemaining - b.quantityRemaining;
    } else if (sortField === "value") {
      diff = (a.quantityRemaining * a.unitCost) - (b.quantityRemaining * b.unitCost);
    }
    
    return sortDesc ? -diff : diff;
  });

  const toggleSort = (field: "product" | "stock" | "value") => {
    if (sortField === field) {
      setSortDesc(!sortDesc);
    } else {
      setSortField(field);
      setSortDesc(field === "stock" || field === "value"); // default descending for numbers
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2 relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
          <Input 
            placeholder="Search inventory..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-zinc-900 border-zinc-800 max-w-sm"
          />
        </div>
        
        <div className="flex items-center space-x-2 bg-zinc-900 border border-zinc-800 p-1 rounded-md">
          <button 
            onClick={() => setViewMode("list")}
            className={`p-1.5 rounded transition-colors ${viewMode === 'list' ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-white'}`}
          >
            <List className="h-4 w-4" />
          </button>
          <button 
            onClick={() => setViewMode("grid")}
            className={`p-1.5 rounded transition-colors ${viewMode === 'grid' ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-white'}`}
          >
            <LayoutGrid className="h-4 w-4" />
          </button>
        </div>
      </div>

      {viewMode === "list" ? (
        <div className="rounded-md border border-zinc-800 bg-zinc-900/50 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="border-zinc-800 hover:bg-transparent">
                <TableHead className="text-zinc-400 font-medium">
                  <button 
                    onClick={() => toggleSort("product")}
                    className="flex items-center hover:text-white transition-colors"
                  >
                    Product <ArrowUpDown className="ml-2 h-3 w-3" />
                  </button>
                </TableHead>
                <TableHead className="text-zinc-400 font-medium">SKU</TableHead>
                <TableHead className="text-zinc-400 font-medium">Supplier</TableHead>
                <TableHead className="text-zinc-400 font-medium text-right">
                  <button 
                    onClick={() => toggleSort("stock")}
                    className="flex items-center justify-end w-full hover:text-white transition-colors"
                  >
                    In Stock <ArrowUpDown className="ml-2 h-3 w-3" />
                  </button>
                </TableHead>
                <TableHead className="text-zinc-400 font-medium text-right">Unit Cost</TableHead>
                <TableHead className="text-zinc-400 font-medium text-right">
                  <button 
                    onClick={() => toggleSort("value")}
                    className="flex items-center justify-end w-full hover:text-white transition-colors"
                  >
                    Total Value <ArrowUpDown className="ml-2 h-3 w-3" />
                  </button>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sorted.map((batch) => {
                const product = batch.product;
                return (
                  <TableRow key={batch.id} className="border-zinc-800 hover:bg-zinc-800/50 transition-colors">
                    <TableCell className="font-medium text-zinc-300">
                      <div className="flex items-center space-x-3">
                        {product?.imageUrl ? (
                          <img src={product.imageUrl} alt={product.name} className="h-10 w-10 rounded object-cover border border-zinc-800 bg-zinc-950" />
                        ) : (
                          <div className="flex h-10 w-10 items-center justify-center rounded bg-zinc-950 border border-zinc-800">
                            <Package className="h-5 w-5 text-zinc-700" />
                          </div>
                        )}
                        <span>{product?.name || 'Unknown'}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-zinc-400">{product?.sku}</TableCell>
                    <TableCell className="text-zinc-400">{batch.supplier || "-"}</TableCell>
                    <TableCell className="text-right font-medium text-white">
                      {batch.quantityRemaining} / {batch.quantityPurchased}
                    </TableCell>
                    <TableCell className="text-right text-zinc-400">
                      {formatCurrency(batch.unitCost)}
                    </TableCell>
                    <TableCell className="text-right font-medium text-white">
                      {formatCurrency(batch.unitCost * batch.quantityRemaining)}
                    </TableCell>
                  </TableRow>
                );
              })}
              {sorted.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="h-64 text-center">
                    <div className="flex flex-col items-center justify-center space-y-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-zinc-900 border border-zinc-800">
                        <Package className="h-6 w-6 text-zinc-500" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-lg font-medium text-zinc-200">
                          {search ? "No matches found" : "No inventory batches"}
                        </p>
                        <p className="text-sm text-zinc-500 max-w-sm mx-auto">
                          {search 
                            ? `No inventory matches "${search}"`
                            : "Add your first product, then record an inventory batch to track your stock."
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
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {sorted.map((batch) => {
            const product = batch.product;
            const isLowStock = batch.quantityRemaining > 0 && batch.quantityRemaining <= 5;
            const isOutOfStock = batch.quantityRemaining === 0;
            
            return (
              <div key={batch.id} className="group rounded-md border border-zinc-800 bg-zinc-900/50 overflow-hidden hover:border-zinc-700 transition-colors">
                <div className="aspect-square bg-zinc-950 relative border-b border-zinc-800">
                  {product?.imageUrl ? (
                    <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <Package className="h-10 w-10 text-zinc-800" />
                    </div>
                  )}
                  
                  {isOutOfStock && (
                    <div className="absolute top-2 right-2 px-2 py-1 bg-red-500/20 text-red-400 text-xs font-medium rounded border border-red-500/30 backdrop-blur-sm">
                      Out of Stock
                    </div>
                  )}
                  {isLowStock && (
                    <div className="absolute top-2 right-2 px-2 py-1 bg-amber-500/20 text-amber-400 text-xs font-medium rounded border border-amber-500/30 backdrop-blur-sm">
                      Low Stock
                    </div>
                  )}
                </div>
                
                <div className="p-4 space-y-3">
                  <div>
                    <h3 className="font-medium text-white truncate" title={product?.name || "Unknown"}>
                      {product?.name || 'Unknown'}
                    </h3>
                    <p className="text-xs text-zinc-500 mt-0.5">{product?.sku}</p>
                  </div>
                  
                  <div className="flex items-end justify-between pt-2 border-t border-zinc-800/50">
                    <div>
                      <p className="text-xs text-zinc-500">In Stock</p>
                      <p className={`font-medium ${isOutOfStock ? 'text-red-400' : 'text-white'}`}>
                        {batch.quantityRemaining}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-zinc-500">Est. Value</p>
                      <p className="font-medium text-white">{formatCurrency(batch.unitCost * batch.quantityRemaining)}</p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
          
          {sorted.length === 0 && (
            <div className="col-span-full py-24 flex flex-col items-center justify-center space-y-3 border border-zinc-800 border-dashed rounded-md bg-zinc-900/20">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-zinc-900 border border-zinc-800">
                <Package className="h-6 w-6 text-zinc-500" />
              </div>
              <div className="text-center space-y-1">
                <p className="text-lg font-medium text-zinc-200">
                  {search ? "No matches found" : "No products found"}
                </p>
                <p className="text-sm text-zinc-500 max-w-sm mx-auto">
                  {search 
                    ? `Try a different search term`
                    : "Add your first product to see it in the grid."
                  }
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

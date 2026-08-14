import { getInventoryBatches } from "@/lib/actions";
import { formatCurrency } from "@/lib/utils";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Plus } from "lucide-react";

export default async function InventoryPage() {
  const inventory = await getInventoryBatches();

  return (
    <div className="flex-1 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold tracking-tight text-white">Inventory</h2>
        <div className="flex items-center space-x-3">
          <button className="flex items-center text-sm font-medium text-zinc-950 bg-white hover:bg-zinc-200 px-4 py-2 rounded-md transition-colors">
            <Plus className="mr-2 h-4 w-4" />
            Add Stock
          </button>
        </div>
      </div>

      <div className="rounded-md border border-zinc-800 bg-zinc-900/50">
        <Table>
          <TableHeader>
            <TableRow className="border-zinc-800 hover:bg-transparent">
              <TableHead className="text-zinc-400 font-medium">Product</TableHead>
              <TableHead className="text-zinc-400 font-medium">SKU</TableHead>
              <TableHead className="text-zinc-400 font-medium">Supplier</TableHead>
              <TableHead className="text-zinc-400 font-medium text-right">In Stock</TableHead>
              <TableHead className="text-zinc-400 font-medium text-right">Unit Cost</TableHead>
              <TableHead className="text-zinc-400 font-medium text-right">Total Value</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {inventory.map((batch) => {
              const product = batch.product;
              return (
                <TableRow key={batch.id} className="border-zinc-800 hover:bg-zinc-800/50 transition-colors">
                  <TableCell className="font-medium text-zinc-300">
                    {product?.name || 'Unknown'}
                  </TableCell>
                  <TableCell className="text-zinc-400">{product?.sku}</TableCell>
                  <TableCell className="text-zinc-400">{batch.supplier}</TableCell>
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
            {inventory.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-zinc-500">
                  No inventory recorded.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

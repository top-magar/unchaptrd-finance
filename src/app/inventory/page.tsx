import { getInventoryBatches, getProducts } from "@/lib/actions";
import { formatCurrency } from "@/lib/utils";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { AddStockDialog } from "@/components/inventory/add-stock-dialog";
import { AddProductDialog } from "@/components/inventory/add-product-dialog";
import { Plus, Package } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function InventoryPage() {
  const inventory = await getInventoryBatches();
  const products = await getProducts();

  return (
    <div className="flex-1 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold tracking-tight text-white">Inventory</h2>
        <div className="flex items-center space-x-3">
          <AddProductDialog />
          <AddStockDialog products={products} />
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
                <TableCell colSpan={6} className="h-64 text-center">
                  <div className="flex flex-col items-center justify-center space-y-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-zinc-900 border border-zinc-800">
                      <Package className="h-6 w-6 text-zinc-500" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-lg font-medium text-zinc-200">No inventory batches</p>
                      <p className="text-sm text-zinc-500 max-w-sm mx-auto">
                        Add your first product, then record an inventory batch to track your stock.
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

import { getInventoryBatches, getProducts } from "@/lib/actions";
import { AddStockDialog } from "@/components/inventory/add-stock-dialog";
import { AddProductDialog } from "@/components/inventory/add-product-dialog";
import { InventoryTable } from "@/components/inventory/inventory-table";

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

      <InventoryTable inventory={inventory} />
    </div>
  );
}

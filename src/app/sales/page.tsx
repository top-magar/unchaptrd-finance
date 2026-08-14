import { getSales, getProducts, getInventoryBatches } from "@/lib/actions";
import { SalesTable } from "@/components/sales/sales-table";
import { AddSaleDialog } from "@/components/sales/add-sale-dialog";

export const dynamic = "force-dynamic";

export default async function SalesPage() {
  const sales = await getSales();
  const products = await getProducts();
  const inventoryBatches = await getInventoryBatches();
  
  // Calculate available stock for each product
  const productsWithStock = products.map(product => {
    const availableStock = inventoryBatches
      .filter(batch => batch.productId === product.id)
      .reduce((sum, batch) => sum + batch.quantityRemaining, 0);
      
    return { ...product, availableStock };
  });

  return (
    <div className="flex-1 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold tracking-tight text-white">Sales</h2>
        <div className="flex items-center space-x-3">
          <AddSaleDialog products={productsWithStock} />
        </div>
      </div>

      <SalesTable sales={sales} />
    </div>
  );
}

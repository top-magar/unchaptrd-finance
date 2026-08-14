import { getSales } from "@/lib/actions";
import { Plus } from "lucide-react";
import { SalesTable } from "@/components/sales/sales-table";

export const dynamic = "force-dynamic";

export default async function SalesPage() {
  const sales = await getSales();

  return (
    <div className="flex-1 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold tracking-tight text-white">Sales</h2>
        <div className="flex items-center space-x-3">
          <button className="flex items-center text-sm font-medium text-zinc-950 bg-white hover:bg-zinc-200 px-4 py-2 rounded-md transition-colors">
            <Plus className="mr-2 h-4 w-4" />
            Record Sale
          </button>
        </div>
      </div>

      <SalesTable sales={sales} />
    </div>
  );
}

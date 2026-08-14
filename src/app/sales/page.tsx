import { getSales } from "@/lib/actions";
import { formatCurrency } from "@/lib/utils";
import { format } from "date-fns";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Plus } from "lucide-react";

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

      <div className="rounded-md border border-zinc-800 bg-zinc-900/50">
        <Table>
          <TableHeader>
            <TableRow className="border-zinc-800 hover:bg-transparent">
              <TableHead className="text-zinc-400 font-medium w-[120px]">Date</TableHead>
              <TableHead className="text-zinc-400 font-medium">Customer</TableHead>
              <TableHead className="text-zinc-400 font-medium text-right">Discount</TableHead>
              <TableHead className="text-zinc-400 font-medium text-right">Shipping</TableHead>
              <TableHead className="text-zinc-400 font-medium text-right">Total Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sales.map((sale) => (
              <TableRow key={sale.id} className="border-zinc-800 hover:bg-zinc-800/50 transition-colors">
                <TableCell className="font-medium text-zinc-300">
                  {format(sale.date, 'MMM dd, yyyy')}
                </TableCell>
                <TableCell className="text-zinc-300">{sale.customerName}</TableCell>
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
            {sales.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center text-zinc-500">
                  No sales recorded yet.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

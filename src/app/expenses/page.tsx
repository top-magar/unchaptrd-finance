import { getTransactions } from "@/lib/actions";
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

export default async function ExpensesPage() {
  const transactions = await getTransactions();

  const expenses = transactions
    .filter(tx => tx.type === 'EXPENSE')
    .sort((a, b) => b.date.getTime() - a.date.getTime());

  return (
    <div className="flex-1 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold tracking-tight text-white">Operating Expenses</h2>
      </div>

      <div className="rounded-md border border-zinc-800 bg-zinc-900/50">
        <Table>
          <TableHeader>
            <TableRow className="border-zinc-800 hover:bg-transparent">
              <TableHead className="text-zinc-400 font-medium w-[120px]">Date</TableHead>
              <TableHead className="text-zinc-400 font-medium">Description</TableHead>
              <TableHead className="text-zinc-400 font-medium">Category</TableHead>
              <TableHead className="text-zinc-400 font-medium text-right">Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {expenses.map((tx) => (
              <TableRow key={tx.id} className="border-zinc-800 hover:bg-zinc-800/50 transition-colors">
                <TableCell className="font-medium text-zinc-300">
                  {format(tx.date, 'MMM dd, yyyy')}
                </TableCell>
                <TableCell className="text-zinc-300">{tx.description}</TableCell>
                <TableCell className="text-zinc-400">{tx.category?.name || "-"}</TableCell>
                <TableCell className="text-right font-medium text-white">
                  {formatCurrency(tx.amount)}
                </TableCell>
              </TableRow>
            ))}
            {expenses.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center text-zinc-500">
                  No operating expenses recorded.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

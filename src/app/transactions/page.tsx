import { formatCurrency } from "@/lib/utils";
import { getTransactions, getCategories, getPartners } from "@/lib/actions";
import { format } from "date-fns";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
export const dynamic = "force-dynamic";
import { Badge } from "@/components/ui/badge";
import { Filter, Download } from "lucide-react";
import { AddTransactionDialog } from "@/components/transactions/add-transaction-dialog";
import { AddCategoryDialog } from "@/components/transactions/add-category-dialog";

export default async function TransactionsPage() {
  const transactions = await getTransactions();
  const categories = await getCategories();
  const partners = await getPartners();

  // Helper to render badges based on transaction type
  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'CAPITAL': return <Badge className="bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 border-emerald-500/20">Capital</Badge>;
      case 'EXPENSE': return <Badge className="bg-red-500/10 text-red-500 hover:bg-red-500/20 border-red-500/20">OpEx</Badge>;
      case 'ASSET_PURCHASE': return <Badge className="bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 border-blue-500/20">Asset</Badge>;
      case 'INVENTORY_PURCHASE': return <Badge className="bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 border-amber-500/20">Inventory</Badge>;
      case 'SALE': return <Badge className="bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 border-emerald-500/20">Sale</Badge>;
      case 'INCOME': return <Badge className="bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 border-emerald-500/20">Income</Badge>;
      case 'WITHDRAWAL': return <Badge className="bg-purple-500/10 text-purple-500 hover:bg-purple-500/20 border-purple-500/20">Withdrawal</Badge>;
      default: return <Badge variant="outline">{type}</Badge>;
    }
  };

  return (
    <div className="flex-1 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold tracking-tight text-white">Transactions</h2>
        <div className="flex items-center space-x-3">
          <button className="flex items-center text-sm font-medium text-zinc-400 hover:text-white px-3 py-2 border border-zinc-800 rounded-md bg-zinc-900/50">
            <Filter className="mr-2 h-4 w-4" />
            Filter
          </button>
          <button className="flex items-center text-sm font-medium text-zinc-400 hover:text-white px-3 py-2 border border-zinc-800 rounded-md bg-zinc-900/50">
            <Download className="mr-2 h-4 w-4" />
            Export
          </button>
          <AddCategoryDialog />
          <AddTransactionDialog categories={categories} partners={partners} />
        </div>
      </div>

      <div className="rounded-md border border-zinc-800 bg-zinc-900/50">
        <Table>
          <TableHeader>
            <TableRow className="border-zinc-800 hover:bg-transparent">
              <TableHead className="text-zinc-400 font-medium w-[120px]">Date</TableHead>
              <TableHead className="text-zinc-400 font-medium">Description</TableHead>
              <TableHead className="text-zinc-400 font-medium w-[140px]">Type</TableHead>
              <TableHead className="text-zinc-400 font-medium w-[180px]">Category</TableHead>
              <TableHead className="text-zinc-400 font-medium w-[140px]">Payment</TableHead>
              <TableHead className="text-zinc-400 font-medium text-right w-[140px]">Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.map((tx) => (
              <TableRow key={tx.id} className="border-zinc-800 hover:bg-zinc-800/50 transition-colors">
                <TableCell className="font-medium text-zinc-300">
                  {format(tx.date, 'MMM dd, yyyy')}
                </TableCell>
                <TableCell className="text-zinc-300">{tx.description}</TableCell>
                <TableCell>{getTypeBadge(tx.type)}</TableCell>
                <TableCell className="text-zinc-400">{tx.category?.name || '-'}</TableCell>
                <TableCell className="text-zinc-400">{tx.paymentMethod}</TableCell>
                <TableCell className={`text-right font-medium ${['EXPENSE', 'ASSET_PURCHASE', 'INVENTORY_PURCHASE', 'WITHDRAWAL'].includes(tx.type) ? 'text-white' : 'text-emerald-400'}`}>
                  {['EXPENSE', 'ASSET_PURCHASE', 'INVENTORY_PURCHASE', 'WITHDRAWAL'].includes(tx.type) ? '-' : '+'}{formatCurrency(tx.amount)}
                </TableCell>
              </TableRow>
            ))}
            {transactions.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-zinc-500">
                  No transactions found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

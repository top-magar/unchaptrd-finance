import { getTransactions } from "@/lib/actions";
import { ExpensesTable } from "@/components/transactions/expenses-table";

export const dynamic = "force-dynamic";

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

      <ExpensesTable expenses={expenses} />
    </div>
  );
}

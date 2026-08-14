import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
export const dynamic = "force-dynamic";
import { CashFlowChart } from "@/components/dashboard/cash-flow-chart";
import { ExpenseDistribution } from "@/components/dashboard/expense-distribution";
import { SalesDistribution } from "@/components/dashboard/sales-distribution";
import { ArrowUpRight, ArrowDownRight, DollarSign, Package, TrendingUp } from "lucide-react";
import { getDashboardStats } from "@/lib/actions";
import { format } from "date-fns";

export default async function DashboardPage() {
  const { transactions, partners, sales, stats } = await getDashboardStats();

  // Sort transactions by date descending for the recent feed
  const recentTxs = [...transactions]
    .sort((a, b) => b.date.getTime() - a.date.getTime())
    .slice(0, 5);

  return (
    <div className="flex-1 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold tracking-tight text-white">Dashboard</h2>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-zinc-400">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-zinc-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{formatCurrency(stats.totalRevenue)}</div>
            <p className="text-xs text-zinc-500 mt-1">All time sales</p>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-zinc-400">Available Cash</CardTitle>
            <DollarSign className="h-4 w-4 text-zinc-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{formatCurrency(stats.availableCash)}</div>
            <p className="text-xs text-zinc-500 mt-1">
              {stats.totalCapital > 0 ? ((stats.availableCash / stats.totalCapital) * 100).toFixed(1) : 0}% of Total Capital
            </p>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-zinc-400">Inventory Value (Cost)</CardTitle>
            <Package className="h-4 w-4 text-zinc-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{formatCurrency(stats.inventoryValue)}</div>
            <p className="text-xs text-zinc-500 mt-1">Stock on hand</p>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-zinc-400">Net Profit / Loss</CardTitle>
            <TrendingUp className="h-4 w-4 text-zinc-500" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${stats.netProfit >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
              {formatCurrency(stats.netProfit)}
            </div>
            <p className="text-xs text-zinc-500 mt-1">Revenue minus OpEx & COGS</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-10">
        <CashFlowChart transactions={transactions} />
        <ExpenseDistribution transactions={transactions} />
        <SalesDistribution sales={sales} />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-zinc-200">Capital Structure</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {partners.map(p => {
                const percentage = stats.totalCapital > 0 ? ((p.totalContributed / stats.totalCapital) * 100).toFixed(1) : "0";
                return (
                  <div key={p.id}>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-zinc-200">{p.name}</p>
                        <p className="text-xs text-zinc-500">{percentage}%</p>
                      </div>
                      <div className="font-medium text-white">{formatCurrency(p.totalContributed)}</div>
                    </div>
                    <div className="h-2 w-full bg-zinc-800 rounded-full overflow-hidden mt-1">
                      <div className="h-full bg-zinc-300 rounded-full" style={{ width: `${percentage}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-zinc-200">Recent Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentTxs.map((tx) => (
                <div key={tx.id} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-zinc-800">
                      {['EXPENSE', 'ASSET_PURCHASE', 'INVENTORY_PURCHASE', 'WITHDRAWAL'].includes(tx.type) ? (
                        <ArrowDownRight className="h-4 w-4 text-red-400" />
                      ) : (
                        <ArrowUpRight className="h-4 w-4 text-emerald-400" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-zinc-200">{tx.description}</p>
                      <p className="text-xs text-zinc-500">{format(tx.date, 'MMM dd')}</p>
                    </div>
                  </div>
                  <div className={`font-medium ${['EXPENSE', 'ASSET_PURCHASE', 'INVENTORY_PURCHASE', 'WITHDRAWAL'].includes(tx.type) ? 'text-white' : 'text-emerald-400'}`}>
                    {['EXPENSE', 'ASSET_PURCHASE', 'INVENTORY_PURCHASE', 'WITHDRAWAL'].includes(tx.type) ? '-' : '+'}{formatCurrency(tx.amount)}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

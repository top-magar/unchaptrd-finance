import { getPartners, getTransactions } from "@/lib/actions";
import { formatCurrency } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function PartnersPage() {
  const partners = await getPartners();
  const transactions = await getTransactions();

  const totalCapital = partners.reduce((acc, p) => acc + p.totalContributed, 0);

  return (
    <div className="flex-1 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold tracking-tight text-white">Partners & Capital</h2>
      </div>

      {partners.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 border border-zinc-800 rounded-md bg-zinc-900/50 mt-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-zinc-900 border border-zinc-800 mb-4">
            <Users className="h-6 w-6 text-zinc-500" />
          </div>
          <p className="text-lg font-medium text-zinc-200">No partners found</p>
          <p className="text-sm text-zinc-500 max-w-sm mx-auto text-center mt-1">
            Add partners to track capital contributions and ownership stakes.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 mt-4">
          {partners.map(p => {
            const percentage = totalCapital > 0 ? ((p.totalContributed / totalCapital) * 100).toFixed(1) : "0";
            const partnerTxs = transactions
              .filter(tx => tx.partnerId === p.id && tx.type === 'CAPITAL')
              .sort((a, b) => b.date.getTime() - a.date.getTime());

            return (
              <Card key={p.id} className="bg-zinc-900/50 border-zinc-800">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-lg font-medium text-white">{p.name}</CardTitle>
                  <Users className="h-4 w-4 text-zinc-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-white mt-2">{formatCurrency(p.totalContributed)}</div>
                  <p className="text-sm text-zinc-500 mt-1">
                    {percentage}% Ownership Stake
                  </p>
                  
                  <div className="mt-6">
                    <h4 className="text-sm font-medium text-zinc-400 mb-3">Contribution History</h4>
                    <div className="space-y-3">
                      {partnerTxs.map(tx => (
                        <div key={tx.id} className="flex justify-between items-center border-t border-zinc-800 pt-2">
                          <span className="text-sm text-zinc-300">{tx.description}</span>
                          <span className="text-sm font-medium text-emerald-400">+{formatCurrency(tx.amount)}</span>
                        </div>
                      ))}
                      {partnerTxs.length === 0 && (
                        <span className="text-sm text-zinc-500">No contributions logged.</span>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

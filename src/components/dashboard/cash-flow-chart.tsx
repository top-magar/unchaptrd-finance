"use client";

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { format, startOfMonth, subMonths, isSameMonth } from 'date-fns';
import type { Transaction } from '@prisma/client';

export function CashFlowChart({ transactions }: { transactions: Transaction[] }) {
  // Generate last 6 months
  const now = new Date();
  const months = Array.from({ length: 6 }).map((_, i) => startOfMonth(subMonths(now, 5 - i)));

  const data = months.map(month => {
    let cashIn = 0;
    let cashOut = 0;

    transactions.forEach(tx => {
      const txDate = new Date(tx.date); // Prisma returns actual Date objects
      if (isSameMonth(txDate, month)) {
        if (['CAPITAL', 'SALE'].includes(tx.type)) {
          cashIn += tx.amount;
        } else if (['EXPENSE', 'ASSET_PURCHASE', 'INVENTORY_PURCHASE', 'WITHDRAWAL'].includes(tx.type)) {
          cashOut += tx.amount;
        }
      }
    });

    return {
      name: format(month, 'MMM'),
      cashIn,
      cashOut
    };
  });

  return (
    <Card className="col-span-4 bg-zinc-900/50 border-zinc-800">
      <CardHeader>
        <CardTitle className="text-zinc-200 font-medium">Cash Flow</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 5, right: 10, left: 10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#3f3f46" vertical={false} />
              <XAxis dataKey="name" stroke="#a1a1aa" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#a1a1aa" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `Rs.${value / 1000}k`} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '6px' }}
                itemStyle={{ color: '#e4e4e7' }}
                labelStyle={{ color: '#a1a1aa', marginBottom: '4px' }}
                formatter={(value: any) => [`Rs.${(value / 100).toLocaleString()}`, undefined]}
              />
              <Line type="monotone" dataKey="cashIn" name="Cash In" stroke="#10b981" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="cashOut" name="Cash Out" stroke="#ef4444" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

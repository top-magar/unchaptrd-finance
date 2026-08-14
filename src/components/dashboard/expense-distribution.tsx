"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';
import type { Transaction, Category } from '@prisma/client';

const COLORS = ['#fafafa', '#a1a1aa', '#52525b', '#27272a', '#18181b', '#3f3f46', '#71717a'];

type TransactionWithCategory = Transaction & { category: Category | null };

export function ExpenseDistribution({ transactions }: { transactions: TransactionWithCategory[] }) {
  // Group operating expenses by category
  const expensesByCategory: Record<string, { amount: number, name: string }> = {};
  
  transactions.forEach(tx => {
    if (tx.type === 'EXPENSE' && tx.category) {
      if (!expensesByCategory[tx.category.id]) {
        expensesByCategory[tx.category.id] = { amount: 0, name: tx.category.name };
      }
      expensesByCategory[tx.category.id].amount += tx.amount;
    }
  });

  // Map to recharts data format
  const data = Object.values(expensesByCategory).map(cat => ({
    name: cat.name,
    value: cat.amount
  })).sort((a, b) => b.value - a.value);

  return (
    <Card className="col-span-3 bg-zinc-900/50 border-zinc-800">
      <CardHeader>
        <CardTitle className="text-zinc-200 font-medium">OpEx Distribution</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          {data.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="45%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                  stroke="none"
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '6px' }}
                  itemStyle={{ color: '#e4e4e7' }}
                  formatter={(value: any) => [formatCurrency(value), undefined]}
                />
                <Legend 
                  verticalAlign="bottom" 
                  height={36} 
                  iconType="circle" 
                  formatter={(value) => <span className="text-zinc-400 text-xs">{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
             <div className="flex items-center justify-center h-full text-zinc-500">No expenses recorded</div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

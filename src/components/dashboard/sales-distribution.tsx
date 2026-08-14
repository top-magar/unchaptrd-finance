"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';
import type { Sale, SaleItem, Product } from '@prisma/client';

const COLORS = ['#10b981', '#34d399', '#6ee7b7', '#a7f3d0', '#ecfdf5', '#047857', '#065f46'];

type SaleWithItems = Sale & { items: (SaleItem & { product: Product })[] };

export function SalesDistribution({ sales }: { sales: SaleWithItems[] }) {
  // Group revenue by product
  const revenueByProduct: Record<string, { amount: number, name: string }> = {};
  
  sales.forEach(sale => {
    sale.items.forEach(item => {
      if (!revenueByProduct[item.product.id]) {
        revenueByProduct[item.product.id] = { amount: 0, name: item.product.name };
      }
      revenueByProduct[item.product.id].amount += (item.quantity * item.unitPrice);
    });
  });

  // Map to recharts data format
  const data = Object.values(revenueByProduct).map(prod => ({
    name: prod.name,
    value: prod.amount
  })).sort((a, b) => b.value - a.value);

  return (
    <Card className="col-span-3 bg-zinc-900/50 border-zinc-800">
      <CardHeader>
        <CardTitle className="text-zinc-200 font-medium">Revenue by Product</CardTitle>
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
             <div className="flex items-center justify-center h-full text-zinc-500">No sales recorded</div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

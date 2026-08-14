"use server"

import { prisma } from './prisma'
import { revalidatePath } from 'next/cache'

// Transactions
export async function getTransactions() {
  return prisma.transaction.findMany({
    orderBy: { date: 'desc' },
    include: { category: true, partner: true }
  })
}

export async function createTransaction(data: {
  date: string;
  type: string;
  amount: number;
  description: string;
  paymentMethod: string;
  categoryId?: string;
  partnerId?: string;
}) {
  await prisma.transaction.create({
    data: {
      date: new Date(data.date),
      type: data.type,
      amount: data.amount,
      description: data.description,
      paymentMethod: data.paymentMethod,
      categoryId: data.categoryId,
      partnerId: data.partnerId,
    }
  })
  revalidatePath('/')
  revalidatePath('/transactions')
  revalidatePath('/expenses')
  revalidatePath('/partners')
}

// Partners
export async function getPartners() {
  return prisma.partner.findMany()
}

// Categories
export async function getCategories() {
  return prisma.category.findMany()
}

// Inventory
export async function getInventoryBatches() {
  return prisma.inventoryBatch.findMany({
    include: { product: true },
    orderBy: { createdAt: 'desc' }
  })
}

// Sales
export async function getSales() {
  return prisma.sale.findMany({
    include: { items: { include: { product: true } } },
    orderBy: { date: 'desc' }
  })
}

// Dashboard Aggregation Logic
export async function getDashboardStats() {
  const transactions = await prisma.transaction.findMany({
    include: { partner: true, category: true }
  })
  
  const partners = await prisma.partner.findMany()
  const inventory = await prisma.inventoryBatch.findMany()

  let totalCapital = 0
  let totalExpenses = 0
  let cashOutTotal = 0

  transactions.forEach((tx) => {
    if (tx.type === 'CAPITAL') totalCapital += tx.amount
    if (['EXPENSE'].includes(tx.type)) totalExpenses += tx.amount
    if (['EXPENSE', 'ASSET_PURCHASE', 'INVENTORY_PURCHASE', 'WITHDRAWAL'].includes(tx.type)) {
      cashOutTotal += tx.amount
    }
  })

  const availableCash = totalCapital - cashOutTotal
  const inventoryValue = inventory.reduce((acc, batch) => acc + (batch.quantityRemaining * batch.unitCost), 0)
  const netProfit = 0 - totalExpenses

  return {
    transactions,
    partners,
    stats: {
      totalCapital,
      availableCash,
      inventoryValue,
      netProfit
    }
  }
}

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

// Inventory & Products
export async function getProducts() {
  return prisma.product.findMany({
    orderBy: { createdAt: 'desc' }
  })
}

export async function createProduct(data: {
  sku: string;
  name: string;
  description?: string;
  imageUrl?: string;
  price: number;
}) {
  await prisma.product.create({
    data
  })
  revalidatePath('/inventory')
}

export async function getInventoryBatches() {
  return prisma.inventoryBatch.findMany({
    include: { product: true },
    orderBy: { createdAt: 'desc' }
  })
}

export async function createInventoryBatch(data: {
  productId: string;
  quantityPurchased: number;
  unitCost: number;
  supplier?: string;
  purchaseDate: string;
}) {
  await prisma.inventoryBatch.create({
    data: {
      productId: data.productId,
      quantityPurchased: data.quantityPurchased,
      quantityRemaining: data.quantityPurchased, // initially, remaining is same as purchased
      unitCost: data.unitCost,
      supplier: data.supplier,
      purchaseDate: new Date(data.purchaseDate)
    }
  })
  revalidatePath('/inventory')
  revalidatePath('/')
}

// Sales
export async function getSales() {
  return prisma.sale.findMany({
    include: { items: true },
    orderBy: { date: 'desc' }
  })
}

export async function createSale(data: {
  date: string;
  customerName?: string;
  items: { productId: string; quantity: number; pricePerUnit: number }[];
  discountAmount?: number;
  shippingCharge?: number;
  paymentMethod: string;
}) {
  await prisma.$transaction(async (tx) => {
    const saleItemsData: any[] = [];
    
    // 1. Deduct inventory and calculate COGS (FIFO)
    for (const item of data.items) {
      const batches = await tx.inventoryBatch.findMany({
        where: { productId: item.productId, quantityRemaining: { gt: 0 } },
        orderBy: { purchaseDate: 'asc' }
      });
      
      let remainingToDeduct = item.quantity;
      for (const batch of batches) {
        if (remainingToDeduct <= 0) break;
        
        const deductAmount = Math.min(batch.quantityRemaining, remainingToDeduct);
        
        await tx.inventoryBatch.update({
          where: { id: batch.id },
          data: { quantityRemaining: batch.quantityRemaining - deductAmount }
        });
        
        saleItemsData.push({
          productId: item.productId,
          quantity: deductAmount,
          unitPrice: item.pricePerUnit,
          unitCost: batch.unitCost,
          inventoryBatchId: batch.id
        });
        
        remainingToDeduct -= deductAmount;
      }
      
      if (remainingToDeduct > 0) {
        throw new Error(`Not enough stock for product ID: ${item.productId}`);
      }
    }
    
    // 2. Calculate totals
    const subtotal = data.items.reduce((acc, item) => acc + (item.quantity * item.pricePerUnit), 0);
    const totalAmount = subtotal + (data.shippingCharge || 0) - (data.discountAmount || 0);
    
    // 3. Create Sale
    const sale = await tx.sale.create({
      data: {
        date: new Date(data.date),
        customerName: data.customerName,
        totalAmount,
        discountAmount: data.discountAmount || 0,
        shippingCharge: data.shippingCharge || 0,
        items: {
          create: saleItemsData
        }
      }
    });
    
    // 4. Create Income Transaction
    let revCategory = await tx.category.findFirst({ where: { name: 'Sales Revenue' } });
    if (!revCategory) {
      revCategory = await tx.category.create({ data: { name: 'Sales Revenue', type: 'INCOME' } });
    }
    
    await tx.transaction.create({
      data: {
        date: new Date(data.date),
        type: 'SALE',
        amount: totalAmount,
        description: `Sale #${sale.id.slice(0, 8).toUpperCase()}`,
        paymentMethod: data.paymentMethod,
        categoryId: revCategory.id,
        saleId: sale.id
      }
    });
  });
  
  revalidatePath("/sales");
  revalidatePath("/inventory");
  revalidatePath("/transactions");
  revalidatePath("/");
}

// Partners Creation
export async function createPartner(data: { name: string }) {
  await prisma.partner.create({ data });
  revalidatePath('/partners');
  revalidatePath('/transactions');
}

// Category Creation
export async function createCategory(data: { name: string; type: string }) {
  await prisma.category.create({ data });
  revalidatePath('/transactions');
}


// Dashboard Aggregation Logic
export async function getDashboardStats() {
  const transactions = await prisma.transaction.findMany({
    include: { partner: true, category: true }
  })
  
  const partners = await prisma.partner.findMany()
  const inventory = await prisma.inventoryBatch.findMany()
  const products = await prisma.product.findMany()
  const salesRaw = await prisma.sale.findMany({
    include: { items: true }
  })

  // Map products to sale items since the relation isn't in Prisma schema yet
  const sales = salesRaw.map(sale => ({
    ...sale,
    items: sale.items.map(item => ({
      ...item,
      product: products.find(p => p.id === item.productId) || { id: item.productId, name: 'Unknown Product', price: 0 } as any
    }))
  }))

  let totalCapital = 0
  let totalExpenses = 0
  let cashOutTotal = 0
  let totalRevenue = 0
  let totalCogs = 0

  transactions.forEach((tx) => {
    if (tx.type === 'CAPITAL') totalCapital += tx.amount
    if (['EXPENSE'].includes(tx.type)) totalExpenses += tx.amount
    if (['EXPENSE', 'ASSET_PURCHASE', 'INVENTORY_PURCHASE', 'WITHDRAWAL'].includes(tx.type)) {
      cashOutTotal += tx.amount
    }
  })

  sales.forEach(sale => {
    totalRevenue += sale.totalAmount
    sale.items.forEach(item => {
      totalCogs += (item.quantity * item.unitCost)
    })
  })

  const availableCash = totalCapital + totalRevenue - cashOutTotal
  const inventoryValue = inventory.reduce((acc, batch) => acc + (batch.quantityRemaining * batch.unitCost), 0)
  const netProfit = totalRevenue - totalCogs - totalExpenses

  return {
    transactions,
    partners,
    sales,
    stats: {
      totalCapital,
      availableCash,
      inventoryValue,
      netProfit,
      totalRevenue
    }
  }
}

// Deletion Actions
export async function deleteTransaction(id: string) {
  const tx = await prisma.transaction.findUnique({ where: { id } });
  if (tx?.saleId) {
    throw new Error("Cannot delete a transaction linked to a Sale. Delete the Sale instead.");
  }
  
  await prisma.transaction.delete({ where: { id } });
  revalidatePath('/');
  revalidatePath('/transactions');
  revalidatePath('/expenses');
  revalidatePath('/partners');
}

export async function deleteProduct(id: string) {
  // Products with inventory batches shouldn't be deleted easily without cascading
  // But for simple operations we allow it
  await prisma.product.delete({ where: { id } });
  revalidatePath('/inventory');
}

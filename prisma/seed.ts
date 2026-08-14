import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'

const connectionString = process.env.DATABASE_URL
const pool = new Pool({ connectionString })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('Seeding database...')

  // Clear existing
  await prisma.saleItem.deleteMany()
  await prisma.sale.deleteMany()
  await prisma.transaction.deleteMany()
  await prisma.inventoryBatch.deleteMany()
  await prisma.product.deleteMany()
  await prisma.category.deleteMany()
  await prisma.partner.deleteMany()

  // 1. Create Partners
  const p1 = await prisma.partner.create({
    data: { id: 'p1', name: 'Top Magar', totalContributed: 12936300 },
  })
  const p2 = await prisma.partner.create({
    data: { id: 'p2', name: 'Romeo Magar', totalContributed: 8475100 },
  })

  // 2. Create Categories
  const catPackaging = await prisma.category.create({
    data: { id: 'c1', name: 'Packaging', type: 'EXPENSE' },
  })
  const catTransport = await prisma.category.create({
    data: { id: 'c2', name: 'Transport & Logistics', type: 'EXPENSE' },
  })
  const catMarketing = await prisma.category.create({
    data: { id: 'c3', name: 'Marketing & Ads', type: 'EXPENSE' },
  })

  // 3. Create Products and Inventory
  const prod1 = await prisma.product.create({
    data: { id: 'prod1', name: 'Unchaptrd Oversized Tee', sku: 'TEE-OS-BLK', price: 450000 },
  })
  
  await prisma.inventoryBatch.create({
    data: {
      id: 'batch1',
      productId: prod1.id,
      quantityPurchased: 100,
      quantityRemaining: 100,
      unitCost: 150000,
      supplier: 'Nepal Garments Inc',
    }
  })

  // 4. Create Initial Transactions
  await prisma.transaction.create({
    data: {
      date: new Date('2024-01-15T00:00:00Z'),
      type: 'CAPITAL',
      amount: 12936300,
      description: 'Initial Capital Injection',
      paymentMethod: 'Bank Transfer',
      partnerId: p1.id,
    }
  })

  await prisma.transaction.create({
    data: {
      date: new Date('2024-01-16T00:00:00Z'),
      type: 'CAPITAL',
      amount: 8475100,
      description: 'Initial Capital Injection',
      paymentMethod: 'Bank Transfer',
      partnerId: p2.id,
    }
  })

  await prisma.transaction.create({
    data: {
      date: new Date('2024-02-01T00:00:00Z'),
      type: 'EXPENSE',
      amount: 450000,
      description: 'Custom Polymailers',
      paymentMethod: 'Credit Card',
      categoryId: catPackaging.id,
    }
  })

  await prisma.transaction.create({
    data: {
      date: new Date('2024-02-15T00:00:00Z'),
      type: 'INVENTORY_PURCHASE',
      amount: 15000000, // 100 units * 1500
      description: 'Blank Tees Order',
      paymentMethod: 'Bank Transfer',
    }
  })

  console.log('Seeding finished.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

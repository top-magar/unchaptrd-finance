export type TransactionType = 
  | 'CAPITAL'
  | 'EXPENSE'
  | 'ASSET_PURCHASE'
  | 'INVENTORY_PURCHASE'
  | 'SALE'
  | 'WITHDRAWAL'
  | 'REFUND';

export interface Partner {
  id: string;
  name: string;
  totalContributed: number;
}

export interface ExpenseCategory {
  id: string;
  name: string;
  isOperatingExpense: boolean;
}

export interface Transaction {
  id: string;
  date: string; // ISO String
  type: TransactionType;
  amount: number; // Stored in cents for accuracy (e.g. 10000 = $100.00)
  description: string;
  paymentMethod: string;
  categoryId?: string; // Links to ExpenseCategory
  partnerId?: string; // Links to Partner
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  sellingPrice: number;
}

export interface InventoryBatch {
  id: string;
  productId: string;
  quantityPurchased: number;
  quantityRemaining: number;
  unitCost: number;
  purchaseDate: string;
  supplier: string;
}

export interface Asset {
  id: string;
  transactionId: string;
  name: string;
  purchasePrice: number;
  currentStatus: string;
}

export interface SaleItem {
  id: string;
  saleId: string;
  inventoryBatchId: string;
  quantity: number;
  unitPrice: number;
  unitCost: number; // Historical COGS at time of sale
}

export interface Sale {
  id: string;
  transactionId: string;
  customerName: string;
  discountAmount: number;
  shippingCharge: number;
  totalAmount: number;
  items: SaleItem[];
}

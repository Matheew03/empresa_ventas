export type ProductCategory =
    | 'Electronica'
    | 'Ropa'
    | 'Alimentos'
    | 'Hogar'
    | 'Herramientas';

export type StockStatus = 'in-stock' | 'low-stock' | 'out-of-stock';

export interface Product {
    id: number;
    name: string;
    sku: string;
    category: ProductCategory;
    price: number;
    stock: number;
    imageUrl: string;
    description: string;
}

export interface ProductWithStatus extends Product {
    stockStatus: StockStatus;
}

export interface PriceAuditRecord {
    id: number;
    productId: number;
    productName: string;
    sku: string;
    oldPrice: number;
    newPrice: number;
    percentChange: number;
    changedAt: Date;
    changedBy: string;
}
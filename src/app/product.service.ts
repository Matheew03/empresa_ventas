import { Injectable, computed, signal } from '@angular/core';
import {
    PriceAuditRecord,
    Product,
    ProductWithStatus,
    StockStatus,
} from './product.model';

const SEED_PRODUCTS: Product[] = [
    {
        id: 1,
        name: 'Laptop Pro 15"',
        sku: 'EL-LAP-001',
        category: 'Electronica',
        price: 1299.99,
        stock: 14,
        imageUrl: 'https://placehold.co/80x80/3b82f6/ffffff?text=+',
        description: 'Laptop de alto rendimiento con pantalla 4K y 32 GB RAM.',
    },
    {
        id: 2,
        name: 'Auriculares BT Studio',
        sku: 'EL-AUR-002',
        category: 'Electronica',
        price: 249.99,
        stock: 3,
        imageUrl: 'https://placehold.co/80x80/8b5cf6/ffffff?text=+',
        description: 'Auriculares inalambricos con cancelacion activa de ruido.',
    },
    {
        id: 3,
        name: 'Camiseta Corporate',
        sku: 'RO-CAM-003',
        category: 'Ropa',
        price: 34.99,
        stock: 0,
        imageUrl: 'https://placehold.co/80x80/10b981/ffffff?text=+',
        description: 'Camiseta de algodon premium con bordado corporativo.',
    },
    {
        id: 4,
        name: 'Cafe Arabica 500g',
        sku: 'AL-CAF-004',
        category: 'Alimentos',
        price: 18.50,
        stock: 120,
        imageUrl: 'https://placehold.co/80x80/f59e0b/ffffff?text=+',
        description: 'Cafe de especialidad de origen unico, tostado medio.',
    },
    {
        id: 5,
        name: 'Silla Ergonomica Flex',
        sku: 'HO-SIL-005',
        category: 'Hogar',
        price: 599.00,
        stock: 7,
        imageUrl: 'https://placehold.co/80x80/ef4444/ffffff?text=+',
        description: 'Silla de oficina con soporte lumbar ajustable 4D.',
    },
    {
        id: 6,
        name: 'Taladro Inalambrico 20V',
        sku: 'HE-TAL-006',
        category: 'Herramientas',
        price: 129.99,
        stock: 2,
        imageUrl: 'https://placehold.co/80x80/64748b/ffffff?text=+',
        description: 'Taladro percutor con bateria de litio y maletin.',
    },
];

function resolveStockStatus(stock: number): StockStatus {
    if (stock === 0) return 'out-of-stock';
    if (stock <= 5) return 'low-stock';
    return 'in-stock';
}

@Injectable({ providedIn: 'root' })
export class ProductService {
    private readonly _products = signal<Product[]>(
        SEED_PRODUCTS.map((p) => ({ ...p }))
    );
    private readonly _auditLog = signal<PriceAuditRecord[]>([]);
    private _auditIdCounter = 1;

    readonly catalog = computed<ProductWithStatus[]>(() =>
        this._products().map((p) => ({
            ...p,
            stockStatus: resolveStockStatus(p.stock),
        }))
    );

    readonly auditLog = computed<PriceAuditRecord[]>(() =>
        [...this._auditLog()].reverse()
    );

    readonly stats = computed(() => {
        const products = this._products();
        return {
            total: products.length,
            outOfStock: products.filter((p) => p.stock === 0).length,
            lowStock: products.filter((p) => p.stock > 0 && p.stock <= 5).length,
            inventoryValue: products.reduce((acc, p) => acc + p.price * p.stock, 0),
        };
    });

    updatePrice(productId: number, newPrice: number): void {
        const current = this._products().find((p) => p.id === productId);
        if (!current || newPrice < 0 || newPrice === current.price) return;

        const oldPrice = current.price;
        const percentChange = ((newPrice - oldPrice) / oldPrice) * 100;

        this._products.update((list) =>
            list.map((p) => (p.id === productId ? { ...p, price: newPrice } : p))
        );

        const record: PriceAuditRecord = {
            id: this._auditIdCounter++,
            productId,
            productName: current.name,
            sku: current.sku,
            oldPrice,
            newPrice,
            percentChange,
            changedAt: new Date(),
            changedBy: 'admin@empresa.com',
        };

        this._auditLog.update((log) => [...log, record]);
    }

    updateStock(productId: number, delta: number): void {
        this._products.update((list) =>
            list.map((p) =>
                p.id === productId
                    ? { ...p, stock: Math.max(0, p.stock + delta) }
                    : p
            )
        );
    }
}
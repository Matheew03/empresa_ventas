import {
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductService } from './product.service';
import { ProductWithStatus } from './product.model';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule, CurrencyPipe, DatePipe, DecimalPipe],
  templateUrl: './app.html',
  styleUrls: ['./app.css'],
})
export class App {
  private readonly productService = inject(ProductService);

  readonly catalog = this.productService.catalog;
  readonly auditLog = this.productService.auditLog;
  readonly stats = this.productService.stats;

  editingProductId = signal<number | null>(null);
  editingPrice = signal<number>(0);

  selectedCategory = signal<string>('Todas');

  readonly categories = ['Todas', 'Electronica', 'Ropa', 'Alimentos', 'Hogar', 'Herramientas'];

  readonly filteredCatalog = computed(() => {
    const cat = this.selectedCategory();
    return cat === 'Todas'
      ? this.catalog()
      : this.catalog().filter((p) => p.category === cat);
  });

  startEdit(product: ProductWithStatus): void {
    this.editingProductId.set(product.id);
    this.editingPrice.set(product.price);
  }

  cancelEdit(): void {
    this.editingProductId.set(null);
  }

  confirmEdit(productId: number): void {
    const newPrice = Number(this.editingPrice());
    if (!isNaN(newPrice) && newPrice > 0) {
      this.productService.updatePrice(productId, newPrice);
    }
    this.editingProductId.set(null);
  }

  adjustStock(productId: number, delta: number): void {
    this.productService.updateStock(productId, delta);
  }

  isEditing(productId: number): boolean {
    return this.editingProductId() === productId;
  }

  getStockLabel(status: string): string {
    const map: Record<string, string> = {
      'in-stock': 'En stock',
      'low-stock': 'Stock bajo',
      'out-of-stock': 'Agotado',
    };
    return map[status] ?? status;
  }
}
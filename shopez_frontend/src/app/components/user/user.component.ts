import { Component } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-user',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './user.component.html',
  styleUrl: './user.component.css'
})
export class UserComponent {
  allProducts: any[] = [];
  filteredList: any[] = [];
  orders: any[] = [];
  userId = Number(localStorage.getItem('userId'));
  user: any;
  searchText = '';
  selectedCategory = 'All';
  showOrders = false;
  expandedDescriptions: Record<number, boolean> = {};

  categories: string[] = ['All', 'Mobiles', 'Electronics', 'Home Needs', 'Toys', 'Fashion', 'Laptops'];

  constructor(
    private api: ApiService,
    private router: Router,
    private toast: ToastService
  ) {}

  ngOnInit() {
    this.user = JSON.parse(localStorage.getItem('user') || '{}');
    this.userId = this.user?.id;
    this.loadProducts();
  }

  loadProducts() {
    this.api.getProducts().subscribe({
      next: (res: any) => {
        this.allProducts = (res || []).map((item: any) => ({
          ...item,
          cartQuantity: item.cartQuantity && item.cartQuantity > 0 ? item.cartQuantity : 1
        }));
        this.applyFilters();
      },
      error: (err) => {
        console.error(err);
        this.toast.error('Failed to load products');
      }
    });
  }

  toggleOrders() {
    this.showOrders = !this.showOrders;

    if (this.showOrders) {
      this.loadMyOrders();
    }
  }

  loadMyOrders() {
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    this.api.getUserOrders(user.id).subscribe({
      next: (res: any) => {
        this.orders = res || [];
      },
      error: () => {
        this.toast.error('Failed to load orders');
      }
    });
  }

  setCategory(category: string) {
    this.selectedCategory = category;
    this.applyFilters();
  }

  applyFilters() {
    const search = this.searchText.trim().toLowerCase();

    this.filteredList = this.allProducts.filter((p: any) => {
      const matchCategory = this.selectedCategory === 'All' || p.category === this.selectedCategory;
      const matchSearch =
        !search ||
        p.name?.toLowerCase().includes(search) ||
        p.category?.toLowerCase().includes(search);

      return matchCategory && matchSearch;
    });
  }

  toggleDescription(productId: number) {
    this.expandedDescriptions[productId] = !this.expandedDescriptions[productId];
  }

  isDescriptionExpanded(productId: number): boolean {
    return !!this.expandedDescriptions[productId];
  }

  increaseQty(product: any) {
    const stock = Number(product.quantity || 0);
    const current = Number(product.cartQuantity || 1);

    if (current < stock) {
      product.cartQuantity = current + 1;
    }
  }

  decreaseQty(product: any) {
    const current = Number(product.cartQuantity || 1);
    if (current > 1) {
      product.cartQuantity = current - 1;
    }
  }

  onQtyInput(product: any) {
    const stock = Number(product.quantity || 0);
    let value = Number(product.cartQuantity || 1);

    if (isNaN(value) || value < 1) value = 1;
    if (stock > 0 && value > stock) value = stock;

    product.cartQuantity = value;
  }

  addToCart(product: any) {
    if (!product.quantity || product.quantity <= 0) {
      this.toast.error('This product is out of stock');
      return;
    }

    const chosenQty = Number(product.cartQuantity || 1);

    if (chosenQty > Number(product.quantity)) {
      this.toast.error('Selected quantity is greater than available stock');
      return;
    }

    const payload = {
      userId: this.user.id,
      product: { id: product.id },
      quantity: chosenQty
    };

    this.api.addCart(payload).subscribe({
      next: () => {
        this.toast.success('Added to cart successfully');
        product.cartQuantity = 1;
      },
      error: (err) => {
        console.error(err);
        this.toast.error('Failed to add to cart');
      }
    });
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('userId');
    localStorage.removeItem('role');

    sessionStorage.clear();
    localStorage.clear();
    this.router.navigate(['/login']);
  }

  goToOrders() {
    this.router.navigate(['/my-orders']);
  }
}

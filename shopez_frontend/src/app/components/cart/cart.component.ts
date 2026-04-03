import { Component } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './cart.component.html'
})
export class CartComponent {
  cart: any[] = [];
  totalAmount = 0;
  user: any;
  placingOrder = false;

  constructor(
    private api: ApiService,
    private router: Router,
    private toast: ToastService
  ) {}

  ngOnInit() {
    this.user = JSON.parse(localStorage.getItem('user') || '{}');
    this.loadCart();
  }

  loadCart() {
    this.api.getCart(this.user.id).subscribe({
      next: (res: any) => {
        this.cart = res || [];
        this.calculateTotal();
      },
      error: (err) => {
        console.error(err);
        this.toast.error('Failed to load cart');
      }
    });
  }

  remove(id: any) {
    const cartId = Number(id);

    this.api.removeCart(cartId).subscribe({
      next: () => {
        this.cart = this.cart.filter(item => Number(item.id) !== cartId);
        this.calculateTotal();
        this.toast.success('Item removed from cart');
      },
      error: (err) => {
        console.error(err);
        this.toast.error('Failed to remove item from cart');
      }
    });
  }

  calculateTotal() {
    this.totalAmount = this.cart.reduce(
      (sum, item) => sum + (item.product?.price || 0) * item.quantity,
      0
    );
  }

  placeOrder() {
    this.placingOrder = true;

    this.api.placeOrder(this.user.id).subscribe({
      next: (res: any) => {
        this.placingOrder = false;
        this.cart = [];
        this.totalAmount = 0;
        alert(res?.message || 'Order placed successfully');
        this.router.navigate(['/user']);
      },
      error: (err) => {
        this.placingOrder = false;
        console.error(err);
        this.toast.error('Order failed');
      }
    });
  }

  goBack() {
    this.router.navigate(['/user']);
  }
}

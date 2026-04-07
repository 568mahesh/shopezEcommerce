import { Component } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './cart.component.html',
   styleUrl: './cart.component.css'
})
export class CartComponent {
  cart: any[] = [];
  totalAmount = 0;
  user: any;
  cartItems: any[] = [];

currentPage: number = 0;
totalPages: number = 0;
pageSize: number = 5;

userId: number = Number(localStorage.getItem('userId'));
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

  loadCart(page: number = 0) {

    this.api.getCart(this.userId, page, this.pageSize).subscribe({
      next: (res: any) => {
        this.cart = res.content;
        this.currentPage = res.number;
        this.totalPages = res.totalPages;
  
        this.loadTotal(); // 🔥 ADD THIS LINE
      },
      error: (err) => {
        console.error(err);
      }
    });
  
  }

  loadTotal() {
    this.api.getCartTotal(this.userId).subscribe((res: any) => {
      this.totalAmount = res;
    });
  }

  nextPage() {
    if (this.currentPage + 1 < this.totalPages) {
      this.loadCart(this.currentPage + 1);
    }
  }
  
  prevPage() {
    if (this.currentPage > 0) {
      this.loadCart(this.currentPage - 1);
    }
  }

  remove(id: any) {

    const cartId = Number(id);
  
    this.api.removeCart(cartId).subscribe({
      next: () => {
  
        this.toast.success('Item removed from cart');
  
        // 🔥 IMPORTANT FIX
        this.loadCartAfterDelete();
  
      },
      error: (err) => {
        console.error(err);
        this.toast.error('Failed to remove item from cart');
      }
    });
  
  }
  loadCartAfterDelete() {

    this.api.getCart(this.userId, this.currentPage, this.pageSize).subscribe({
      next: (res: any) => {
  
        // 🔥 MAIN FIX
        if (this.currentPage >= res.totalPages && this.currentPage > 0) {
  
          this.currentPage = this.currentPage - 1;
  
          this.loadCart(this.currentPage);
  
        } else {
  
          this.cart = res.content;
          this.totalPages = res.totalPages;
          this.currentPage = res.number;
  
          this.loadTotal(); // keep total correct
  
        }
  
      },
      error: (err) => {
        console.error(err);
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

import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../../services/api.service'; 
import { Router } from '@angular/router';
import { ToastService } from '../../../services/toast.service'; 

@Component({
  selector: 'app-my-orders',
  imports: [CommonModule],
  templateUrl: './my-orders.component.html',
  styleUrl: './my-orders.component.css'
})
export class MyOrdersComponent {

  orders: any[] = [];
  user: any;

  currentPage: number = 1;
  itemsPerPage: number = 5;

  constructor(
    private api: ApiService,
    private router: Router,
    private toast: ToastService
  ) {}

  ngOnInit() {
    this.user = JSON.parse(localStorage.getItem('user') || '{}');
    this.loadOrders();
  }

  loadOrders() {
    
    this.api.getUserOrders(this.user.id).subscribe((res: any) => {
      this.orders = res || [];
    });
  }

  // PAGINATION
  get paginatedOrders() {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    return this.orders.slice(start, start + this.itemsPerPage);
  }

  nextPage() {
    if (this.currentPage * this.itemsPerPage < this.orders.length) {
      this.currentPage++;
    }
  }

  prevPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  cancelOrder(id: number) {

    this.api.deleteOrder(id).subscribe({
      next: () => {
  
        // ✅ reload data properly
        this.loadOrders();
  
        this.toast.success('Order cancelled');
  
      },
      error: (err) => {
        console.error(err);
        this.toast.error('Cancel failed');
      }
    });
  }


  goBack() {
    this.router.navigate(['/user']);
  }
}
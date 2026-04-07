import { Component } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { ToastService } from '../../services/toast.service';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterModule],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.css'
})
export class AdminComponent {
  activeTab: 'products' | 'users' | 'add-product' | 'orders' = 'products';
  categoryOptions: string[] = ['Mobiles', 'Electronics', 'Home Needs', 'Toys', 'Fashion', 'Laptops'];

  product: any = this.getEmptyProduct();
  editingProductId: number | null = null;
  products: any[] = [];
  orders: any[] = [];
  users: any[] = [];
  filteredOrders: any[] = [];

searchText: string = '';
statusFilter: string = 'ALL';
  editingUserId: number | null = null;
  userForm: any = {};

  userCurrentPage: number = 0;   // backend page starts from 0
  userTotalPages: number = 0;
  userPageSize: number = 5;
  
  selectedRole: string = 'all';
  
  submitted = false;
  currentPage: number = 1;
itemsPerPage: number = 8;

  constructor(
    private api: ApiService,
    private router: Router,
    private toast: ToastService,
    private http: HttpClient 
  ) {}

  ngOnInit() {
    this.loadProducts();
    this.loadOrders();
    setInterval(() => {
      if (this.activeTab === 'orders') {
        this.loadOrders();
      }
    }, 15000);
  }

  getEmptyProduct() {
    return {
      name: '',
      description: '',
      price: '',
      category: '',
      image: '',
      quantity: ''
    };
  }

  switchTab(tab: 'products' | 'users' | 'add-product'| 'orders') {
    this.activeTab = tab;
    this.submitted = false;
    if (tab === 'products') this.loadProducts();
    if (tab === 'users') this.loadUsers(0);
    if(tab === 'orders') this.loadOrders();
    if (tab === 'add-product') this.cancelEditProduct();
  }

  loadProducts() {
    this.api.getProducts().subscribe({
      next: (res: any) => {
        this.products = res || [];
      },
      error: (err) => {
        console.error(err);
        this.toast.error('Failed to load products');
      }
    });
  }
  loadUsers(page: number = 0) {

    this.api.getUsers(page, this.userPageSize, this.selectedRole).subscribe({
      next: (res: any) => {
        this.users = res.content;          // ✅ important
        this.userCurrentPage = res.number; // current page
        this.userTotalPages = res.totalPages;
      },
      error: (err) => {
        console.error(err);
        this.toast.error('Failed to load users');
      }
    });
  
  }
 
  loadOrders() {
    this.api.getAllOrders().subscribe((data: any) => {
      this.orders = data;
      this.applyFilter();
    });
  }
  
// 🔍 SEARCH + FILTER
applyFilter() {

  this.filteredOrders = this.orders.filter(o => {

    const matchUser = o.username
      .toLowerCase()
      .includes(this.searchText.toLowerCase());

    const matchStatus =
      this.statusFilter === 'ALL' ||
      o.status === this.statusFilter;

    return matchUser && matchStatus;
  });

  this.currentPage = 1;
}


//PAGINATION
get paginatedOrders() {
  const start = (this.currentPage - 1) * this.itemsPerPage;
  return this.filteredOrders.slice(start, start + this.itemsPerPage);
}

nextPage() {
  if (this.currentPage * this.itemsPerPage < this.filteredOrders.length) {
    this.currentPage++;
  }
}

prevPage() {
  if (this.currentPage > 1) {
    this.currentPage--;
  }
}

nextUserPage() {
  if (this.userCurrentPage + 1 < this.userTotalPages) {
    this.loadUsers(this.userCurrentPage + 1);
  }
}

prevUserPage() {
  if (this.userCurrentPage > 0) {
    this.loadUsers(this.userCurrentPage - 1);
  }
}

 
  updateStatus(id: number, status: string) {
    this.api.updateOrderStatus(id, status).subscribe({
      next: () => {
  
        // ✅ update UI immediately
        const order = this.orders.find(o => o.id === id);
        if (order) {
          order.status = status;
        }
        this.applyFilter();
      },
      error: (err) => {
        console.error(err);
        this.toast.error('Failed to update order');
      }
    });
  }
  

  saveProduct() {
    this.submitted = true;

    if (
      !this.product.name ||
      !this.product.description ||
      !this.product.price ||
      !this.product.category ||
      !this.product.image ||
      !this.product.quantity
    ) {
      this.toast.error('Please fill all product fields');
      return;
    }

    const payload = {
      ...this.product,
      price: Number(this.product.price),
      quantity: Number(this.product.quantity)
    };

    const request = this.editingProductId
      ? this.api.updateProduct(this.editingProductId, payload)
      : this.api.addProduct(payload);

    request.subscribe({
      next: () => {
        this.toast.success(this.editingProductId ? 'Product updated successfully' : 'Product added successfully');
        this.product = this.getEmptyProduct();
        this.editingProductId = null;
        this.submitted = false;
        this.activeTab = 'products';
        this.loadProducts();
      },
      error: (err) => {
        console.error(err);
        this.toast.error('Failed to save product');
      }
    });
  }

  editProduct(product: any) {
    this.product = { ...product };
    this.editingProductId = product.id;
    this.activeTab = 'add-product';
  }

  cancelEditProduct() {
    this.product = this.getEmptyProduct();
    this.editingProductId = null;
  }

  deleteProduct(id: number) {
    this.api.deleteProduct(id).subscribe({
      next: () => {
        this.toast.success('Product deleted successfully');
        this.loadProducts();
      },
      error: (err) => {
        console.error(err);
        this.toast.error('Failed to delete product');
      }
    });
  }

  startEditUser(user: any) {
    this.editingUserId = user.id;
    this.userForm = { ...user, password: '' };
  }

  cancelEditUser() {
    this.editingUserId = null;
    this.userForm = {};
  }

  saveUser() {
    if (!this.editingUserId) return;

    this.api.updateUser(this.editingUserId, this.userForm).subscribe({
      next: () => {
        this.toast.success('User updated successfully');
        this.cancelEditUser();
        this.loadUsers(this.userCurrentPage);
      },
      error: (err) => {
        console.error(err);
        this.toast.error('Failed to update user');
      }
    });
  }

  deleteUser(id: number) {
    this.api.deleteUser(id).subscribe({
      next: () => {
        this.toast.success('User deleted successfully');
        this.loadUsers(this.userCurrentPage);
      },
      error: (err) => {
        console.error(err);
        this.toast.error('Failed to delete user');
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
  
}

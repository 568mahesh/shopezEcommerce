import { Component } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterModule],
  templateUrl: './admin.component.html'
})
export class AdminComponent {
  activeTab: 'products' | 'users' | 'add-product' = 'products';
  categoryOptions: string[] = ['Mobiles', 'Electronics', 'Home Needs', 'Toys', 'Fashion', 'Laptops'];

  product: any = this.getEmptyProduct();
  editingProductId: number | null = null;
  products: any[] = [];

  users: any[] = [];
  editingUserId: number | null = null;
  userForm: any = {};

  submitted = false;

  constructor(
    private api: ApiService,
    private router: Router,
    private toast: ToastService
  ) {}

  ngOnInit() {
    this.loadProducts();
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

  switchTab(tab: 'products' | 'users' | 'add-product') {
    this.activeTab = tab;
    this.submitted = false;
    if (tab === 'products') this.loadProducts();
    if (tab === 'users') this.loadUsers();
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

  loadUsers() {
    this.api.getUsers().subscribe({
      next: (res: any) => {
        this.users = res || [];
      },
      error: (err) => {
        console.error(err);
        this.toast.error('Failed to load users');
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
        this.loadUsers();
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
        this.loadUsers();
      },
      error: (err) => {
        console.error(err);
        this.toast.error('Failed to delete user');
      }
    });
  }

  logout() {
    localStorage.clear();
    this.router.navigate(['/login']);
  }
}

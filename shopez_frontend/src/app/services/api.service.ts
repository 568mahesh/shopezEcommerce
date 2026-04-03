import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ApiService {
  baseUrl = 'http://localhost:8082';

  constructor(private http: HttpClient) {}

  register(data: any) {
    return this.http.post(this.baseUrl + '/auth/register', data);
  }

  login(data: any) {
    return this.http.post(this.baseUrl + '/auth/login', data);
  }
  

  getProducts() {
    return this.http.get(this.baseUrl + '/user/products');
  }

  getProductsByCategory(category: string) {
    return this.http.get(this.baseUrl + '/user/products/category/' + encodeURIComponent(category));
  }

  addProduct(data: any) {
    return this.http.post(this.baseUrl + '/admin/add', data);
  }

  updateProduct(id: number, data: any) {
    return this.http.put(this.baseUrl + '/admin/edit/' + id, data);
  }

  deleteProduct(id: number) {
    return this.http.delete(this.baseUrl + '/admin/delete/' + id);
  }

  getUsers() {
    return this.http.get(this.baseUrl + '/admin/users');
  }

  updateUser(id: number, data: any) {
    return this.http.put(this.baseUrl + '/admin/users/' + id, data);
  }

  deleteUser(id: number) {
    return this.http.delete(this.baseUrl + '/admin/users/' + id);
  }

  addCart(data: any) {
    return this.http.post(this.baseUrl + '/user/cart', data);
  }

  getCart(userId: number) {
    return this.http.get(this.baseUrl + '/user/cart/' + userId);
  }

  removeCart(id: number) {
    return this.http.delete(this.baseUrl + '/user/cart/' + id);
  }

  placeOrder(userId: number) {
    return this.http.post(this.baseUrl + '/user/order/' + userId, {});
  }

  getUserOrders(userId: number) {
    return this.http.get(`http://localhost:8082/user/orders/${userId}`);
  }
  
  getAllOrders() {
    return this.http.get(`http://localhost:8082/admin/orders`);
  }
  
  updateOrderStatus(id: number, status: string) {
    return this.http.put(`http://localhost:8082/admin/orders/${id}?status=${status}`, {});
  }
  deleteOrder(id: number) {
    return this.http.delete(
      `http://localhost:8082/user/orders/delete/${id}`,
      { responseType: 'text' }   // ✅ IMPORTANT FIX
    );
  }
}

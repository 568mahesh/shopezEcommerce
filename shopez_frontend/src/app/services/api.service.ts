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
  
  forgotPasswordByEmail(email: string) {
    // This sends { "email": "user@example.com" } in the body
    return this.http.post(`${this.baseUrl}/auth/forgot-password`, { email: email });
  }
  
  verifyAndResetPassword(data: any) {
    return this.http.post(`${this.baseUrl}/auth/reset-password`, data);
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

  /*getUsers() {
    return this.http.get(this.baseUrl + '/admin/users');
  }*/

    getUsers(page: number, size: number, role: string) {

      const token = localStorage.getItem('token'); // if using JWT
    
      return this.http.get(
        `http://localhost:8082/admin/users?page=${page}&size=${size}&role=${role}`,
        {
         /* headers: {
            Authorization: `Bearer ${token}`
          }*/
        }
      );
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

  getCartTotal(userId: number) {
    return this.http.get(
      `http://localhost:8082/user/cart/total/${userId}`
    );
  }

  getCart(userId: number, page: number, size: number) {
    const token = localStorage.getItem('token');
  
    return this.http.get(
      `http://localhost:8082/user/cart/${userId}?page=${page}&size=${size}`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
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

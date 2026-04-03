import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { AdminComponent } from './components/admin/admin.component';
import { UserComponent } from './components/user/user.component';
import { CartComponent } from './components/cart/cart.component';
import { adminGuard } from './guards/admin.guard';
import { userGuard } from './guards/user.guard';
import { guestGuard } from './guards/guest.guard';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'login', component: LoginComponent, canActivate: [guestGuard] },
  { path: 'register', component: RegisterComponent, canActivate: [guestGuard] },

  { path: 'admin', component: AdminComponent, canActivate: [adminGuard] },
  { path: 'user', component: UserComponent, canActivate: [userGuard] },
  { path: 'cart', component: CartComponent, canActivate: [userGuard] },
  {
    path: 'my-orders',
    loadComponent: () => import('./components/user/my-orders/my-orders.component')
      .then(m => m.MyOrdersComponent)
  },

  { path: '**', redirectTo: '' }
];

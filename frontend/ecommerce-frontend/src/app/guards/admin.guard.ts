import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

function isTokenExpired(token: string): boolean {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    if (!payload.exp) return false;
    return Date.now() >= payload.exp * 1000;
  } catch {
    return true;
  }
}

export const adminGuard: CanActivateFn = () => {
  const router = inject(Router);
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  if (!token || isTokenExpired(token)) {
    localStorage.clear();
    router.navigate(['/login']);
    return false;
  }

  if (user?.role !== 'ADMIN') {
    router.navigate(['/user']);
    return false;
  }

  return true;
};

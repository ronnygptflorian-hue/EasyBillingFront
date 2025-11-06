import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';

export const authGuard: CanActivateFn = async (route, state) => {
  const router = inject(Router);

  const mockUser = localStorage.getItem('User');

  if (mockUser) {
    return true;
  }

  router.navigate(['/login']);
  return false;
};

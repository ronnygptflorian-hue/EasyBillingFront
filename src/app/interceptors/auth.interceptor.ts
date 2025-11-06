import { HttpInterceptorFn } from '@angular/common/http';

function getTokenFromLocalStorage(): string | null {
  try {
    const raw = localStorage.getItem('User');
    if (!raw) return null;
    const user = JSON.parse(raw);
    // Ajusta el nombre según tu backend:
    return user?.accessToken ?? user?.token ?? user?.jwt ?? null;
  } catch {
    return null;
  }
}

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const urlLower = req.url.toLowerCase();
  const isLogin = urlLower.includes('/user/login');

  if (isLogin) {
    return next(req);
  }

  const token = getTokenFromLocalStorage();
  if (!token) {
    return next(req);
  }

  const authReq = req.clone({
    setHeaders: { Authorization: `Bearer ${token}` },
  });

  return next(authReq);
};

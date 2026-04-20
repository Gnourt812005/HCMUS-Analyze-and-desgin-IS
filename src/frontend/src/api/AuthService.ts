import { UserRole } from '@dormarch/shared';

export interface TokenPayload {
  email: string;
  role: UserRole;
  iat: number;
  exp: number;
}

export class AuthService {
  static getToken(): string | null {
    return localStorage.getItem('token');
  }

  static setToken(token: string): void {
    localStorage.setItem('token', token);
    // Trigger any reactive updates if necessary
    window.dispatchEvent(new Event('auth-change'));
  }

  static logout(): void {
    localStorage.removeItem('token');
    window.dispatchEvent(new Event('auth-change'));
  }

  static getUserInfo(): TokenPayload | null {
    const token = this.getToken();
    if (!token) return null;

    try {
      const payloadBase64 = token.split('.')[1];
      const decodedJson = atob(payloadBase64);
      return JSON.parse(decodedJson);
    } catch (e) {
      return null;
    }
  }

  static getRole(): UserRole | null {
    const user = this.getUserInfo();
    return user ? user.role : null;
  }

  static isLoggedIn(): boolean {
    return !!this.getToken();
  }

  static isAdmin(): boolean {
    return this.getRole() === UserRole.ADMIN;
  }

  static canAccessAdmin(): boolean {
    const role = this.getRole();
    return role === UserRole.ADMIN || role === UserRole.SALES_STAFF;
  }
}

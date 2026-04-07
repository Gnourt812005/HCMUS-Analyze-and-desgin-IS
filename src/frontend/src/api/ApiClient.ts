export class ApiClient {
  private static baseURL = import.meta.env.VITE_API_BASE_URL || '';

  /**
   * Core request function wrapping native fetch.
   * Auto-prepends baseURL, auto-attaches JSON Content-Type and Authorization token.
   * Auto-rejects Promise on non-2xx status codes extracting standard `message`.
   */
  private static async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;

    // Auto attach token from local storage
    const token = localStorage.getItem('token');

    // Construct headers natively
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (token) {
      (headers as any)['Authorization'] = `Bearer ${token}`;
    }

    const config: RequestInit = {
      ...options,
      headers,
    };

    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Lỗi kết nối API');
    }

    return data as T;
  }

  static get<T = any>(endpoint: string, options?: Omit<RequestInit, 'method'>): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  }

  static post<T = any>(endpoint: string, options?: Omit<RequestInit, 'method'>): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'POST' });
  }

  static put<T = any>(endpoint: string, options?: Omit<RequestInit, 'method'>): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'PUT' });
  }

  static delete<T = any>(endpoint: string, options?: Omit<RequestInit, 'method'>): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' });
  }

  static patch<T = any>(endpoint: string, options?: Omit<RequestInit, 'method'>): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'PATCH' });
  }
}

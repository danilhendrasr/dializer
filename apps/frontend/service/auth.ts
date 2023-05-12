import { ApiErrorResponse } from '@dializer/types';
import { ApiService } from './base';

export class AuthService extends ApiService {
  private static instance: AuthService;

  static getInstance() {
    if (this.instance) {
      return this.instance;
    }

    this.instance = new AuthService();
    return this.instance;
  }

  async signIn(email: string, password: string) {
    const response = await fetch(`${this.apiUrl}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: email,
        password,
      }),
    });

    const jsonResponse = await response.json();
    if (!response.ok) {
      throw new Error((jsonResponse as ApiErrorResponse).message);
    }

    return (jsonResponse as { access_token: string }).access_token;
  }
}

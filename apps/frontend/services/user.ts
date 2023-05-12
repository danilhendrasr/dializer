import { ApiErrorResponse, UserEntity } from '@dializer/types';
import { ApiService } from './base';

export class UserService extends ApiService {
  private static instance: UserService;

  static getInstance() {
    if (this.instance) {
      return this.instance;
    }

    this.instance = new UserService();
    return this.instance;
  }

  async getById(id: string): Promise<UserEntity> {
    const res = await fetch(`${this.apiUrl}/users/${id}`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.accessToken}`,
      },
    });

    const jsonResp = await res.json();
    if (!res.ok) {
      throw new Error((jsonResp as ApiErrorResponse).message);
    }

    return jsonResp as UserEntity;
  }

  async update(id: string, data: Partial<UserEntity>): Promise<UserEntity> {
    const res = await fetch(`${this.apiUrl}/users/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.accessToken}`,
      },
      body: JSON.stringify(data),
    });

    const jsonResp = await res.json();
    if (!res.ok) {
      throw new Error((jsonResp as ApiErrorResponse).message);
    }

    return jsonResp as UserEntity;
  }

  async sendPasswordResetEmail(targetEmail: string): Promise<void> {
    const res = await fetch(`${this.apiUrl}/users/password`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email: targetEmail }),
    });

    if (!res.ok) {
      const jsonRes: ApiErrorResponse = await res.json();
      throw new Error(jsonRes.message);
    }
  }

  async resetPassword(token: string, newPassword: string): Promise<UserEntity> {
    const res = await fetch(`${this.apiUrl}/users/password`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        token,
        new: newPassword,
      }),
    });

    const jsonRes = await res.json();
    if (!res.ok) {
      throw new Error((jsonRes as ApiErrorResponse).message);
    }

    return jsonRes as UserEntity;
  }
}

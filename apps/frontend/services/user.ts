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
}

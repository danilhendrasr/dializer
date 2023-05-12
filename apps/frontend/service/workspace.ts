import { ApiErrorResponse, WorkspaceEntity } from '@dializer/types';
import { LocalStorageItems } from '../common/types';

class ApiService {
  protected accessToken: string;
  protected apiUrl: string;

  protected constructor() {
    this.accessToken = localStorage.getItem(LocalStorageItems.ACCESS_TOKEN);
    this.apiUrl = process.env.NEXT_PUBLIC_API_URL;
  }
}

export class WorkspaceService extends ApiService {
  private static instance: WorkspaceService;

  static getInstance() {
    if (this.instance) {
      return this.instance;
    }

    this.instance = new WorkspaceService();
    return this.instance;
  }

  async getByUserId(
    userId: string,
    queryParams?: string
  ): Promise<WorkspaceEntity[]> {
    const finalQueryParams = queryParams ? `?${queryParams}` : '';
    const response = await fetch(
      `${this.apiUrl}/users/${userId}/workspaces${finalQueryParams}`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem(
            LocalStorageItems.ACCESS_TOKEN
          )}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(response.statusText);
    }

    return await response.json();
  }

  async create(): Promise<WorkspaceEntity> {
    const response = await fetch(`${this.apiUrl}/workspaces`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
      },
    });

    const jsonResponse = await response.json();

    if (!response.ok) {
      throw new Error((jsonResponse as ApiErrorResponse).message);
    }

    return jsonResponse as WorkspaceEntity;
  }

  async deleteById(id: string): Promise<void> {
    const response = await fetch(`${this.apiUrl}/workspaces/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const jsonResponse: ApiErrorResponse = await response.json();
      throw new Error(jsonResponse.message);
    }
  }
}

import { ApiErrorResponse, WorkspaceEntity } from '@dializer/types';
import { LocalStorageItems } from '../common/types';
import { ApiService } from './base';

export class WorkspaceService extends ApiService {
  private static instance: WorkspaceService;

  static getInstance() {
    if (this.instance) {
      return this.instance;
    }

    this.instance = new WorkspaceService();
    return this.instance;
  }

  async getById(id: string): Promise<WorkspaceEntity> {
    const res = await fetch(`${this.apiUrl}/workspaces/${id}`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.accessToken}`,
      },
    });

    const json = await res.json();
    if (!res.ok) {
      throw new Error((json as ApiErrorResponse).message);
    }

    return json as WorkspaceEntity;
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

  /**
   * Create new workspace. Workspace data is optional, if no data is given,
   * new workspace will be created using the default settings:
   * Title: "New Workspace"
   * Visibility: Private
   * Description: None
   */
  async create(args?: Partial<WorkspaceEntity>): Promise<WorkspaceEntity> {
    const response = await fetch(`${this.apiUrl}/workspaces`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(args),
    });

    const jsonResponse = await response.json();

    if (!response.ok) {
      throw new Error((jsonResponse as ApiErrorResponse).message);
    }

    return jsonResponse as WorkspaceEntity;
  }

  async updateMetadata(
    id: string,
    data: Partial<WorkspaceEntity>
  ): Promise<WorkspaceEntity> {
    const res = await fetch(`${this.apiUrl}/workspaces/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.accessToken}`,
      },
      body: JSON.stringify(data),
    });

    const jsonRes = await res.json();
    if (!res.ok) {
      throw new Error((jsonRes as ApiErrorResponse).message);
    }

    return jsonRes as WorkspaceEntity;
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

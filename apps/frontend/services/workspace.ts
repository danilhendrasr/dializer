import { ApiErrorResponse, WorkspaceEntity } from '@dializer/types';
import { FlowChartNode, HTTP_METHOD } from '../common/types';
import { API_URL } from '../common/constants';
import { getCommonRequestHeaders } from '../common/utils';

export async function getById(id: string): Promise<WorkspaceEntity> {
  const res = await fetch(`${API_URL}/workspaces/${id}`, {
    headers: getCommonRequestHeaders(),
  });

  const json = await res.json();
  if (!res.ok) {
    throw new Error((json as ApiErrorResponse).message);
  }

  return json as WorkspaceEntity;
}

export async function getByUserId(
  userId: string,
  queryParams?: string
): Promise<WorkspaceEntity[]> {
  const finalQueryParams = queryParams ? `?${queryParams}` : '';
  const response = await fetch(
    `${API_URL}/users/${userId}/workspaces${finalQueryParams}`,
    { headers: getCommonRequestHeaders() }
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
export async function create(
  args?: Partial<WorkspaceEntity>
): Promise<WorkspaceEntity> {
  const response = await fetch(`${API_URL}/workspaces`, {
    method: HTTP_METHOD.POST,
    headers: getCommonRequestHeaders(),
    body: JSON.stringify(args),
  });

  const jsonResponse = await response.json();

  if (!response.ok) {
    throw new Error((jsonResponse as ApiErrorResponse).message);
  }

  return jsonResponse as WorkspaceEntity;
}

export async function updateMetadata(
  id: string,
  data: Partial<WorkspaceEntity>
): Promise<WorkspaceEntity> {
  const res = await fetch(`${API_URL}/workspaces/${id}`, {
    method: HTTP_METHOD.PATCH,
    headers: getCommonRequestHeaders(),
    body: JSON.stringify(data),
  });

  const jsonRes = await res.json();
  if (!res.ok) {
    throw new Error((jsonRes as ApiErrorResponse).message);
  }

  return jsonRes as WorkspaceEntity;
}

export async function deleteById(id: string): Promise<void> {
  const response = await fetch(`${API_URL}/workspaces/${id}`, {
    method: HTTP_METHOD.DELETE,
    headers: this.commonHeaders,
  });

  if (!response.ok) {
    const jsonResponse: ApiErrorResponse = await response.json();
    throw new Error(jsonResponse.message);
  }
}

export async function getNodes(workspaceId: string): Promise<FlowChartNode[]> {
  const res = await fetch(`${API_URL}/workspaces/${workspaceId}/nodes`, {
    headers: getCommonRequestHeaders(),
  });

  const jsonRes = await res.json();
  if (!res.ok) {
    throw new Error((jsonRes as ApiErrorResponse).message);
  }

  return jsonRes as FlowChartNode[];
}

export async function saveNodes(
  workspaceId: string,
  nodes: FlowChartNode[]
): Promise<void> {
  const response = await fetch(`${API_URL}/workspaces/${workspaceId}/nodes`, {
    method: HTTP_METHOD.PUT,
    headers: getCommonRequestHeaders(),
    body: JSON.stringify({ nodes }),
  });

  if (!response.ok) {
    const jsonResponse: ApiErrorResponse = await response.json();
    throw new Error(jsonResponse.message);
  }
}

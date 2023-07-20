import { ApiErrorResponse, UserEntity } from '@dializer/types';
import { API_URL } from '../common/constants';
import { getCommonRequestHeaders } from '../common/utils';

export async function getById(id: string): Promise<UserEntity> {
  const res = await fetch(`${API_URL}/users/${id}`, {
    headers: getCommonRequestHeaders(),
  });

  const jsonResp = await res.json();
  if (!res.ok) {
    throw new Error((jsonResp as ApiErrorResponse).message);
  }

  return jsonResp as UserEntity;
}

export async function update(
  id: string,
  data: Partial<UserEntity>
): Promise<UserEntity> {
  const res = await fetch(`${API_URL}/users/${id}`, {
    method: 'PUT',
    headers: getCommonRequestHeaders(),
    body: JSON.stringify(data),
  });

  const jsonResp = await res.json();
  if (!res.ok) {
    throw new Error((jsonResp as ApiErrorResponse).message);
  }

  return jsonResp as UserEntity;
}

export async function sendPasswordResetEmail(
  targetEmail: string
): Promise<void> {
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

export async function resetPassword(
  token: string,
  newPassword: string
): Promise<UserEntity> {
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

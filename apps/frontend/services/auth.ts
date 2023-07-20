import { ApiErrorResponse } from '@dializer/types';
import { API_URL } from '../common/constants';

export async function signIn(email: string, password: string): Promise<string> {
  const response = await fetch(`${API_URL}/auth/login`, {
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

export async function signUp(
  fullName: string,
  email: string,
  password: string
): Promise<string> {
  const response = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      fullName,
      email,
      password,
    }),
  });

  const jsonResponse = await response.json();
  if (!response.ok) {
    throw new Error((jsonResponse as ApiErrorResponse).message);
  }

  return (jsonResponse as { access_token: string }).access_token;
}

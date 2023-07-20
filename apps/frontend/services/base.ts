import { LocalStorageItems } from '../common/types';

/**
 * Get the commonly-used headers:
 * ```
 * Authorization: Bearer <token>,
 * Content-Type: application/json
 * ```
 *
 * "Why is this a function?" you may ask, because it needs to get the access
 * token from the local storage which is not available during build time.
 */
export function getCommonHeaders() {
  const accessToken = localStorage.getItem(LocalStorageItems.ACCESS_TOKEN);
  return {
    Authorization: `Bearer ${accessToken}`,
    'Content-Type': 'application/json',
  };
}

export class ApiService {
  protected accessToken: string;
  protected apiUrl: string;

  /**
   * Common headers contain the following:
   * Authorization: "Bearer <token>"
   * Content-Type: "application/json"
   */
  protected commonHeaders: HeadersInit;

  protected constructor() {
    this.accessToken = localStorage.getItem(LocalStorageItems.ACCESS_TOKEN);
    this.apiUrl = process.env.NEXT_PUBLIC_API_URL;
    this.commonHeaders = {
      Authorization: `Bearer ${this.accessToken}`,
      'Content-Type': 'application/json',
    };
  }

  static getInstance() {
    throw new Error('Method getInstance is not implemented.');
  }
}

import { LocalStorageItems } from './types';

/**
 * Get the commonly-used headers:
 * ```
 * Authorization: Bearer <token>,
 * Content-Type: application/json
 * ```
 *
 * "Why is this a function?" you may ask, because it needs to get the access
 * token from the local storage which is not available during build time.
 *
 * @throws {Error} - Throws an error if localStorage is not available
 */
export function getCommonRequestHeaders() {
  try {
    const accessToken = localStorage.getItem(LocalStorageItems.ACCESS_TOKEN);
    return {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    };
  } catch (e) {
    throw new Error(
      "Local storage is not available, if you've disabled it please enable it again."
    );
  }
}

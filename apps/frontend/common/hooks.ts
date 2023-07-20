import Router from 'next/router';
import { useEffect, useState } from 'react';
import { LocalStorageItems } from '../common/types';
import jwtDecode from 'jwt-decode';

/**
 * Hook to protect pages from authorized access, redirect to dashboard page if user
 * has already logged in.
 */
export const useAuthorizedProtection = () => {
  useEffect(() => {
    const accessToken = localStorage.getItem(LocalStorageItems.ACCESS_TOKEN);
    if (accessToken) {
      Router.replace('/');
    }
  }, []);
};

/**
 * Hook to protect pages from unauthorized access, redirect to sign-in page if no access token found.
 */
export const useUnauthorizedProtection = () => {
  useEffect(() => {
    const accessToken = localStorage.getItem(LocalStorageItems.ACCESS_TOKEN);
    if (!accessToken) {
      Router.replace('/sign-in');
    }
  }, []);
};

export const useUserId = () => {
  const [userId, setUserId] = useState<string>();

  useEffect(() => {
    const accessToken = localStorage.getItem(LocalStorageItems.ACCESS_TOKEN);
    if (!accessToken) return;
    const { sub } = jwtDecode(accessToken) as { sub: string };
    setUserId(sub);
  }, []);

  return userId;
};

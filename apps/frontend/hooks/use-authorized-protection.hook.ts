import Router from 'next/router';
import { useEffect } from 'react';
import { LocalStorageItems } from '../common/types';

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

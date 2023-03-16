import Router from 'next/router';
import { useEffect } from 'react';
import { LocalStorageItems } from '../common/types';

/**
 * Hook to protect pages from unauthorized access, redirect to sign-in page if no access token found.
 */
export const useUnauthorizedProtection = () => {
  useEffect(() => {
    const accessToken = localStorage.getItem(LocalStorageItems.ACCESS_TOKEN);
    if (!accessToken) {
      Router.replace('/auth/sign-in');
    }
  }, []);
};

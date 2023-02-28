import Router from 'next/router';
import { useEffect } from 'react';
import { LocalStorageItems } from '../common/types';

export const useRouteProtection = () => {
  useEffect(() => {
    const accessToken = localStorage.getItem(LocalStorageItems.ACCESS_TOKEN);
    if (!accessToken) {
      Router.replace('/auth/sign-in');
    }
  }, []);
};

import jwtDecode from 'jwt-decode';
import { useEffect, useState } from 'react';
import { LocalStorageItems } from '../common/types';

export const useUserId = () => {
  const [userId, setUserId] = useState<string>();
  useEffect(() => {
    const accessToken = localStorage.getItem(LocalStorageItems.ACCESS_TOKEN);
    const { sub } = jwtDecode(accessToken) as { sub: string };
    setUserId(sub);
  }, []);

  return userId;
};

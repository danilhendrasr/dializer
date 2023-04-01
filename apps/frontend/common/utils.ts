import { LocalStorageItems } from './types';

export const swrFetcher = async (url: string) => {
  const accessToken = localStorage.getItem(LocalStorageItems.ACCESS_TOKEN);
  const res = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + accessToken,
    },
  });

  return await res.json();
};

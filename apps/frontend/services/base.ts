import { LocalStorageItems } from '../common/types';

export class ApiService {
  protected accessToken: string;
  protected apiUrl: string;

  protected constructor() {
    this.accessToken = localStorage.getItem(LocalStorageItems.ACCESS_TOKEN);
    this.apiUrl = process.env.NEXT_PUBLIC_API_URL;
  }

  static getInstance() {
    throw new Error('Method getInstance is not implemented.');
  }
}

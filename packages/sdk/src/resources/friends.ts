import type { OpenSplitClient } from '../client';
import type { Friend, CreateFriendRequest } from '../types';

export class FriendsResource {
  constructor(private client: OpenSplitClient) {}

  list(): Promise<Friend[]> {
    return this.client.request('GET', '/friends');
  }

  get(id: string): Promise<Friend> {
    return this.client.request('GET', `/friends/${id}`);
  }

  create(data: CreateFriendRequest): Promise<Friend> {
    return this.client.request('POST', '/friends', { body: data });
  }

  delete(id: string): Promise<{ success: boolean }> {
    return this.client.request('DELETE', `/friends/${id}`);
  }
}

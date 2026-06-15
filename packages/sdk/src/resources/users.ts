import type { OpenSplitClient } from '../client';
import type { User, UpdateUserRequest } from '../types';

export class UsersResource {
  constructor(private client: OpenSplitClient) {}

  me(): Promise<User> {
    return this.client.request('GET', '/users/me');
  }

  get(id: string): Promise<User> {
    return this.client.request('GET', `/users/${id}`);
  }

  update(id: string, data: UpdateUserRequest): Promise<User> {
    return this.client.request('PATCH', `/users/${id}`, { body: data });
  }
}

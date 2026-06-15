import type { OpenSplitClient } from '../client';
import type { ParentCategory } from '../types';

export class CategoriesResource {
  constructor(private client: OpenSplitClient) {}

  list(): Promise<ParentCategory[]> {
    return this.client.request('GET', '/categories');
  }
}

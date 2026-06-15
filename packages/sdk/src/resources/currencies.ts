import type { OpenSplitClient } from '../client';
import type { Currency } from '../types';

export class CurrenciesResource {
  constructor(private client: OpenSplitClient) {}

  list(): Promise<Currency[]> {
    return this.client.request('GET', '/currencies');
  }
}

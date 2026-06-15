import type { OpenSplitClient } from '../client';
import type {
  Expense,
  ExpenseDetail,
  CreateExpenseRequest,
  UpdateExpenseRequest,
  ListExpensesParams,
} from '../types';

export class ExpensesResource {
  constructor(private client: OpenSplitClient) {}

  list(params?: ListExpensesParams): Promise<Expense[]> {
    return this.client.request('GET', '/expenses', {
      params: params as Record<string, string | number | undefined>,
    });
  }

  get(id: string): Promise<ExpenseDetail> {
    return this.client.request('GET', `/expenses/${id}`);
  }

  create(data: CreateExpenseRequest): Promise<Expense> {
    return this.client.request('POST', '/expenses', { body: data });
  }

  update(id: string, data: UpdateExpenseRequest): Promise<Expense> {
    return this.client.request('PATCH', `/expenses/${id}`, { body: data });
  }

  delete(id: string): Promise<void> {
    return this.client.request('DELETE', `/expenses/${id}`);
  }

  restore(id: string): Promise<Expense> {
    return this.client.request('POST', `/expenses/${id}/restore`);
  }
}

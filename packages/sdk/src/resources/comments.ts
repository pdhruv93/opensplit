import type { OpenSplitClient } from '../client';
import type { Comment, CreateCommentRequest } from '../types';

export class CommentsResource {
  constructor(private client: OpenSplitClient) {}

  list(expenseId: string): Promise<Comment[]> {
    return this.client.request('GET', `/expenses/${expenseId}/comments`);
  }

  create(expenseId: string, data: CreateCommentRequest): Promise<Comment> {
    return this.client.request('POST', `/expenses/${expenseId}/comments`, {
      body: data,
    });
  }

  delete(commentId: string): Promise<void> {
    return this.client.request('DELETE', `/comments/${commentId}`);
  }
}

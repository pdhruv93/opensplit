import type { OpenSplitClient } from '../client';
import type { Notification, ListNotificationsParams } from '../types';

export class NotificationsResource {
  constructor(private client: OpenSplitClient) {}

  list(params?: ListNotificationsParams): Promise<Notification[]> {
    return this.client.request('GET', '/notifications', {
      params: params as Record<string, string | number | undefined>,
    });
  }
}

import { AuthResource } from './resources/auth';
import { UsersResource } from './resources/users';
import { GroupsResource } from './resources/groups';
import { FriendsResource } from './resources/friends';
import { ExpensesResource } from './resources/expenses';
import { CommentsResource } from './resources/comments';
import { NotificationsResource } from './resources/notifications';
import { CurrenciesResource } from './resources/currencies';
import { CategoriesResource } from './resources/categories';

export interface OpenSplitConfig {
  baseUrl: string;
  apiKey?: string;
}

export class OpenSplitError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public details?: unknown,
  ) {
    super(message);
    this.name = 'OpenSplitError';
  }
}

export class OpenSplitClient {
  private baseUrl: string;
  private apiKey?: string;

  public auth: AuthResource;
  public users: UsersResource;
  public groups: GroupsResource;
  public friends: FriendsResource;
  public expenses: ExpensesResource;
  public comments: CommentsResource;
  public notifications: NotificationsResource;
  public currencies: CurrenciesResource;
  public categories: CategoriesResource;

  constructor(config: OpenSplitConfig) {
    this.baseUrl = config.baseUrl.replace(/\/$/, '');
    this.apiKey = config.apiKey;

    this.auth = new AuthResource(this);
    this.users = new UsersResource(this);
    this.groups = new GroupsResource(this);
    this.friends = new FriendsResource(this);
    this.expenses = new ExpensesResource(this);
    this.comments = new CommentsResource(this);
    this.notifications = new NotificationsResource(this);
    this.currencies = new CurrenciesResource(this);
    this.categories = new CategoriesResource(this);
  }

  setApiKey(apiKey: string): void {
    this.apiKey = apiKey;
  }

  async request<T>(
    method: string,
    path: string,
    options?: {
      body?: unknown;
      params?: Record<string, string | number | undefined>;
    },
  ): Promise<T> {
    const url = new URL(`${this.baseUrl}${path}`);

    if (options?.params) {
      for (const [key, value] of Object.entries(options.params)) {
        if (value !== undefined) {
          url.searchParams.set(key, String(value));
        }
      }
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (this.apiKey) {
      headers['Authorization'] = `Bearer ${this.apiKey}`;
    }

    const response = await fetch(url.toString(), {
      method,
      headers,
      body: options?.body ? JSON.stringify(options.body) : undefined,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new OpenSplitError(
        response.status,
        (error as Record<string, string>).message || `Request failed with status ${response.status}`,
        error,
      );
    }

    if (response.status === 204) {
      return undefined as T;
    }

    return response.json() as Promise<T>;
  }
}

export type GroupType = 'HOME' | 'TRIP' | 'COUPLE' | 'OTHER';
export type CommentType = 'SYSTEM' | 'USER';
export type RepeatInterval =
  | 'NEVER'
  | 'WEEKLY'
  | 'FORTNIGHTLY'
  | 'MONTHLY'
  | 'YEARLY';
export type RegistrationStatus = 'CONFIRMED' | 'INVITED' | 'DUMMY';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string | null;
  locale: string;
  defaultCurrency: string;
  picture: string | null;
  registrationStatus: RegistrationStatus;
  createdAt: string;
  updatedAt: string;
}

export interface UserSummary {
  id: string;
  firstName: string;
  lastName: string | null;
  picture: string | null;
}

export interface Balance {
  currencyCode: string;
  amount: string;
}

export interface GroupMember {
  userId: string;
  groupId: string;
  user: UserSummary & { email: string };
}

export interface GroupDebt {
  userId: string;
  balances: Balance[];
}

export interface Group {
  id: string;
  name: string;
  groupType: GroupType;
  simplifyByDefault: boolean;
  members: GroupMember[];
  createdAt: string;
  updatedAt: string;
}

export interface GroupDetail extends Group {
  debts: GroupDebt[];
}

export interface Friend extends UserSummary {
  email: string;
  registrationStatus: RegistrationStatus;
  balance: Balance[];
  updatedAt: string;
}

export interface ExpenseShare {
  id: string;
  expenseId: string;
  userId: string;
  paidShare: string;
  owedShare: string;
  user: UserSummary;
}

export interface Category {
  id: number;
  name: string;
  parentId: number | null;
}

export interface ParentCategory extends Category {
  subcategories: Category[];
}

export interface Expense {
  id: string;
  groupId: string | null;
  description: string;
  details: string | null;
  cost: string;
  currencyCode: string;
  categoryId: number | null;
  date: string;
  repeatInterval: RepeatInterval;
  payment: boolean;
  createdById: string;
  updatedById: string | null;
  deletedById: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  shares: ExpenseShare[];
  createdBy: UserSummary;
  updatedBy: UserSummary | null;
  category: Category | null;
}

export interface ExpenseDetail extends Expense {
  comments: Comment[];
}

export interface Comment {
  id: string;
  expenseId: string;
  userId: string;
  content: string;
  commentType: CommentType;
  createdAt: string;
  deletedAt: string | null;
  user: UserSummary;
}

export interface Notification {
  id: string;
  userId: string;
  type: number;
  content: string;
  sourceType: string | null;
  sourceId: string | null;
  imageUrl: string | null;
  createdById: string | null;
  createdAt: string;
  createdBy: UserSummary | null;
}

export interface Currency {
  code: string;
  unit: string;
}

// Request types

export interface UpdateUserRequest {
  firstName?: string;
  lastName?: string;
  locale?: string;
  defaultCurrency?: string;
  picture?: string;
}

export interface CreateGroupRequest {
  name: string;
  groupType?: GroupType;
  simplifyByDefault?: boolean;
  members?: string[];
}

export interface AddMemberRequest {
  userId: string;
}

export interface CreateFriendRequest {
  userId?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
}

export interface ExpenseShareInput {
  userId: string;
  paidShare: number;
  owedShare: number;
}

export interface CreateExpenseRequest {
  groupId?: string;
  description: string;
  details?: string;
  cost: number;
  currencyCode: string;
  categoryId?: number;
  date?: string;
  repeatInterval?: RepeatInterval;
  payment?: boolean;
  splitEqually?: boolean;
  shares?: ExpenseShareInput[];
}

export interface UpdateExpenseRequest {
  groupId?: string;
  description?: string;
  details?: string;
  cost?: number;
  currencyCode?: string;
  categoryId?: number;
  date?: string;
  repeatInterval?: RepeatInterval;
  payment?: boolean;
  shares?: ExpenseShareInput[];
}

export interface CreateCommentRequest {
  content: string;
}

export interface ListExpensesParams {
  group_id?: string;
  friend_id?: string;
  dated_after?: string;
  dated_before?: string;
  updated_after?: string;
  updated_before?: string;
  limit?: number;
  offset?: number;
}

export interface ListNotificationsParams {
  updated_after?: string;
  limit?: number;
}

// Auth types

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  apiKey: string;
}

export interface RotateKeyResponse {
  apiKey: string;
}

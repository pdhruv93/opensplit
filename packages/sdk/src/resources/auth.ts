import type { OpenSplitClient } from '../client';
import type {
  AuthResponse,
  RotateKeyResponse,
  RegisterRequest,
  LoginRequest,
} from '../types';

export class AuthResource {
  constructor(private client: OpenSplitClient) {}

  register(data: RegisterRequest): Promise<AuthResponse> {
    return this.client.request('POST', '/auth/register', { body: data });
  }

  login(data: LoginRequest): Promise<AuthResponse> {
    return this.client.request('POST', '/auth/login', { body: data });
  }

  rotateKey(): Promise<RotateKeyResponse> {
    return this.client.request('POST', '/auth/rotate-key');
  }
}

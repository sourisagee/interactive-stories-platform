import type { Response } from 'express';

// --- User (Prisma) ---

export interface UserAttributes {
  id: number;
  username: string;
  email: string;
  password: string;
  role: UserRole;
  createdAt?: Date;
  updatedAt?: Date;
}

export type UserRole = 'USER' | 'AUTHOR';

// --- Auth (SignIn / SignUp) ---

export interface SignInData {
  email: string;
  password: string;
}

export interface SignUpData {
  username: string;
  email: string;
  password: string;
  role: UserRole;
}

export interface ValidationResult {
  isValid: boolean;
  error: string | null;
}

// --- JWT ---

export interface JwtPayload {
  user: Omit<UserAttributes, 'password'>;
}

export interface JwtTokens {
  accessToken: string;
  refreshToken: string;
}

export interface JwtConfig {
  access: { expiresIn: number };
  refresh: { expiresIn: number };
}

export interface CookieConfig {
  httpOnly: boolean;
  maxAge: number;
}

// --- Express (locals) ---

export interface CustomLocals {
  user?: Omit<UserAttributes, 'password'>;
}

export interface TypedResponse extends Response {
  locals: CustomLocals;
}

// --- Service (Create / Update) ---

export interface CreateUserData {
  username: string;
  email: string;
  password: string;
  role: UserRole;
}

export interface UpdateUserData {
  username?: string;
  email?: string;
}

import type { Response } from "express";

export interface UserAttributes {
  id: number;
  username: string;
  email: string;
  password: string;
  role: UserRole;
  createdAt?: Date;
  updatedAt?: Date;
}

export type UserRole = "USER" | "AUTHOR";

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

export interface JwtPayload {
  user: Omit<UserAttributes, "password">;
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
  sameSite?: "strict" | "lax" | "none";
  secure?: boolean;
  path?: string;
  domain?: string;
}

export interface CustomLocals {
  user?: Omit<UserAttributes, "password">;
}

export interface TypedResponse extends Response {
  locals: CustomLocals;
}

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

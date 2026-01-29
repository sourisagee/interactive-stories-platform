import { Request, NextFunction } from 'express';
import bcrypt from 'bcrypt';
import formatResponse from '../../utils/formatResponse';
import type { SignInData, SignUpData, ValidationResult, UserRole } from '../../types';
import type { TypedResponse } from '../../types';

function validateEmail(email: string): boolean {
  const emailPattern = /^[A-z0-9._%+-]+@[A-z0-9.-]+\.[A-z]{2,}$/;
  return emailPattern.test(email);
}

function validatePassword(password: string): boolean {
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialCharacters = /[!@#$%^&*()-,.?":{}|<>]/.test(password);
  const isValidLength = password.length >= 8;
  return hasUpperCase && hasLowerCase && hasNumbers && hasSpecialCharacters && isValidLength;
}

export function validateSignInData(data: SignInData): ValidationResult {
  if (!data.email || typeof data.email !== 'string' || data.email.trim().length === 0) {
    return { isValid: false, error: 'Email should not be empty' };
  }
  if (!data.password || typeof data.password !== 'string' || data.password.trim().length === 0) {
    return { isValid: false, error: 'Password should not be empty' };
  }
  return { isValid: true, error: null };
}

export function validateSignUpData(data: SignUpData): ValidationResult {
  if (!data.username || typeof data.username !== 'string' || data.username.trim().length === 0) {
    return { isValid: false, error: 'Username field should not be empty' };
  }
  if (
    !data.email ||
    typeof data.email !== 'string' ||
    data.email.trim().length === 0 ||
    !validateEmail(data.email)
  ) {
    return { isValid: false, error: 'Email must be valid' };
  }
  if (
    !data.password ||
    typeof data.password !== 'string' ||
    data.password.trim().length === 0 ||
    !validatePassword(data.password)
  ) {
    return {
      isValid: false,
      error:
        'Password should not be empty, must contain one uppercase letter, one lowercase letter, one special character, and be at least 8 characters long',
    };
  }
  const validRoles: UserRole[] = ['USER', 'AUTHOR'];
  if (!data.role || !validRoles.includes(data.role)) {
    return { isValid: false, error: 'Role must be USER or AUTHOR' };
  }
  return { isValid: true, error: null };
}

export async function prepareUserForCreate(data: SignUpData): Promise<{
  username: string;
  email: string;
  password: string;
  role: UserRole;
}> {
  const hashedPassword = await bcrypt.hash(data.password, 10);
  const emailNormalized = data.email.trim().toLowerCase();
  const usernameTrimmed = data.username.trim();
  return {
    username: usernameTrimmed,
    email: emailNormalized,
    password: hashedPassword,
    role: data.role,
  };
}

export function omitPassword<T extends { password?: string }>(user: T): Omit<T, 'password'> {
  const { password: _, ...rest } = user;
  return rest as Omit<T, 'password'>;
}

export function validateSignIn(req: Request, res: TypedResponse, next: NextFunction): void {
  const result = validateSignInData(req.body as SignInData);
  if (!result.isValid) {
    res.status(400).json(formatResponse(400, result.error!, null, result.error));
    return;
  }
  next();
}

export function validateSignUp(req: Request, res: TypedResponse, next: NextFunction): void {
  const result = validateSignUpData(req.body as SignUpData);
  if (!result.isValid) {
    res.status(400).json(formatResponse(400, result.error!, null, result.error));
    return;
  }
  next();
}

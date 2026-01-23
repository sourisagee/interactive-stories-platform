export enum UserRole {
  USER = 'USER',
  AUTHOR = 'AUTHOR',
}

export type User = {
  id: number;
  username: string;
  email: string;
  role: UserRole;
  createdAt: string; 
  updatedAt: string; 
};

export type UserData = {
  id: number;
  username: string;
  email: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
};

export type UserResponseType = {
  user: UserData; 
  accessToken: string;
};

export type UserType = {
  user: UserData | null;
};

export type SignUpFormData = {
  username: string;
  email: string;
  password: string;
  role: UserRole;
};

export type SignInFormData = {
  email: string;
  password: string;
};

export type UserStateType = {
  user: UserData | null;
  isLoading: boolean;
  error: string | null;
  isInitialized: boolean;
};

export const initialUserState: UserStateType = {
  user: null, 
  isLoading: false,
  error: null,
  isInitialized: false,
};

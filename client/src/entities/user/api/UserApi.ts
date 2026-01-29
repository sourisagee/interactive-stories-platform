import {
  axiosInstance,
  setAccessToken,
} from "../../../shared/lib/axiosInstance";
import { createAsyncThunk } from "@reduxjs/toolkit";
import type {
  UserData,
  UserResponseType,
  SignUpFormData,
  SignInFormData,
} from "../model";
import type { ServerResponseType } from "../../../shared/types";
import type { AxiosError } from "axios";

const API_AUTH_URL = "/auth";

export default class UserApi {
  static async signUp(userData: SignUpFormData) {
    const { data } = await axiosInstance.post(
      API_AUTH_URL + "/signUp",
      userData,
    );
    return data;
  }

  static async signIn(userData: SignInFormData) {
    const { data } = await axiosInstance.post(
      API_AUTH_URL + "/signIn",
      userData,
    );
    return data;
  }

  static async signOut() {
    const { data } = await axiosInstance.delete(API_AUTH_URL + "/signOut");
    return data;
  }
}

const USER_THUNK_NAMES = {
  SIGNUP: "/user/signUp",
  SIGNIN: "/user/signIn",
  SIGNOUT: "/user/signOut",
  REFRESH: "user/refresh",
} as const;

const USER_API_URL = {
  SIGNUP: "/auth/signUp",
  SIGNIN: "/auth/signIn",
  SIGNOUT: "/auth/signOut",
  REFRESHTOKENS: "/auth/refreshTokens",
} as const;

export const refreshThunk = createAsyncThunk<
  UserData,  
  void,
  { rejectValue: string }
>(USER_THUNK_NAMES.REFRESH, async (_, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.get<
      ServerResponseType<UserResponseType>
    >(USER_API_URL.REFRESHTOKENS);

    setAccessToken(response.data.data?.accessToken || "");
    return response.data.data?.user as UserData;
  } catch (error) {
    const axiosError = error as AxiosError<ServerResponseType<null>>;
    
    if (axiosError.response?.status === 401) {
      setAccessToken("");
      return rejectWithValue("Not authenticated");
    }
    
    const errorMessage = axiosError.response?.data?.message || axiosError.message || "Unknown error";
    return rejectWithValue(errorMessage);
  }
});

export const signupThunk = createAsyncThunk<
  UserData,
  SignUpFormData,
  { rejectValue: string }
>(USER_THUNK_NAMES.SIGNUP, async (userData, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.post<
      ServerResponseType<UserResponseType>
    >(USER_API_URL.SIGNUP, userData);

    setAccessToken(response.data.data?.accessToken || "");
    return response.data.data?.user as UserData;
  } catch (error) {
    const axiosError = error as AxiosError<ServerResponseType<null>>;
    const errorMessage = axiosError.response?.data?.message || axiosError.message || "Unknown error";
    return rejectWithValue(errorMessage);
  }
});

export const signinThunk = createAsyncThunk<
  UserData,
  SignInFormData, 
  { rejectValue: string }
>(USER_THUNK_NAMES.SIGNIN, async (userData, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.post<
      ServerResponseType<UserResponseType>
    >(USER_API_URL.SIGNIN, userData);

    setAccessToken(response.data.data?.accessToken || "");
    return response.data.data?.user as UserData;
  } catch (error) {
    const axiosError = error as AxiosError<ServerResponseType<null>>;
    const errorMessage = axiosError.response?.data?.message || axiosError.message || "Unknown error";
    return rejectWithValue(errorMessage);
  }
});

export const signoutThunk = createAsyncThunk<
  void, 
  void,
  { rejectValue: string }
>(USER_THUNK_NAMES.SIGNOUT, async (_, { rejectWithValue }) => {
  try {
    await axiosInstance.delete<ServerResponseType<null>>(USER_API_URL.SIGNOUT);

    setAccessToken("");
    return;
  } catch (error) {
    const axiosError = error as AxiosError<ServerResponseType<null>>;
    const errorMessage = axiosError.response?.data?.message || axiosError.message || "Unknown error";
    return rejectWithValue(errorMessage);
  }
});

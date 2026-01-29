import { createSlice } from "@reduxjs/toolkit";
import {
  refreshThunk,
  signinThunk,
  signupThunk,
  signoutThunk,
} from "../api/UserApi";
import { initialUserState } from "../model";

const userSlice = createSlice({
  name: "user", 
  initialState: initialUserState, 
  reducers: {}, 
  extraReducers: (builder) => {
    builder.addCase(refreshThunk.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(refreshThunk.fulfilled, (state, action) => {
      state.isLoading = false;
      state.user = action.payload; 
      state.isInitialized = true;
      state.error = null;
    });
    builder.addCase(refreshThunk.rejected, (state, action) => {
      state.isLoading = false;
      const errorMessage = action.payload as string;
      state.error = (errorMessage === "No refresh token" || 
                     errorMessage === "Invalid refresh token" || 
                     errorMessage === "Not authenticated") 
        ? null 
        : errorMessage;
      state.isInitialized = true;
      state.user = null;
    });
    builder.addCase(signupThunk.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(signupThunk.fulfilled, (state, action) => {
      state.isLoading = false;
      state.user = action.payload;
      state.isInitialized = true;
      state.error = null;
    });
    builder.addCase(signupThunk.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
      state.isInitialized = true;
      state.user = null;
    });
    builder.addCase(signinThunk.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(signinThunk.fulfilled, (state, action) => {
      state.isLoading = false;
      state.user = action.payload;
      state.isInitialized = true;
      state.error = null;
    });
    builder.addCase(signinThunk.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
      state.isInitialized = true;
      state.user = null;
    });
    builder.addCase(signoutThunk.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(signoutThunk.fulfilled, (state) => {
      state.isLoading = false;
      state.user = null;
      state.isInitialized = true;
      state.error = null;
    });
    builder.addCase(signoutThunk.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
      state.isInitialized = true;
      state.user = null;
    });
  },
});

export const userReducer = userSlice.reducer;



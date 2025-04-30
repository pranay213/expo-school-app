// authSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_REQUEST_AUTH, API_REQUEST_AUTH_TOKEN } from '@/constants/variables';

interface UserData {
    _id: string;
    name: string;
    email: string;
    role: string;
}

interface AuthState {
    token: string | null;
    user: UserData | null;
    isAuthenticated: boolean;
}

const initialState: AuthState = {
    token: null,
    user: null,
    isAuthenticated: false,
};

const authSlice = createSlice({
    name: 'auth',
    initialState,

    reducers: {
        initialize(state, action: PayloadAction<{ token: string; user: UserData }>) {
            // update store
            state.isAuthenticated = true;
            state.token = action.payload.token;
            state.user = action.payload.user;
        },
        setAuth(state, action: PayloadAction<{ token: string; user: UserData }>) {
            state.token = action.payload.token;
            state.user = action.payload.user;
            state.isAuthenticated = true;
            AsyncStorage.setItem(API_REQUEST_AUTH_TOKEN, action.payload.token)
            AsyncStorage.setItem(
                API_REQUEST_AUTH, JSON.stringify(action.payload.user));
        },
        clearAuth(state) {
            state.token = null;
            state.user = null;
            state.isAuthenticated = false;
            AsyncStorage.removeItem(API_REQUEST_AUTH);
            AsyncStorage.removeItem(API_REQUEST_AUTH_TOKEN);
        },
    },
});

export const { initialize, setAuth, clearAuth } = authSlice.actions;
export default authSlice.reducer;

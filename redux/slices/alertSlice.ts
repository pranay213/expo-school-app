// src/redux/slices/alertSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface AlertState {
    successMessage: string | null;
    errorMessage: string | null;
}

const initialState: AlertState = {
    successMessage: null,
    errorMessage: null,
};

const alertSlice = createSlice({
    name: 'alert',
    initialState,
    reducers: {
        setSuccess: (state, action: PayloadAction<string>) => {
            state.successMessage = action.payload;
            state.errorMessage = null;
        },
        setError: (state, action: PayloadAction<string>) => {
            state.errorMessage = action.payload;
            state.successMessage = null;
        },
        clearAlert: (state) => {
            state.successMessage = null;
            state.errorMessage = null;
        },
    },
});

export const { setSuccess, setError, clearAlert } = alertSlice.actions;

export default alertSlice.reducer;

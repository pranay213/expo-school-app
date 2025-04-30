// src/redux/store.ts
import { configureStore } from '@reduxjs/toolkit';
import alertReducer from './slices/alertSlice';
import loaderReducer from './slices/loaderSlice';
import authReducer from './slices/authSlice';



export const store = configureStore({
    reducer: {
        alert: alertReducer,
        loader: loaderReducer,
        auth: authReducer,
    },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

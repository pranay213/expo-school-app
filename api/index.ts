import { API_URL } from 'react-native-dotenv';

import axios, { AxiosInstance } from 'axios';
import { showError } from '@/utlis/ToastService';


console.table({ API_URL }, "---API_URL---")

// Create an Axios instance
const axiosInstance: AxiosInstance = axios.create({
    baseURL: API_URL, // Replace with your actual API base URL
    headers: {
        'Content-Type': 'application/json',
        // You can add more headers like Authorization if needed
    },
});

// Register API call function
export interface RegisterRequest {
    name?: string;
    email: string;
    password: string
}

interface RegisterResponse {
    success: boolean;
    data: any;
    message: string;
}

const ErrorHandler = (error: any) => {
    showError(JSON.stringify({ message: error.message }));
    return { success: false, data: null, message: error.message }
};

export const register = (requestpayload: RegisterRequest): Promise<RegisterResponse> => {
    return axiosInstance.post<RegisterResponse>('/register', requestpayload)
        .then((response) => response.data)
        .catch((error) => ErrorHandler(error));
};

export const login = (requestpayload: RegisterRequest): Promise<RegisterResponse> => {
    return axiosInstance.post<RegisterResponse>('/login', requestpayload)
        .then((response) => response.data)
        .catch((error) => {
            ErrorHandler(error);
            throw error;
        });
};

export default axiosInstance;
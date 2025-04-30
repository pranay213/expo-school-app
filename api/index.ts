import axios, { AxiosInstance } from 'axios';
import Constants from 'expo-constants';
import { showError } from '@/utlis/ToastService';
import { API_REQUEST_HEADER_NAME } from '@/constants/variables';
import { setAuth } from '@/redux/slices/authSlice';

const { API_URL } = Constants.expoConfig?.extra ?? {};

console.table({ API_URL }, "---API_URL---");


// Create an Axios instance
const axiosInstance: AxiosInstance = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Register API call function
export interface RegisterRequest {
    name?: string;
    email: string;
    password: string;
}

interface RegisterResponse {
    success: boolean;
    data: any;
    message: string;
    token: string;
}

const ErrorHandler = (error: any) => {
    let message = 'Something went wrong';
    const status = error?.response?.status;
    if (error?.response?.data?.message) {
        // When the API returns { message: "..." }
        message = error.response.data.message;
    } else if (error?.message) {
        // Axios error like network failure
        message = error.message;
    }
    // Log status and full error for debugging
    console.log(`❌ API Error [${status}]`, JSON.stringify(error, null, 2));
    // Show toast
    showError(message);
    return { success: false, data: null, message };
};


export const register = (requestpayload: RegisterRequest) => (dispatch: any): Promise<RegisterResponse> =>
    axiosInstance.post('/register', requestpayload)
        .then((response) => {
            const token = response.data?.token;
            const account = response.data?.data;
            axios.defaults.headers.common[API_REQUEST_HEADER_NAME] = token;
            dispatch(setAuth({ token, user: account }));
            return response.data;
        })
        .catch((error) => ErrorHandler(error));




export const login = (requestpayload: RegisterRequest) => (dispatch: any): Promise<RegisterResponse> =>
    axiosInstance.post('/login', requestpayload)
        .then((response) => {
            const token = response.data?.token;
            const account = response.data?.data;
            axios.defaults.headers.common[API_REQUEST_HEADER_NAME] = token;
            dispatch(setAuth({ token, user: account }));
            return response.data;
        })
        .catch((error) => ErrorHandler(error));


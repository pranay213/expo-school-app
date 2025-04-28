// src/hooks/useAlert.ts
import { useDispatch } from 'react-redux';
import { setSuccess, setError } from '../redux/slices/alertSlice';
import { showError, showSuccess } from '@/utlis/ToastService';


const useAlert = () => {
    const dispatch = useDispatch();

    const success = (message: string) => {
        dispatch(setSuccess(message));
        showSuccess(message);
    };

    const error = (message: string) => {
        dispatch(setError(message));
        showError(message);
    };

    return { success, error };
};

export default useAlert;

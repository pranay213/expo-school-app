// src/utils/ToastService.ts
import Toast from 'react-native-toast-message';

const showSuccess = (message: string) => {
    Toast.show({
        type: 'success',
        text1: 'Success',
        text2: message,
        position: 'top',
        visibilityTime: 3000,
        topOffset: 50,
    });
};

const showError = (message: string) => {
    Toast.show({
        type: 'error',
        text1: 'Error',
        text2: message,
        position: 'top',
        visibilityTime: 3000,
        topOffset: 50,
    });
};

export { showSuccess, showError };

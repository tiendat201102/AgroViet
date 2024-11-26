// utils/toast.ts
import { toast, ToastOptions, Bounce } from 'react-toastify';
// import "react-toastify/dist/ReactToastify.css";
// import 'react-toastify/dist/ReactToastify.min.css';
export const defaultToastConfig: ToastOptions = {
    position: "top-right",
    autoClose: 3000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
    theme: "colored",
    transition: Bounce,
};

export const showSuccessToast = (message: string) => {
    toast.success(message, defaultToastConfig);
};

export const showErrorToast = (message: string) => {
    toast.error(message, defaultToastConfig);
};

export const showInfoToast = (message: string) => {
    toast.info(message, defaultToastConfig);
};
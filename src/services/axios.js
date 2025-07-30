import axios from 'axios';
import {toggleToaster} from '../provider/features/helperSlice';
import {store} from "../provider/redux/store"
import {baseURL} from '../others/env';
// import { useDispatch } from 'react-redux';

const axiosInstance = axios.create({
    baseURL: baseURL,
    headers: {
        'Content-Type': 'application/json',
        // 'Access-Control-Allow-Origin':'*',
    }
});

axiosInstance.interceptors.request.use(
    config => {
        // List of routes where token should not be added
        const excludeRoutes = [];

        // Check if the requested URL is in the excludeRoutes list
        // const isExcludeRoute = excludeRoutes.some(route => config.url?.startsWith(route));
        // const isExcludeRoute = excludeRoutes.some(route => config.url?.includes(route));
         // Extract the pathname from the request URL
         const pathname = new URL(config.url, window.location.origin).pathname;
         console.log(pathname);

         // Check if the pathname matches any exclude route
         const isExcludeRoute = excludeRoutes.includes(pathname);


        // Add token only if it's not an exclude route
        // if (!isExcludeRoute) {
        //     const token = localStorage.getItem('access');
        //     if (token) {
        //         config.headers.Authorization = `Bearer ${localStorage.getItem('access')}`;
        //     }
        // }

        return config;
    },
    error => {
        return Promise.reject(error);
    }
);

// Add a response interceptor
axiosInstance.interceptors.response.use(
    response => {
        return response;
    },
    error => {
        const { response } = error;
        if (response && response.status === 403) {
            // Token is invalid or expired
            // Redirect to the login page or handle as needed
            // console.log('Token is invalid or expired');
            // Example redirection
            // alert('token expired.. You will be redirected to login')
            store.dispatch(toggleToaster({isOpen:true,toasterData:{type:"error",msg:"Token is invalid or expired. Redirecting..."}}))
            window.location.href = '/admin';

        }
        return Promise.reject(error);
    }
);

export default axiosInstance;

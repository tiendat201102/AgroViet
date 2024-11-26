import axios from "axios";

// Set config defaults when creating the instance
const instance = axios.create({
    // baseURL: import.meta.env.BACKEND_URL
    baseURL: "http://localhost:8080"

  });
  
  // Alter defaults after instance has been created
  // instance.defaults.headers.common['Authorization'] = localStorage.getItem("access_token");

// Add a request interceptor
instance.interceptors.request.use(function (config) {
    // Do something before request is sent
    // config.headers.Authorization = `Bearer ${localStorage.getItem("access_token")}`;


    return config;
  }, function (error) {
    // Do something with request error
    return Promise.reject(error);
  });

// Add a response interceptor
instance.interceptors.response.use(function (response) {
    // Any status code that lie within the range of 2xx cause this function to trigger
    // Do something with response data
    // if(response && response.data) 
      return response.data;
  }, function (error) {
    // Any status codes that falls outside the range of 2xx cause this function to trigger
    // Do something with response error
    console.log("check error: ", error);
    // if(error?.response?.data) {
    //   return error?.response?.data;
    // }
    if(error.response && error.response.data) {
      return Promise.reject(error.response.data);
  }
    return Promise.reject(error);
  });

export default instance;
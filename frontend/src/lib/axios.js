import axios from "axios";

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true, // by adding this field browser will send the cookies to server automatically, on every single req
});

axiosInstance.interceptors.request.use((config) => {
  const fullUrl = config.baseURL + config.url;
  console.log(`🔍 [AXIOS] Request: ${config.method.toUpperCase()} ${fullUrl}`);
  return config;
});

export default axiosInstance;

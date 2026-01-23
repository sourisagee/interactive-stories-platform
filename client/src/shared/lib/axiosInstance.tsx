import axios from 'axios';

export const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
});

let accessToken = '';

export const setAccessToken = (token: string) => {
  accessToken = token;
};

axiosInstance.interceptors.request.use((config) => {
  if (accessToken) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const prevRequest = error.config;

    if (error.response?.status === 403 && !prevRequest?._retry) {
      prevRequest._retry = true;

      try {
        const response = await axiosInstance.get('/auth/refreshTokens');
        const newAccessToken = response.data.data.accessToken;

        setAccessToken(newAccessToken);
        prevRequest.headers.Authorization = `Bearer ${newAccessToken}`;

        return axiosInstance(prevRequest);
      } catch {
        setAccessToken('');
        window.location.href = '/signIn';
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  },
);

export default axiosInstance;

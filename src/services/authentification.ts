import axios from 'axios';

const API_BASE_URL = 'https://preprod-api.iberis.io/ar/api/private/user';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});


export const signup = async (userData: any) => {
  return api.post('/register', userData);
};

export const login = async (credentials: any) => {
  return api.post('/login', credentials);
};

export const sendVerificationEmail = async (email: string) => {
  return api.post('/', { email });
};

export const verifyCode = async (email: string, code: string) => {
  return api.post('/', { email, code });
};
export const sendResetCode = (data: { email: string }) => {
  return axios.post('/reset', data); 
};

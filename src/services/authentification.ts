import axios, { AxiosResponse } from "axios";

const API_BASE_URL = 'https://preprod-api.iberis.io/fr/api/private/user';

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});


interface SignupData {
  name: string;
  email: string;
  password: string;
  terms: boolean;
  [key: string]: any;
}

interface LoginCredentials {
  email: string;
  password: string;
}
export interface ApiResponseData {
  status?: { code: number; message?: string };
  data?: { user?: { validation?: string; hashed_id?: string }; token?: string };
  errors?: { [key: string]: any[] };
  message?: string;
}

export const signup = async (userData: SignupData): Promise<AxiosResponse<ApiResponseData>> => {
  return api.post('/register', userData);
};

export const login = async (credentials: LoginCredentials) => {
  return api.post('/mobile/login', credentials);
};

export const verifyEmail = async (email: string, code: string): Promise<ApiResponseData> => {
  const response = await api.post('/email/validate', { email, code });
  return response.data;
};

export const resendVerifyCode = async (hashedUserId: string): Promise<ApiResponseData> => {
  const response = await api.post(`/email/pending/${hashedUserId}`);
  return response.data;
};

export const PhoneVerificationModel = {
  async sendOtp(phoneNumber: string, country: string): Promise<{ success: boolean; message?: string }> {
    console.log('Appel de sendOtp avec phoneNumber:', phoneNumber, 'et country:', country);
    try {
      const response = await api.get(`phone/check/${phoneNumber}/${country}`);
      console.log('Réponse de sendOtp:', response.data);
      return { success: true, ...response.data };
    } catch (error) {
      console.error('Erreur dans sendOtp:', error);
      
      if (axios.isAxiosError(error)) {
        let message = 'Erreur réseau';
        if (error.response?.status === 422) message = 'Format du numéro invalide';
        if (error.response?.status === 604) message = 'Ce numéro est déjà utilisé';
        if (error.message === 'Session expirée') {
          message = 'Session expirée. Veuillez vous reconnecter.';
        }
        console.log('Message d\'erreur généré:', message);
        return { success: false, message };
      }
      console.log('Erreur inconnue dans sendOtp');
      return { success: false, message: 'Erreur inconnue' };
    }
  },

  async verifyOtp(code: string): Promise<{ success: boolean; message?: string }> {
    console.log('Appel de verifyOtp avec code:', code);
    try {
      const response = await api.get(`phone/validate/${code}`);
      console.log('Réponse de verifyOtp:', response.data);
      return { success: true, ...response.data };
    } catch (error) {
      console.error('Erreur dans verifyOtp:', error);
      
      if (axios.isAxiosError(error)) {
        const message = error.response?.data?.message || 
                      (error.message === 'Session expirée' 
                       ? 'Session expirée. Veuillez vous reconnecter.'
                       : 'Code de vérification invalide ou expiré');
        console.log('Message d\'erreur généré:', message);
        return { success: false, message };
      }
      console.log('Erreur inconnue dans verifyOtp');
      return { success: false, message: 'Erreur inconnue' };
    }
  }
};

export const sendResetCode = async (email: string) => {
  console.log('Appel de sendResetCode avec email:', email);
  try {
    const resetCode = Math.floor(1000 + Math.random() * 9000).toString();
    console.log('Code de réinitialisation généré:', resetCode);
    
    const response = await api.post("/reset", { 
      email,
      code: resetCode
    });
    console.log('Réponse de sendResetCode:', response.data);

    localStorage.setItem('resetCode', resetCode);
    localStorage.setItem('resetEmail', email);
    console.log('Code et email sauvegardés dans le localStorage');

    return response.data;
  } catch (error) {
    console.error('Erreur dans sendResetCode:', error);
    
    if (axios.isAxiosError(error)) {
      const errorMsg = error.response?.data?.message || "Erreur d'envoi du code de réinitialisation";
      console.log('Message d\'erreur généré:', errorMsg);
      throw new Error(errorMsg);
    }
    console.log('Erreur inconnue dans sendResetCode');
    throw new Error('Erreur inconnue');
  }
};
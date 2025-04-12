import axios, { AxiosError, AxiosResponse } from "axios";

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
const checkTokenExpiry = (): boolean => {
  const expiry = localStorage.getItem('token_expiry');
  console.log('Vérification de l\'expiration du token. Timestamp actuel:', Date.now(), 'Expiration:', expiry);
  
  if (!expiry) {
    console.log('Aucun timestamp d\'expiration trouvé dans le localStorage');
    return true;
  }
  
  const isExpired = Date.now() > parseInt(expiry);
  console.log('Token expiré?:', isExpired);
  return isExpired;
};

// Intercepteur pour ajouter le token aux requêtes (sauf pour le login)
api.interceptors.request.use(config => {
  console.log('Intercepteur de requête - Début. URL:', config.url);

  // Ne pas vérifier le token pour les requêtes de login
  if (config.url?.includes('/mobile/login')) {
    console.log('Requête de login - bypass de la vérification du token');
    return config;
  }

  if (checkTokenExpiry()) {
    console.log('Token expiré - nettoyage du localStorage');
    localStorage.removeItem('auth_token');
    localStorage.removeItem('token_expiry');
    throw new axios.Cancel('Session expirée');
  }

  const token = localStorage.getItem('auth_token');
  if (token) {
    console.log('Ajout du token d\'authentification dans les headers');
    config.headers.Authorization = Bearer ${token};
  } else {
    console.log('Aucun token trouvé dans le localStorage');
  }
  
  console.log('Intercepteur de requête - Fin. Headers:', config.headers);
  return config;
}, error => {
  console.error('Erreur dans l\'intercepteur de requête:', error);
  return Promise.reject(error);
});

// fhmt chy !!!!!! arj3elha
api.interceptors.response.use(
  response => {
    console.log('Intercepteur de réponse - Succès. Status:', response.status, 'Data:', response.data);
    return response;
  },
  (error: AxiosError) => {
    console.error('Intercepteur de réponse - Erreur:', error);
    
    if (error.response?.status === 401 || error.response?.status === 403) {
      console.log('Erreur 401/403 détectée - nettoyage du localStorage');
      localStorage.removeItem('auth_token');
      localStorage.removeItem('token_expiry');
      
      if (!window.location.pathname.includes('/login')) {
        console.log('Redirection vers /login');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

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
export const sendResetCode = async (email: string) => {
  try {
    // Génération d'un code à 4 chiffres
    const resetCode = Math.floor(1000 + Math.random() * 9000).toString();
    
    const response = await api.post("/reset", { 
      email,
      code: resetCode // Envoyer le code généré au serveur
    });

    // Stocker le code localement pour la vérification
    localStorage.setItem('resetCode', resetCode);
    localStorage.setItem('resetEmail', email);

    return response.data;
    
  } catch (error) {
    // Gestion d'erreur existante
  }
};




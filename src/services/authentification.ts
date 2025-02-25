import axios from 'axios';

const API_BASE_URL = 'https://preprod-api.iberis.io/fr/api/private/user';

const api = axios.create({
  baseURL: API_BASE_URL,
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
}

interface LoginCredentials {
  email: string;
  password: string;
}



export const signup = async (userData: SignupData) => {
  return api.post('/register', userData);
};

export const login = async (credentials: LoginCredentials) => {
  return api.post('/login', credentials);
};

export const sendVerificationEmail = async (email: string) => {
  return api.post('/', { email });
};

export const verifyCode = async (email: string, code: string) => {
  return api.post('/', { email, code });
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

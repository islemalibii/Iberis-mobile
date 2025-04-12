import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { login, type ApiResponseData } from '@/services/authentification';
import { Preferences } from '@capacitor/preferences';

export const LoginController = () => {
  const router = useRouter();
  const email = ref('');
  const password = ref('');
  const errorMessage = ref('');
  const emailError = ref('');
  const passwordError = ref('');
  const isLoading = ref(false);

  // Stockage du token
  const storeAuthToken = async (token: string): Promise<void> => {
    try {
      localStorage.setItem('auth_token', token);
      await Preferences.set({ key: 'auth_token', value: token });
    } catch (error) {
      console.error('Token storage error:', error);
      throw new Error('Failed to store authentication token');
    }
  };

  // Validation du formulaire
  const validateForm = (): boolean => {
    emailError.value = '';
    passwordError.value = '';
    errorMessage.value = '';
    
    let isValid = true;

    if (!email.value.trim()) {
      emailError.value = 'Email field cannot be empty!';
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())) {
      emailError.value = 'Please enter a valid email address';
      isValid = false;
    }

    if (!password.value.trim()) {
      passwordError.value = 'Password field cannot be empty!';
      isValid = false;
    } else if (password.value.trim().length < 6) {
      passwordError.value = 'Password must be at least 6 characters';
      isValid = false;
    }

    return isValid;
  };

  // Gestion du login
  const handleLogin = async (): Promise<void> => {
    if (!validateForm()) return;
    
    isLoading.value = true;
    errorMessage.value = '';

    try {
      const response = await login({
        email: email.value.trim(),
        password: password.value.trim()
      });

      const responseData = response.data;

      // Gestion des différents cas de réponse
      switch (responseData.status?.code) {
        case 200: 
          if (responseData.data?.token) {
            await storeAuthToken(responseData.data.token);
            router.push('/clients');
          } else {
            throw new Error('Authentication token missing in response');
          }
          break;

        case 202: 
          break;

        case 203: 
          if (responseData.data?.token) {
            await storeAuthToken(responseData.data.token);
            router.push('/create-company');
          }
          break;

        case 401: 
          errorMessage.value = 'Invalid credentials';

          break;

        case 402: // Validation email requise
          if (responseData.data?.user?.hashed_id) {
            router.push({
              path: '/verify',
              query: { 
                email: email.value,
                hashedId: responseData.data.user.hashed_id 
              }
            });
          } else {
            throw new Error('Missing user data for email verification');
          }
          break;

        case 406: // Utilisateur banni
          errorMessage.value = 'Your account has been suspended';
          break;

        default:
          throw new Error(responseData.status?.message || 'Unexpected response from server');
      }
    } catch (error: unknown) {
      console.error('Login error:', error);
      
      if (error instanceof Error) {
        errorMessage.value = error.message;
      } else {
        errorMessage.value = 'An unexpected error occurred during login';
      }
    } finally {
      isLoading.value = false;
    }
  };

  // Connexion Google
  const handleGoogleSignUp = async (response: any) => {
    try {
      const idToken = response.credential;
      const userPayload = JSON.parse(atob(idToken.split(".")[1]));
      
      // Ici vous devrez implémenter l'appel à votre endpoint Google Auth
      // Ceci est un exemple - à adapter à votre API
      const loginResponse = await login({
        email: userPayload.email,
        password: 'google_oauth' // Mot de passe factice pour les connexions sociales
      });

      if (loginResponse.data.data?.token) {
        await storeAuthToken(loginResponse.data.data.token);
        router.push('/home');
      } else {
        router.push('/signup');
      }
    } catch (error) {
      console.error("Google Login Failed:", error);
      errorMessage.value = 'Google login failed. Please try again.';
    }
  };

  // Connexion Facebook
  const handleFacebookLogin = (response: any) => {
    if (response.status !== 'connected') {
      errorMessage.value = 'Facebook login failed. Please try again.';
      return;
    }

    const { accessToken } = response.authResponse;
    
    // Ici vous devrez implémenter l'appel à votre endpoint Facebook Auth
    // Ceci est un exemple - à adapter à votre API
    login({
      email: '', // Récupérer l'email depuis la réponse Facebook
      password: 'facebook_oauth' // Mot de passe factice pour les connexions sociales
    })
    .then(async (loginResponse) => {
      if (loginResponse.data.data?.token) {
        await storeAuthToken(loginResponse.data.data.token);
        router.push('/home');
      }
    })
    .catch(err => {
      console.error('Error with Facebook login:', err);
      errorMessage.value = 'Facebook login failed. Please try again.';
    });
  };

  return {
    // State
    email,
    password,
    errorMessage,
    emailError,
    passwordError,
    isLoading,
    
    // Methods
    handleLogin,
    handleGoogleSignUp,
    handleFacebookLogin
  };
};
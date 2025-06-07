import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { login } from '@/services/authentification';
import { Preferences } from '@capacitor/preferences';
import { getUserCompanies } from '@/services/User';


export const LoginController = () => {
  const router = useRouter();
  const email = ref('');
  const password = ref('');
  const errorMessage = ref('');
  const emailError = ref('');
  const passwordError = ref('');
  const isLoading = ref(false);

  const storeAuthToken = async (token: string): Promise<void> => {
    try {
      await Preferences.set({ key: 'auth_token', value: token });
    } catch (error) {
      console.error('Token storage error:', error);
      throw new Error('Failed to store authentication token');
    }
  };
  const storeCompanyId = async (companyId: string): Promise<void> => {
    try {
      await Preferences.set({ key: 'current_company_id', value: companyId });
    } catch (error) {
      console.error('Company ID storage error:', error);
      throw new Error('Failed to store company ID');
    }
  };

  const storeSalesParentJournal = async (journalId: string): Promise<void> => {
    try {
      await Preferences.set({ key: 'sales_parent_journal', value: journalId });
      console.log('Stored sales parent journal ID:', journalId);
    } catch (error) {
      console.error('Sales parent journal ID storage error:', error);
      throw new Error('Failed to store sales parent journal ID');
    }
  };
  const storeDefaultSalesParentJournal = async (defaultjournalId: string): Promise<void> => {
    try {
      await Preferences.set({ key: 'default_sales_parent_journal', value: defaultjournalId });
      console.log('Stored default sales journal ID:', defaultjournalId);
    } catch (error) {
      console.error('Default sales journal ID storage error:', error);
      throw new Error('Failed to store default sales journal ID');
    }
  };

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
      if (!responseData.data?.token) {
        throw new Error('Authentication token missing in response');
      }
      await storeAuthToken(responseData.data.token);
      const userCompany = await getUserCompanies.fetchAndStoreUserCompanies(responseData.data.token);
      console.log('Login successful. User data:', userCompany);


      switch (responseData.status?.code) {
        case 200: 
          if (responseData.data?.token) {
            if (!userCompany.owned_companies || userCompany.owned_companies.length === 0) {
              throw new Error('No companies found for this user');
            }
            const firstCompanyId = userCompany.owned_companies[0].company.hashed_id;
            await storeCompanyId(firstCompanyId);

            const firstCompany = userCompany.owned_companies[0].company;

            if (firstCompany.accounting_settings) {
              try {
                const accountingSettings = JSON.parse(firstCompany.accounting_settings);
                const salesParentJournalId = accountingSettings.salesParentJournal?.toString();
                const defaultSalesJournalId = accountingSettings.salesDefaultJournal?.toString();


                if (salesParentJournalId) {
                  await storeSalesParentJournal(salesParentJournalId);
                  console.log('Stored sales parent journal ID:', salesParentJournalId);
                } else {
                  console.warn('salesParentJournal not found in accounting settings');
                }
                if (defaultSalesJournalId) {
                  await storeDefaultSalesParentJournal(defaultSalesJournalId);
                  console.log('Stored default sales journal ID:', defaultSalesJournalId);
                } else {
                  console.warn('salesDefaultJournal not found in accounting settings');
                }
              } catch (parseError) {
                console.error('Error parsing accounting_settings:', parseError);
              }
            } else {
              console.warn('No accounting_settings found for the company');
            }
          

            router.push('/invoices');
          }
        break;

        case 202: 
          break;

        case 203: 
          if (responseData.data?.token) {
            await storeAuthToken(responseData.data.token);
            console.log("the token : ", responseData.data.token);
            router.push('/create-company');
          }
          break;
        case 401: 
          errorMessage.value = 'Invalid credentials';
          break;

        case 402: 
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

        case 406:
          errorMessage.value = 'Your account has been suspended';
          break;

        default:
          throw new Error(responseData.status?.message || 'Unexpected response from server');
      }
      const token = await Preferences.get({ key: 'auth_token' });
      const companyId = await Preferences.get({ key: 'current_company_id' });
      console.log('Verification - Stored Token:', token.value);
      console.log('Verification - Stored Company ID:', companyId.value);
    } catch (error: unknown) {
      console.error('Login error:', error);
      
      if (error instanceof Error) {
        errorMessage.value = error.message;
      } else {
        errorMessage.value = 'An unexpected error occurred during login';
      }
    }

    
  };

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
    email,
    password,
    errorMessage,
    emailError,
    passwordError,
    isLoading,
    
    handleLogin,
    handleGoogleSignUp,
    handleFacebookLogin
  };
};
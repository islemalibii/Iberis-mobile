import { ref } from 'vue';
import { Preferences } from '@capacitor/preferences';
import { AuthService } from '@/services/User';
import { useRouter } from 'vue-router';
import { nextTick } from 'vue';
// Assurez-vous que l'import est correct :
interface UserProfile {
  id: number;
  fullname: string;
  email: string;
  phone: string;
  image: string;
  birthday?: string;
  gender?: string;
  status: string;
  verificationCode: string;
  subscription: string;
  companiesOwned: any[];
  companiesJoined: any[];
  twoFactorEnabled: boolean;
  isPremium: boolean;
  subscriptionEndDate?: string;
  sessionExpiration?: number | null;

}

export function useUserController() {
  const router = useRouter();
  const userProfile = ref<UserProfile>({
    id: 0,
    fullname: '',
    email: '',
    phone: '',
    image: 'assets/default-avatar.png',
    status: 'Gratuit',
    verificationCode: '',
    subscription: 'Gratuit',
    companiesOwned: [],
    companiesJoined: [],
    twoFactorEnabled: false,
    isPremium: false
  });

  const loading = ref(false);
  const errorMessage = ref<string | null>(null);
  const currentPage = ref(1);
  const authToken = ref('');

  const getAuthToken = async (): Promise<string> => {
    try {
      const { value } = await Preferences.get({ key: 'auth_token' });
      if (!value) throw new Error('Token non trouvé');
      authToken.value = value;
      return value;
    } catch (error) {
      console.error('Erreur de récupération du token:', error);
      throw error;
    }
    
  };
  
  
  const loadUserProfile = async (): Promise<void> => {
    try {
      loading.value = true;
      const token = await getAuthToken();
      console.log('JWT Token:', token);

      const profile = await AuthService.fetchUserProfile(token);

      const isPremium = !!profile.current_finance_subscription && 
                       profile.current_finance_subscription.status === 1 &&
                       new Date(profile.current_finance_subscription.end) > new Date();
                       console.log('JWT Token:', token);

      userProfile.value = {
        ...userProfile.value,
        id: profile.hashed_id || '',
        fullname: profile.name || '',
        email: profile.email || '',
        phone: profile.phone || '',
        image: profile.photo || 'assets/default-avatar.png',
        birthday: profile.birthday ? profile.birthday.split('T')[0] : '',
        gender: profile.gender === 1 ? 'male' : profile.gender === 2 ? 'female' : 'other',
        status: isPremium ? 'Premium' : 'Gratuit',
        verificationCode: profile.validation || '',
        subscription: isPremium ? 'Premium' : 'Gratuit',
        companiesOwned: profile.owned_companies || [],
        companiesJoined: profile.joined_companies || [],
        twoFactorEnabled: profile.tfa_status === 1,
        isPremium,
        subscriptionEndDate: profile.current_finance_subscription?.end
      };
      console.log('State mis à jour:', userProfile.value);

    } catch (error) {
      console.error('Erreur loadUserProfile:', error);
      throw error;
    } finally {
      loading.value = false;
    }
  };
  const updateProfile = async (profileData: {
    fullname: string;
    birthday?: string;
    gender?: string;
    phone?: string;
    twoFactorEnabled?: boolean;
  }): Promise<void> => {
    try {
      console.log('[Controller] Début updateProfile', profileData);
      
      loading.value = true;
      const token = await getAuthToken();
  
      // Conversion des données
      const apiData = {
        name: profileData.fullname,
        birthday: profileData.birthday,
        gender: profileData.gender === 'male' ? 1 : 
               profileData.gender === 'female' ? 2 : 0,
        phone: profileData.phone,
        tfa_status: profileData.twoFactorEnabled ? 1 : 0
      };
      console.log('[Controller] Données transformées:', apiData);
  
      // Appel API
      const updatedUser = await AuthService.updateProfile(token, apiData);
      console.log('[Controller] Réponse API:', updatedUser);
  
      // Mise à jour réactive
      userProfile.value = {
        ...userProfile.value,
        fullname: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone,
        image: updatedUser.photo || 'assets/default-avatar.png',
        birthday: updatedUser.birthday ? updatedUser.birthday.split('T')[0] : '',
        gender: updatedUser.gender === 1 ? 'male' : 
               updatedUser.gender === 2 ? 'female' : 'other',
        twoFactorEnabled: updatedUser.tfa_status === 1
      };
  
      console.log('[Controller] State final:', userProfile.value);
      await nextTick();
  
    } catch (error : any) {
      console.error('[Controller] Erreur:', {
        error: error.message,
        stack: error.stack,
        response: error.response?.data
      });
      throw error;
    } finally {
      loading.value = false;
    }
  };
  const updateSessionExpiration = async (
    expirationTime: number | null
  ): Promise<{ success: boolean; message: string }> => {
    try {
      loading.value = true;
      const token = await getAuthToken();
      
      const result = await AuthService.updateSessionExpiration(token, expirationTime);
      
      // Mise à jour de l'état local
      userProfile.value.sessionExpiration = expirationTime;
      
      // Stockage local
      if (expirationTime) {
        await Preferences.set({
          key: 'session_expiration',
          value: expirationTime.toString()
        });
      } else {
        await Preferences.remove({ key: 'session_expiration' });
      }
  
      return result;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erreur inconnue';
      console.error('Erreur updateSessionExpiration:', message);
      return {
        success: false,
        message
      };
    } finally {
      loading.value = false;
    }
  };
  const requestAccountDeletion = async (): Promise<void> => {
    try {
      loading.value = true;
      const token = await getAuthToken();
      await AuthService.requestAccountDeletion(token);
      
      // Déconnexion après suppression
      await Preferences.remove({ key: 'auth_token' });
      router.push('/login');
    } catch (error) {
      console.error('Erreur demande suppression:', error);
      throw error;
    } finally {
      loading.value = false;
    }
  };

  const updatePassword = async (passwords: {
    old: string;
    new: string;
    confirm: string;
  }): Promise<void> => {
    try {
      if (passwords.new !== passwords.confirm) {
        throw new Error('Les mots de passe ne correspondent pas');
      }

      if (passwords.new.length < 6) {
        throw new Error('Le mot de passe doit contenir au moins 8 caractères');
      }

      loading.value = true;
      const token = await getAuthToken();
      
      await AuthService.updatePassword(token, {
        old: passwords.old,
        new: passwords.new,
        new_confirm: passwords.confirm
      });
    } catch (error) {
      console.error('Erreur updatePassword:', error);
      throw error;
    } finally {
      loading.value = false;
    }
  };

  const uploadImage = async (file: File): Promise<string> => {
    try {
      if (!file.type.startsWith('image/')) {
        throw new Error('Veuillez sélectionner une image valide');
      }

      if (file.size > 5 * 1024 * 1024) {
        throw new Error('La taille de l\'image ne doit pas dépasser 5MB');
      }

      loading.value = true;
      const token = await getAuthToken();
      
      const imageUrl = await AuthService.uploadImage(token, file);
      userProfile.value.image = imageUrl;
      
      return imageUrl;
    } catch (error) {
      console.error('Erreur uploadImage:', error);
      throw error;
    } finally {
      loading.value = false;
    }
  };

  return {
    userProfile,
    loading,
    errorMessage,
    currentPage,
    authToken,
    getAuthToken,
    loadUserProfile,
    updateProfile,
    updatePassword,
    uploadImage,
    requestAccountDeletion,
    updateSessionExpiration
  };
}

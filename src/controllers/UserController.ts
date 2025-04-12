// src/controllers/UserController.ts
import { ref } from 'vue';
import { AuthService } from '@/services/User';
import { UserProfile } from '@/models/UserModel';

export function useUserController() {
  const userProfile = ref<UserProfile>({
    id: 0,
    fullname: '',
    email: '',
    phone: '',
    image: 'assets/default-avatar.png',
    birthday: '',
    gender: '',
    status: '',
    verificationCode: '',
    subscription: '',
    companiesOwned: [],
    companiesJoined: [],
    twoFactorEnabled: false
  });
  
  const loading = ref<boolean>(false);
  const errorMessage = ref<string | null>(null);

  // src/controllers/UserController.ts
const loadUserProfile = async (token: string) => {
  console.log('[UserController] Début du chargement du profil');
  loading.value = true;
  errorMessage.value = null;

  try {
    const profile = await AuthService.fetchUserProfile(token);
    
    if (!profile.email && !profile.phone) {
      console.warn('[UserController] Profil incomplet - champs requis manquants');
      throw new Error('Les informations de profil essentielles sont manquantes');
    }

    userProfile.value = {
      ...userProfile.value,
      ...profile
    };

  } catch (error) {
    console.error('[UserController] Erreur:', error.message);
    errorMessage.value = error.message || 'Erreur de chargement du profil';
    
    userProfile.value = {
      ...userProfile.value,
      fullname: 'Utilisateur Test',
      email: 'test@example.com',
      phone: '+1234567890'
    };
  } finally {
    loading.value = false;
  }
};

  return {
    userProfile,
    loading,
    errorMessage,
    loadUserProfile,
  };
}
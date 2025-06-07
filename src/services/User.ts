import axios from 'axios';
import { UserProfile } from '@/models/UserModel';
import { Preferences } from '@capacitor/preferences';
import { Company } from '@/models/CompanyModel';

const API_BASE_URL = 'https://preprod-api.iberis.io/fr/api/private';

export const AuthService = {
  async fetchUserProfile(token: string): Promise<UserProfile> {
    try {
      console.log('Fetching user profile...');
      const response = await axios.get(`${API_BASE_URL}/user/me`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.status === 401) {
        throw new Error('Token is invalid or expired');
      }

      const userData = response.data?.data?.user;
      if (!userData) {
        throw new Error('Unexpected response structure');
      }
      
      return {
        ...userData,
        owned_companies: userData.owned_companies || [],
        joined_companies: userData.joined_companies || []
      };
    } catch (error) {
      console.error('Error fetching user profile:', error);
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || error.message);
      }
      throw error;
    }
  },
  async updateSessionExpiration(
    token: string, 
    expirationTime: number | null
  ): Promise<{ success: boolean; message: string }> {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/user/expiration`,
        { expiration_time: expirationTime },
        {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
  
      if (response.status === 201) {
        return {
          success: true,
          message: `Expiration de session activée (${expirationTime} minutes)`
        };
      } else if (response.status === 200) {
        return {
          success: true,
          message: 'Expiration de session désactivée'
        };
      }
  
      throw new Error('Réponse inattendue du serveur');
    } catch (error) {
      console.error('Error API:', error);
        throw  error ;
      
    }
  },
  async updateNotificationPreferences(
    token: string,
    preferences: NotificationPreferences
  ): Promise<{ success: boolean; message: string }> {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/user/notifications`,
        preferences,
        {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
  
      if (response.status === 200) {
        return {
          success: true,
          message: 'Préférences de notifications mises à jour'
        };
      }
      throw new Error('Réponse inattendue du serveur');
    } catch (error) {
      console.error('Erreur updateNotificationPreferences:', error);
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || error.message);
      }
      throw error;
    }
  },
  async requestAccountDeletion(token: string): Promise<void> {
    try {
      const response = await axios.get(`${API_BASE_URL}/user/profile/delete`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        timeout: 10000
      });
      
      if (response.status !== 200) {
        throw new Error(response.data?.message || 'La demande de suppression a échoué');
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errMsg = error.response?.data?.message || error.message;
        throw new Error(errMsg);
      }
      throw error;
    }
  },

 
  async updateProfile(token: string, profileData: {
    name: string;
    birthday?: string;
    gender?: number;
    phone?: string;
    tfa_status?: number;
  }): Promise<UserProfile> {
    try {
      console.log('[Service] Données reçues pour mise à jour:', profileData);
      
      const formData = new FormData();
      formData.append('name', profileData.name);
      
      if (profileData.birthday) {
        formData.append('birthday', profileData.birthday);
      }
      if (profileData.gender !== undefined) {
        formData.append('gender', profileData.gender.toString());
      }
      if (profileData.phone) {
        formData.append('phone', profileData.phone);
      }
      if (profileData.tfa_status !== undefined) {
        formData.append('tfa_status', profileData.tfa_status.toString());
      }
  
      console.log('[Service] Données envoyées à l\'API:', formData);
  
      const response = await axios.post(
        `${API_BASE_URL}/user/profile/general`,
        formData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );
  
      console.log('[Service] Réponse de l\'API:', response.data);
  
      if (!response.data?.data?.user) {
        console.error('[Service] Structure de réponse invalide');
        throw new Error('Structure de réponse API invalide');
      }
  
      return response.data.data.user;
  
    } catch (error : any) {
      console.error('[Service] Erreur complète:', {
        error: error,
        response: error.response?.data,
        config: error.config
      });
      throw error;
    }
  },
  async updatePassword(
    token: string, 
    passwords: {
      old: string;
      new: string;
      new_confirm: string;
    }
  ): Promise<{ success: boolean; message: string }> {
    try {
      if (passwords.new !== passwords.new_confirm) {
        throw new Error('Les mots de passe ne correspondent pas');
      }

      const response = await axios.post(
        `${API_BASE_URL}/user/profile/password`,
        passwords,
        {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.status === 200) {
        return {
          success: true,
          message: 'Mot de passe mis à jour avec succès'
        };
      }
      
      throw new Error('Réponse inattendue du serveur');
    } catch (error) {
      console.error('Error in updatePassword:', error);
      if (axios.isAxiosError(error)) {
        switch (error.response?.status) {
          case 403:
            throw new Error('Ancien mot de passe incorrect');
          case 422:
            throw new Error('Les mots de passe ne correspondent pas');
          default:
            throw new Error(error.response?.data?.message || 'Échec du changement de mot de passe');
        }
      }
      throw error;
    }
  },

  async uploadImage(token: string, file: File): Promise<string> {
    try {
      const formData = new FormData();
      formData.append('picture', file);

      const response = await axios.post(
        `${API_BASE_URL}/user/profile/general`, 
        formData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      if (!response.data?.data?.user?.photo) {
        throw new Error('Invalid response structure');
      }

      return response.data.data.user.photo;
    } catch (error) {
      console.error('Error in uploadImage:', error);
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Échec du téléchargement de l\'image');
      }
      throw error;
    }
  }
};

export const getUserCompanies = {
  async storeOwnedCompanies(companies: Company[]): Promise<void> {
    try {
      await Preferences.set({
        key: 'owned_companies',
        value: JSON.stringify(companies)
      });
    } catch (error) {
      console.error('Failed to store owned companies:', error);
      throw error;
    }
  },

  async storeJoinedCompanies(companies: Company[]): Promise<void> {
    try {
      await Preferences.set({
        key: 'joined_companies',
        value: JSON.stringify(companies)
      });
    } catch (error) {
      console.error('Failed to store joined companies:', error);
      throw error;
    }
  },
  async fetchAndStoreUserCompanies(token: string): Promise<UserProfile> {
    try {
      const response = await axios.get(`${API_BASE_URL}/user/me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });
      console.log("🔍 Received user response:", response.data);

      const user = response.data?.data?.user;
      if (!user) {
        throw new Error('Invalid response structure');
      }
      const ownedCompanies = user.owned_companies?.map((company: any) => ({
        ...company,
        companyId: company.hashed_company_id, 
      })) || [];
      await this.storeOwnedCompanies(ownedCompanies);

      const joinedCompanies = user.joined_companies?.map((company: any) => ({
        ...company,
        companyId: company.hashed_company_id, 
      })) || [];
      await this.storeJoinedCompanies(joinedCompanies);

  
      return user;
    } catch (error) {
      console.error('Failed to fetch user companies:', error);
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || error.message);
      }
      throw error;
    }
  },

  async fetchStoredCompanies(): Promise<{ ownedCompanies: Company[], joinedCompanies: Company[] }> {
    try {
      const ownedCompaniesStr = await Preferences.get({ key: 'owned_companies' });
      const joinedCompaniesStr = await Preferences.get({ key: 'joined_companies' });

      const ownedCompanies = ownedCompaniesStr.value ? JSON.parse(ownedCompaniesStr.value) : [];
      const joinedCompanies = joinedCompaniesStr.value ? JSON.parse(joinedCompaniesStr.value) : [];

      return {
        ownedCompanies,
        joinedCompanies
      };
    } catch (error) {
      console.error('Failed to fetch stored companies:', error);
      throw error;
    }
  }
};
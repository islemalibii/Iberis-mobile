// src/services/user.ts
import axios from 'axios';
import { UserProfile } from '@/models/UserModel';

const API_URL = 'https://preprod-api.iberis.io/fr/api/private/profile';

export const AuthService = {
  async decodeToken(token: string) {
    console.log('[AuthService] Début du décodage du token');
    try {
      console.log('[AuthService] Token reçu:', token.substring(0, 10) + '...');
      
      const base64Url = token.split('.')[1];
      if (!base64Url) {
        throw new Error('Token JWT malformé - partie payload manquante');
      }

      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      console.log('[AuthService] Base64 décodé:', base64);

      const payload = JSON.parse(atob(base64));
      console.log('[AuthService] Payload décodé:', payload);

      const userInfo = {
        email: payload.email || '',
        phone: payload.phone || '',
        fullname: payload.name || payload.fullname || ''
      };

      console.log('[AuthService] Infos utilisateur extraites:', userInfo);
      return userInfo;
    } catch (error) {
      console.error('[AuthService] Erreur de décodage:', error);
      throw new Error('Échec du décodage du token');
    }
  },


  async fetchUserProfile(token: string) {
    console.log('[AuthService] Récupération du profil utilisateur');
    try {
      // Essayer d'abord l'endpoint principal
      let response;
      try {
        response = await axios.get(`${API_URL}/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log('[AuthService] Réponse API /me:', response.data);
      } catch (apiError) {
        console.warn('[AuthService] Endpoint /me non disponible, tentative avec /profile');
        response = await axios.get(API_URL, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }

      // Vérifier la structure de la réponse
      if (!response.data.data) {
        console.warn('[AuthService] Structure de réponse inattendue:', response.data);
        throw new Error('Structure de réponse API invalide');
      }

      return {
        email: response.data.data.email || '',
        phone: response.data.data.phone || '',
        fullname: response.data.data.fullname || response.data.data.name || '',
        ...response.data.data // Inclure toutes les autres données
      };
    } catch (error) {
      console.error('[AuthService] Erreur fetchUserProfile:', {
        error: error.response?.data || error.message,
        status: error.response?.status
      });
      throw new Error('Impossible de récupérer le profil');
    }
  },
 
  async updateProfile(token: string, data: Partial<UserProfile>) {
    try {
      const response = await axios.patch(`${API_URL}`, data, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data.data;
    } catch (error) {
      console.error('Erreur de mise à jour du profil:', error);
      throw error;
    }
  },

  async uploadImage(token: string, file: File) {
    try {
      const formData = new FormData();
      formData.append('avatar', file);

      const response = await axios.post(`${API_URL}/avatar`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data.imageUrl;
    } catch (error) {
      console.error('Erreur de téléchargement de l\'image:', error);
      throw error;
    }
  },
};
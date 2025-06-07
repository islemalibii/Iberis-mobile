import { AxiosError } from 'axios';
import { Preferences } from '@capacitor/preferences';
import axios from 'axios';

const API_BASE_URL = 'https://preprod-api.iberis.io/fr/api/private';

export const useNotificationService = () => {
  const getAuthToken = async (): Promise<string> => {
    const { value } = await Preferences.get({ key: 'auth_token' });
    if (!value) throw new Error('Token non trouvé');
    return value;
  };

  const updateNotificationPreferences = async (preferences: any) => {
    try {
      const token = await getAuthToken();
      const payload = {
        ...preferences,
        token
      };

      const response = await axios.post(
        `${API_BASE_URL}/user/notifications`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          timeout: 10000
        }
      );

      return response.data;
    } catch (error) {
      const err = error as AxiosError;
      console.error('Erreur API:', {
        status: err.response?.status,
        data: err.response?.data,
        config: err.config
      });
      throw error;
    }
  };

  const getNotifications = async (status: number = 0) => {
    try {
      const token = await getAuthToken();
      const response = await axios.get(
        `${API_BASE_URL}/user/notifications/list/${status}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          },
          timeout: 10000
        }
      );

      return response.data.data.notifications.data; // Retourne directement les notifications
    } catch (error) {
      const err = error as AxiosError;
      console.error('Erreur API:', {
        status: err.response?.status,
        data: err.response?.data,
        config: err.config
      });
      throw error;
    }
  };

  return {
    updateNotificationPreferences,
    getNotifications
  };
};

import { ref } from 'vue';
import { useNotificationService } from '@/services/NotificationService';

export const useNotificationController = () => {
  const notificationService = useNotificationService();

  const isLoading = ref(false);
  const error = ref<string | null>(null);
  const notifications = ref<any[]>([]);

  const updateNotificationPreferences = async (preferences: any) => {
    try {
      isLoading.value = true;
      error.value = null;
      console.log('[TEST] Début mise à jour');

      const response = await notificationService.updateNotificationPreferences(preferences);

      console.log('[TEST] Mise à jour réussie');
      return response;
    } catch (err: any) {
      error.value = err.response?.data?.message , err.message;
      console.error('[TEST] Erreur contrôleur:', err);
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  const getNotifications = async (status: number = 0) => {
    try {
      isLoading.value = true;
      error.value = null;

      console.log('[TEST] Chargement des notifications...');

      const response = await notificationService.getNotifications(status);
      notifications.value = response; // Assurez-vous que les notifications sont mises à jour correctement

      console.log('[TEST] Notifications chargées:', notifications.value);
    } catch (err: any) {
      error.value = err.response?.data?.message , err.message;
      console.error('[TEST] Erreur getNotifications:', err);
    } finally {
      isLoading.value = false;
    }
  };

  return {
    isLoading,
    error,
    notifications,
    updateNotificationPreferences,
    getNotifications
  };
};
import { TimelineService } from '@/services/TimelineProvider';
import { toastController } from '@ionic/vue';
import { ref, computed, onMounted } from 'vue';

import {
  timeOutline,
  documentTextOutline,
  receiptOutline,
  cartOutline,
  cashOutline,
  walletOutline,
  pencilOutline,
  paperPlaneOutline,
  checkmarkDoneOutline
} from 'ionicons/icons';

export const useProviderTimeline = (providerId: string) => {
  const isLoading = ref(true);
  const error = ref<string | null>(null);
  const timelineData = ref<Record<string, any>>({});

  const loadTimeline = async () => {
    try {
      isLoading.value = true;
      error.value = null;
      const response = await TimelineService.getProviderTimeline(providerId);
      timelineData.value = response.data.timeline;
    } catch (err: any) {
      error.value = err.message || 'Erreur de chargement du historique';
      console.error('Erreur timeline fournisseur:', err);
    } finally {
      isLoading.value = false;
    }
  };

  // Computed properties
  const totalActions = computed(() => {
    return Object.values(timelineData.value).reduce((total, entities) => {
      return total + Object.values(entities).flat().length;
    }, 0);
  });

  const timelineRange = computed(() => {
    const dates = Object.keys(timelineData.value);
    if (dates.length === 0) return 'Aucune activité récente';
    const sortedDates = dates.sort();
    return `Activités du ${formatDate(sortedDates[0])} au ${formatDate(sortedDates[sortedDates.length - 1])}`;
  });

  // Helpers
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const getEntityIcon = (entityId: string) => {
    const [entityType] = entityId.split('_');
    switch (entityType.toLowerCase()) {
      case 'service':
        return documentTextOutline;
      case 'receipt':
        return receiptOutline;
      case 'order':
        return cartOutline;
      case 'payment':
        return cashOutline;
      case 'withholding':
        return walletOutline;
      default:
        return documentTextOutline;
    }
  };

  const getActionIcon = (action: string) => {
    if (action.includes('Créé')) return checkmarkDoneOutline;
    if (action.includes('Mis')) return pencilOutline;
    if (action.includes('Envoyé')) return paperPlaneOutline;
    return timeOutline;
  };
const getActionColor = (action: string) => {
  if (action.includes('Créé')) return 'action-created';
  if (action.includes('Mis')) return 'action-updated';
  if (action.includes('Envoyé')) return 'action-sent';
  return '';
};
const getActionText = (action: string) => action.split(' le ')[0];
const getActionTime = (action: string) => action.split(' à ')[1].split(' par ')[0];
const getUserInfo = (action: string) => action.split(' par ')[1];

  onMounted(() => {
  loadTimeline();
});

  // Error handling
  const showErrorToast = async (message: string) => {
    const toast = await toastController.create({
      message,
      duration: 3000,
      color: 'danger',
      position: 'top'
    });
    await toast.present();
  };

  onMounted(loadTimeline);

  return {
    timelineData,
    isLoading,
    error,
    totalActions,
    timelineRange,
    formatDate,
    getEntityIcon,
    getActionIcon,
    getActionColor,
  getActionText,
  getActionTime,
  getUserInfo,
      reloadTimeline: loadTimeline,
    showErrorToast
  };
};

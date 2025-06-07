import { TimelineService } from '@/services/TimelineService';
import { toastController } from '@ionic/vue';
import { ref, computed, onMounted } from 'vue';

import {
 timeOutline,
  documentTextOutline,cubeOutline,
  ticketOutline, addCircleOutline, pencilOutline,
  paperPlaneOutline, documentAttachOutline,
  cashOutline
} from 'ionicons/icons';
export const useTimeline = (clientId: string) => {
  const isLoading = ref(true);
  const error = ref<string | null>(null);

const timelineData = ref<Record<string, any>>({}); // Remplacer 'timeline' par 'timelineData'


const loadTimeline = async () => {
  try {
    isLoading.value = true;
    error.value = null;
    const response = await TimelineService.getClientTimeline(clientId);
    timelineData.value = response.data.timeline; // Bien assigner à timelineData
  } catch (err: any) {
    error.value = err.message || 'Erreur de chargement';
    console.error('Erreur timeline:', err);
  } finally {
    isLoading.value = false;
  }
};
const totalActions = computed(() => {
  return Object.values(timelineData.value).reduce((total, entities) => {
    return total + Object.values(entities).flat().length;
  }, 0);
});

const timelineRange = computed(() => {
  const dates = Object.keys(timelineData.value);
  if (dates.length === 0) return 'Aucune donnée disponible';
  const sortedDates = dates.sort();
  return `Du ${formatDate(sortedDates[0])} au ${formatDate(sortedDates[sortedDates.length - 1])}`;
});

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
};

const getEntityIcon = (entityId: string) => {
  if (entityId.startsWith('EST')) return documentAttachOutline;
  if (entityId.startsWith('DN')) return cubeOutline;
  if (entityId.startsWith('EV')) return ticketOutline;
    if (entityId.startsWith('PAY-S-')) return cashOutline;

  return documentTextOutline;
};

const getActionIcon = (action: string) => {
  if (action.includes('Créé')) return addCircleOutline;
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
  const showErrorToast = async (message: string) => {
    const toast = await toastController.create({
      message,
      duration: 3000,
      color: 'danger',
      position: 'top'
    });
    await toast.present();
  };

  onMounted(() => loadTimeline());

  return {
    timelineData,
    isLoading,
    error,
    totalActions,
    formatDate,
    showErrorToast,
    getUserInfo,
    getActionText,
    getActionIcon,
    getActionColor,
    getActionTime,
    getEntityIcon,
    timelineRange,
    reload: loadTimeline
  };
};
import { ref, computed, onMounted } from 'vue';
import { toastController, loadingController ,popoverController} from '@ionic/vue';
import { useRoute } from 'vue-router';
import { 
  deleteService, 
  duplicateService, 
  fetchClientServices, 
  validateService,
  downloadService 
} from '@/services/ServiceService';
import { 
  ServicePurchase, 
  getServiceStatusText, 
  getServiceStatusClass, 
  formatDate, 
  formatCurrency 
} from '@/models/Services';
import { alertController } from '@ionic/vue';

export const useServiceController = () => {
  type ServiceAction = "modify" | "delete" | "download" | "validate" | "duplicate";
  
  const route = useRoute();
  const clientId = ref<string>((route.params.id as string) || '');
  const services = ref<ServicePurchase[]>([]);
  const isLoading = ref(false);
  const error = ref<string | null>(null);
  const searchQuery = ref('');
  const currentPage = ref(1);
  const itemsPerPage = 10;
  
  const isModalOpen = ref(false);
  const selectedService = ref<ServicePurchase | null>(null);
  const expandedServiceId = ref<string | null>(null);

  // Filtrage et pagination
  const filteredServices = computed(() => {
    if (!searchQuery.value) return services.value;
    const query = searchQuery.value.toLowerCase();
    return services.value.filter(service => 
      service.hashed_id?.toLowerCase().includes(query) ||
      (service.reference_number?.toLowerCase().includes(query)) ||
      (service.contact?.display_name?.toLowerCase().includes(query))
    );
  });

  const paginatedServices = computed(() => {
    const start = (currentPage.value - 1) * itemsPerPage;
    return filteredServices.value.slice(start, start + itemsPerPage);
  });

  const totalPages = computed(() => Math.ceil(filteredServices.value.length / itemsPerPage));

  // Helpers
  const showToast = async (message: string, color: 'success' | 'danger' | 'warning' = 'success') => {
    const toast = await toastController.create({ message, duration: 2000, color, position: 'top' });
    await toast.present();
  };

  const createLoading = async (message: string) => {
    const loading = await loadingController.create({ message, spinner: 'circular' });
    await loading.present();
    return loading;
  };

  // Chargement des données
  const loadServices = async () => {
    isLoading.value = true;
    try {
      services.value = await fetchClientServices(clientId.value);
      if (services.value.length === 0) await showToast('Aucun service trouvé', 'warning');
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Erreur inconnue';
      await showToast(error.value, 'danger');
    } finally {
      isLoading.value = false;
    }
  };

  // Gestion des actions
  const handleAction = async (action: ServiceAction, event: Event, service: ServicePurchase) => {
    event.stopPropagation();
    const popover = await popoverController.getTop();
    
    try {
      switch(action) {
        case 'download': await handleDownload(service); break;
        case 'delete': await confirmDelete(service); break;
        case 'validate': await handleValidate(service); break;
        case 'duplicate': await handleDuplicate(service); break;
        default: await showToast('Action non supportée', 'warning');
      }
    } catch (error) {
      await showToast(`Erreur lors de l'action: ${error instanceof Error ? error.message : 'Erreur inconnue'}`, 'danger');
    } finally {
      if (popover) await popover.dismiss();
    }
  };

  // Téléchargement
  const handleDownload = async (service: ServicePurchase) => {
    const loading = await createLoading('Préparation du téléchargement...');
    try {
      await downloadService(service.hashed_id!);
      await showToast('Téléchargement démarré', 'success');
    } catch (error) {
      await showToast(error instanceof Error ? error.message : 'Échec du téléchargement', 'danger');
    } finally {
      loading.dismiss();
    }
  };
 const updateServiceStatus = (serviceId: string, status: number) => {
    const serviceIndex = services.value.findIndex(service => service.hashed_id === serviceId);
    if (serviceIndex !== -1) {
        services.value[serviceIndex].status = status;
    }

    if (isModalOpen.value && selectedService.value?.hashed_id === serviceId) {
        selectedService.value.status = status;
    }
};
   

const handleValidate = async (service: ServicePurchase) => {
    try {
      const result = await validateService(service.hashed_id);
      
      if (result.status.code === 200) {
        updateServiceStatus(service.hashed_id, 1); 
        await showToast(result.status.message);
      } else {
        throw new Error(result.status.message);
      }
    } catch (error) {
      await showToast(
        error instanceof Error ? error.message : 'Échec de la validation',
        'danger'
      );
    }
  };

  const handleDuplicate = async (service: ServicePurchase) => {
    const loading = await createLoading("Duplication en cours...");

    try {
      console.log("Début duplication pour:", service.hashed_id);

      const result = await duplicateService(service);
      console.log("Résultat duplication:", result);

      if (result.success) {
        await loadServices();
        await showToast(result.message, "success");
      }
    } catch (error: any) {
      console.error("Erreur duplication:", error);
      const errorMessage =
        error instanceof Error ? error.message : typeof error === "string" ? error : "Erreur inconnue";
      await showToast(errorMessage, "danger");
    } finally {
      await loading.dismiss();
    }
  };

  const getServiceId = (service: ServicePurchase): string => {
    return service?.hashed_id || '';
  };
  // Suppression
  const confirmDelete = async (service: ServicePurchase) => {
    const alert = await alertController.create({
      header: 'Confirmer la suppression',
      message: `Supprimer le service #${service.hashed_id} ?`,
      buttons: [
        { text: 'Annuler', role: 'cancel' },
        { 
          text: 'Supprimer', 
          handler: async () => {
            const loading = await createLoading('Suppression...');
            try {
              await deleteService(service.hashed_id!);
              services.value = services.value.filter(s => s.hashed_id !== service.hashed_id);
              await showToast('Service supprimé', 'success');
              if (selectedService.value?.hashed_id === service.hashed_id) closeModal();
            } catch (error) {
              await showToast('Échec de la suppression', 'danger');
            } finally {
              loading.dismiss();
            }
          }
        }
      ]
    });
    await alert.present();
  };

  // Gestion modale
  const openServiceModal = (service: ServicePurchase) => {
    selectedService.value = service;
    isModalOpen.value = true;
  };

  const closeModal = () => {
    isModalOpen.value = false;
    selectedService.value = null;
  };

  // Initialisation
  onMounted(loadServices);

  return {
    // State
    services,
    isLoading,
    error,
    searchQuery,
    currentPage,
    itemsPerPage,
    isModalOpen,
    selectedService,
    expandedServiceId,
    
    // Computed
    filteredServices,
    paginatedServices,
    totalPages,
    
    // Methods
    loadServices,
    handleAction,
    openServiceModal,
    closeModal,
    toggleAccordion: (id: string) => expandedServiceId.value = expandedServiceId.value === id ? null : id,
    getStatusDetails: (status: number) => ({
      class: getServiceStatusClass(status),
      text: getServiceStatusText(status)
    }),
    formatDate,
    formatCurrency,
    nextPage: () => currentPage.value < totalPages.value && currentPage.value++,
    prevPage: () => currentPage.value > 1 && currentPage.value--,
    resetPagination: () => currentPage.value = 1
  };
};
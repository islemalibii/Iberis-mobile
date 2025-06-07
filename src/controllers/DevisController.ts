import { ref, computed, onMounted } from 'vue';
import { toastController,loadingController } from '@ionic/vue';
import { downloadEstimate,fetchClientEstimates,deleteEstimate, fetchEstimateDetails, validateEstimate} from '@/services/Devis';
import { useRoute } from 'vue-router';
import {
  Estimate,
  formatEstimateDate as formatDate,
  getEstimateStatusClass,
  getEstimateStatusText,
  formatEstimateCurrency as formatCurrency,
} from '@/models/DevisModel';
import{duplicateEstimate}from'@/services/Devis'

import { useRouter } from 'vue-router';

type EstimateAction = "modify" | "delete" | "download" | "send" | "visualize" | "validate" | "duplicate";
import { popoverController } from '@ionic/vue';

export const EstimatesController = () => {
  const route = useRoute();
    const router = useRouter();
  
  const clientId = ref<string>(route.params.id as string);
  const estimates = ref<Estimate[]>([]);
  const currentPage = ref(1);
  const estimatesPerPage = 10;
  const isLoading = ref(false);
  const error = ref<string | null>(null);
  const searchQuery = ref('');
  const selectedEstimate = ref<Estimate | null>(null);
  const isModalOpen = ref(false);
  const expandedEstimate = ref<string | null>(null);

  const showToast = async (message: string, color: 'success' | 'danger' | 'warning' = 'success') => {
    const toast = await toastController.create({
      message,
      duration: 2000,
      color,
      position: 'top'
    });
    await toast.present();
  };
  const createLoading = async (message: string) => {
    const loading = await loadingController.create({
      message,
      spinner: 'circular',
    });
    await loading.present();
    return loading;
  };

const handleDuplicateEstimate = async (estimate: Estimate) => {
        const loading = await createLoading("Duplication en cours...");
      
        try {
          console.log("Début duplication pour:", estimate.hashed_id);
      
          const result = await duplicateEstimate(estimate);
          console.log("Résultat duplication:", result);
      
          if (result.success) {
            await loadEstimates();
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
  const loadEstimates = async () => {
       isLoading.value = true;
       error.value = null;
       try {
         estimates.value = await fetchClientEstimates(clientId.value);
         if (estimates.value.length === 0) {
           await showToast('Aucun bon de sortie trouvé pour ce client', 'warning');
         }
       } catch (err) {
         error.value = err instanceof Error ? err.message : 'Erreur inconnue';
         await showToast(error.value, 'danger');
       } finally {
         isLoading.value = false;
       }
     };
     
     

  const filteredEstimates = computed(() => {
    if (!searchQuery.value) return estimates.value;
    const query = searchQuery.value.toLowerCase();
    return estimates.value.filter(estimate => 
      (estimate.estimate_number?.toLowerCase().includes(query)) ||
      (estimate.reference_number?.toLowerCase().includes(query))
    );
  });

  const paginatedEstimates = computed(() => {
    const start = (currentPage.value - 1) * estimatesPerPage;
    return filteredEstimates.value.slice(start, start + estimatesPerPage);
  });

  const totalPages = computed(() => {
    return Math.ceil(filteredEstimates.value.length / estimatesPerPage);
  });

  const openEstimateModal = async (estimate: Estimate) => {
    try {
      isLoading.value = true;
      expandedEstimate.value = null;
      
      const details = await fetchEstimateDetails(estimate.hashed_id);
      selectedEstimate.value = {
        ...estimate,
        ...details 
      };
      
      isModalOpen.value = true;
    } catch (error) {
      console.error('Error loading estimate details:', error);
      await showToast('Erreur lors du chargement des détails', 'danger');
      selectedEstimate.value = estimate;
      isModalOpen.value = true;
    } finally {
      isLoading.value = false;
    }
  };

  const closeModal = () => {
    isModalOpen.value = false;
    selectedEstimate.value = null;
  };

  const toggleAccordion = (id: string, event?: Event) => {
    event?.stopPropagation();
    expandedEstimate.value = expandedEstimate.value === id ? null : id;
  };

  const nextPage = () => currentPage.value < totalPages.value && currentPage.value++;
  const prevPage = () => currentPage.value > 1 && currentPage.value--;

  const handleDeleteEstimate = async (estimate: Estimate) => {
    try {
      const success = await deleteEstimate(estimate.hashed_id);
      if (success) {
        await showToast('Devis supprimé avec succès', 'success');
        estimates.value = estimates.value.filter(e => e.hashed_id !== estimate.hashed_id);
        closeModal();
      } else {
        throw new Error('Échec de la suppression');
      }
    } catch (error) {
      console.error('Error deleting estimate:', error);
      await showToast('Échec de la suppression du devis', 'danger');
    }
  };
  const updateEstimateStatus = (deliveryId: string, status: number) => {
    const index = estimates.value.findIndex(note => note.hashed_id === deliveryId);
    if (index !== -1) {
        estimates.value[index].status = status;
    }

    if (isModalOpen.value && selectedEstimate.value?.hashed_id === deliveryId) {
        selectedEstimate.value.status = status;
    }
};
const handleValidate = async (estimate: Estimate) => {
    try {
        isLoading.value = true;
        
        // 1. Optimistic UI update
        const originalStatus = estimate.status;
        estimate.status = 2; // Statut validé
        
        // 2. Appel API
        const result = await validateEstimate(estimate.hashed_id);
        
        // 3. Vérification serveur
        if (result.status.code !== 200) {
            throw new Error(result.status.message);
        }
        
        // 4. Rechargement des données
        await loadEstimates();
        
        await showToast(result.status.message, 'success');
        
    } catch (error) {
        // Rollback UI
        if (estimate) estimate.status = originalStatus;
        
        await showToast(
            error.status?.message || 
            error.message || 
            'Erreur lors de la validation',
            'danger'
        );
        
        console.error('Validation failed:', {
            estimateId: estimate?.hashed_id, 
            error
        });
    } finally {
        isLoading.value = false;
    }
};
const getEstimateId = (estimate: Estimate): string => {
  return estimate?.hashed_id || estimate.hashed_id|| '';
};


const handleAction = async (action: EstimateAction, event: Event, estimate: Estimate | null ) => {
    if (!estimate) return;
    event.stopPropagation();
    try {
        switch (action) {
            case 'download':
                await downloadEstimate(estimate.hashed_id);
                break;
            case 'delete':
                await handleDeleteEstimate(estimate);
                break;
            case 'validate':
                await handleValidate(estimate);
                   break;
            case 'duplicate':
  await handleDuplicateEstimate(estimate);
  break;


    case "modify":
                closeModal();
                
                if (!estimate) {
                    console.error("Erreur: estimate est null ou undefined");
                    await showToast('Devis invalide ou manquant', 'warning');
                    return;
                }
                
                const routeClientId = route.params.id as string;
                const estimateId = getEstimateId(estimate);
                
                console.log('Client ID from route:', routeClientId);
                console.log('Estimate ID:', estimateId);
                
                if (!routeClientId) {
                    console.error("ID client manquant dans l'URL");
                    await showToast('ID client introuvable', 'warning');
                    return;
                }
                
                await showToast(`Navigation vers: Client ${routeClientId}, Devis ${estimateId}`, 'warning');
                
                router.push({
                    path: `/clients/${routeClientId}/estimate/${estimateId}/edit_estimate`,
                    query: { 
                        client_id: routeClientId,
                        estimate_id: estimateId
                    }
                });
                break;
                
        }
        await popoverController.dismiss();

    } catch (error) {
        await showToast(
            error instanceof Error ? error.message : 'Action failed',
            'danger'
        );
    }
};

  onMounted(() => {
    loadEstimates();
  });

  return {
    clientId,
    estimates,
    currentPage,
    totalPages,
    paginatedEstimates,
    isLoading,
    error,
    searchQuery,
    selectedEstimate,
    isModalOpen,
    expandedEstimate,
    formatDate,
    formatCurrency,
    getEstimateStatusClass,
    getEstimateStatusText,
    openEstimateModal,
    closeModal,
    toggleAccordion,
    nextPage,
    prevPage,
    handleAction,
    handleDuplicateEstimate,
    handleValidate
  };
};
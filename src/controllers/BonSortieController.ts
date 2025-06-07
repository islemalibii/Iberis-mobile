import { ref, computed, onMounted } from 'vue';
import { toastController, loadingController } from '@ionic/vue';
import { 
  deleteExitVoucher,
  fetchExitVouchers, 
  downloadExitVoucher,
  getExitVoucher,
  fetchClientExitVouchers,
  validateExitVoucher,
  duplicateExitVoucher,
} from '@/services/BonSortie';

import { ExitVoucher} from '@/models/BonSortieModel';
//import{TimelineEvent}from'@/models/TimelineEvent'
import { useRoute } from 'vue-router';
import { useRouter } from 'vue-router';

export const useExitVoucherController = () => {
  type ExitVouchersAction = "modify" | "delete" | "download" | "send" | "visualize" | "validate" | "duplicate";
  
  const router = useRouter();
  const route = useRoute();
  const clientId = ref<string>((route.params.id as string) || '');
  const exitVouchers = ref<ExitVoucher[]>([]);
  const isLoading = ref(false);
  const error = ref<string | null>(null);
  const searchQuery = ref('');
  const currentPage = ref(1);
  const itemsPerPage = 10;
  
  const isModalOpen = ref(false);
  const selectedExitVoucher = ref<ExitVoucher | null>(null);
  const expandedExitVoucherId = ref<string | null>(null);
//const timelineEvents = ref<TimelineEvent[]>([]);
const formatTimelineDate = (isoDate: string) => {
  return new Date(isoDate).toISOString().split('T')[0];
};
  // Filtrage des bons de sortie
  const filteredVouchers = computed(() => {
    if (!searchQuery.value) return exitVouchers.value;
    const query = searchQuery.value.toLowerCase();
    return exitVouchers.value.filter(voucher => 
      voucher.exit_voucher_number.toLowerCase().includes(query) ||
      (voucher.reference_number && voucher.reference_number.toLowerCase().includes(query))
    );
  });

  // Pagination des bons de sortie
  const paginatedVouchers = computed(() => {
    const start = (currentPage.value - 1) * itemsPerPage;
    return filteredVouchers.value.slice(start, start + itemsPerPage);
  });

  const totalPages = computed(() => Math.ceil(filteredVouchers.value.length / itemsPerPage));

  // Utilitaire pour afficher les toasts
  const showToast = async (message: string, color: 'success' | 'danger' | 'warning' = 'success') => {
    const toast = await toastController.create({
      message,
      duration: 2000,
      color,
      position: 'top'
    });
    await toast.present();
  };

  // Utilitaire pour créer un indicateur de chargement
  const createLoading = async (message: string) => {
    const loading = await loadingController.create({
      message,
      spinner: 'circular',
    });
    await loading.present();
    return loading;
  };

  // Structure du formulaire de bon de sortie
  const exitVoucherForm = ref({
    date: new Date().toISOString().split('T')[0],
    category: "0",
    object: "",
    use_conditions: 0,
    invoice_number: {
      year: new Date().getFullYear().toString(),
      number: ""
    },
    client_id: "",
    referenceNumber: "",
    item: [] as Array<{
      id: string;
      title: string;
      description: string;
      quantity: number;
      unitPrice: number;
      discount: {
        value: number;
        type: string;
      };
      taxes: Array<{
        id: string;
        type: string;
        rate: number;
      }>;
      price: number;
    }>,
    tax_type: 0,
    generalTerms: "À payer à réception",
    attachments: [] as File[],
    totals: {
      discount: 0,
      total: 0,
      taxes: 0,
      subtotal: 0
    },
    additionalEntries: {
      tva: 0
    },
    watermark: "",
    language: "french",
    show_description: 1,
    showArticleUnit: 1,
    showArticleTTCPrices: 0,
    show_pictures: 0,
    show_billing: 1,
    show_delivery: 1,
    show_conditions: 1,
    show_stamp: 1,
    show_bank: 1,
    currency: "TND",
    remarks: ""
  });

  const loadExitVouchers = async () => {
    isLoading.value = true;
    error.value = null;
    try {
      exitVouchers.value = await fetchClientExitVouchers(clientId.value);
      if (exitVouchers.value.length === 0) {
        await showToast('Aucun bon de sortie trouvé pour ce client', 'warning');
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Erreur inconnue';
      await showToast(error.value, 'danger');
    } finally {
      isLoading.value = false;
    }
  };
  
const getVoucherId = (voucher: ExitVoucher): string => {
  return voucher?.hashed_id || voucher.hashed_id|| '';
};
 
const handleDelete = async (voucher: ExitVoucher) => {
  const loading = await createLoading('Suppression en cours...');
  
  try {
    const { success, message } = await deleteExitVoucher(voucher.hashed_id);
    
    if (success) {
      await loadExitVouchers(); 
      await showToast(message || 'Bon supprimé avec succès', 'success');
    } else {
      await showToast(message || 'Échec de la suppression', 'danger');
    }
  } catch (err) {
    console.error('Erreur inattendue:', err);
    await showToast('Erreur technique lors de la suppression', 'danger');
  } finally {
    await loading.dismiss();
  }
};

  // Gestion du téléchargement
  const handleDownload = async (voucher: ExitVoucher) => {
    try {
      const voucherId = getVoucherId(voucher);
      
      if (!voucherId) {
        console.error('ID manquant dans le bon de sortie:', voucher);
        throw new Error('Identifiant du document introuvable');
      }

      await downloadExitVoucher(voucher);
      await showToast(`Téléchargement du bon ${voucher.exit_voucher_number} démarré`, 'success');
    } catch (err) {
      console.error('Échec du téléchargement:', {
        error: err,
        voucherData: voucher
      });
      await showToast(
        err instanceof Error ? err.message : 'Échec du téléchargement', 
        'danger'
      );
    }
  };

  const handleValidate = async (voucher: ExitVoucher) => {
    try {
      const { success, message, requiresRefresh } = await validateExitVoucher(voucher);
  
      if (success) {
        const index = exitVouchers.value.findIndex(v => getVoucherId(v) === getVoucherId(voucher));
        
        if (index !== -1) {
          exitVouchers.value[index].status = 1;
        }
  
        await showToast(message, 'success');
        
        if (requiresRefresh) {
          await loadExitVouchers();
        }
      } else {
        await showToast(message, 'warning');
      }
    } catch (err) {
      console.error('Erreur validation:', err);
      await showToast(
        'Problème de connexion. Vérifiez votre validation plus tard.',
        'danger'
        //This estimate has already been validated and cannot be validated again

      );
    }
  };
  

  const handleDuplicate = async (duplicate: ExitVoucher) => {
    const loading = await createLoading("Duplication en cours...");
  
    try {
      console.log("Début duplication pour:", duplicate.hashed_id);
  
      const result = await duplicateExitVoucher(duplicate);
      console.log("Résultat duplication:", result);
  
      if (result.success) {
        await loadExitVouchers();
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


const getClientId = (voucher) => {
  if (!voucher) {
    console.error("Erreur: voucher est null ou undefined");
    return null;
  }
  
  if (voucher.client && voucher.client.hashed_contact_id) {
    return voucher.client.hashed_contact_id;
  }
  
  if (voucher.hashed_contact_id) {
    return voucher.hashed_contact_id;
  }
  
  if (voucher.client && voucher.client.additional_contact_id) {
    return voucher.client.additional_contact_id;
  }
  
  if (voucher.client_id) {
    return voucher.client_id;
  }
  
  // Tenter de récupérer d'autres identifiants potentiels
  const possibleIds = [
    voucher.client?.id,
    voucher.contact_id,
    voucher.client?.contact_id
  ].filter(Boolean);
  
  if (possibleIds.length > 0) {
    return possibleIds[0];
  }
  
  console.log("Structure du voucher pour debug:", JSON.stringify(voucher, null, 2));
  return null;
};

  // Gestion centralisée des actions
  const handleAction = async (action: ExitVouchersAction, event: Event, voucher: ExitVoucher) => {
    event.stopPropagation();
    
    try {
      switch(action) {
        case 'download':
          await handleDownload(voucher);
          break;
        case 'validate':
          await handleValidate(voucher);
          break;
        case 'delete':
          await handleDelete(voucher); 
          break;
        case 'duplicate':
          await handleDuplicate(voucher);
          break;
    case "modify":
  closeModal();
  
  if (!voucher) {
    console.error("Erreur: voucher est null ou undefined");
    await showToast('Bon de sortie invalide ou manquant', 'warning');
    return;
  }
  
  const clientId = getClientId(voucher);
  
  if (!clientId) {
    console.error("Données du bon de sortie:", voucher);
    await showToast('ID client introuvable dans le bon de sortie', 'warning');
    return;
  }
  
  console.log("ID client trouvé:", clientId);
  console.log("ID voucher:", getVoucherId(voucher));
  
  router.push({
    path: `/clients/${clientId}/bonsortie/${getVoucherId(voucher)}/edit-sortie`,
    query: {
      client_id: clientId, 
    },
  });
  break;
        case 'visualize':
          openExitVoucherModal(voucher);
          break;
        case 'send':
          // Note: Fonctionnalité d'envoi à implémenter
          await showToast('Fonctionnalité d\'envoi non implémentée', 'warning');
          break;
      }
    } catch (err) {
      console.error(`Erreur lors de l'action ${action}:`, err);
      await showToast(`Erreur lors de l'action ${action}`, 'danger');
    }
  };

  // Gestion de la modal
  const openExitVoucherModal = (voucher: ExitVoucher) => {
    selectedExitVoucher.value = voucher;
    isModalOpen.value = true;
  };

  const closeModal = () => {
    isModalOpen.value = false;
    selectedExitVoucher.value = null;
  };

  // Gestion de l'accordéon
  const toggleAccordion = (id: string) => {
    expandedExitVoucherId.value = expandedExitVoucherId.value === id ? null : id;
  };

  // Pagination
  const nextPage = () => currentPage.value < totalPages.value && currentPage.value++;
  const prevPage = () => currentPage.value > 1 && currentPage.value--;
  const resetPagination = () => currentPage.value = 1;

  // Initialisation
  onMounted(loadExitVouchers);

  return {
    exitVouchers,
    isLoading,
    error,
    searchQuery,
    currentPage,
    itemsPerPage,
    clientId,
    isModalOpen,
    selectedExitVoucher,
    expandedExitVoucherId,
    filteredVouchers,
    paginatedVouchers,
    totalPages,
    loadExitVouchers,
    nextPage,
    prevPage,
    resetPagination,
    openExitVoucherModal,
    closeModal,
    toggleAccordion,
    handleAction,
    handleDelete,
    handleDuplicate,
    handleDownload,
    handleValidate,
    exitVoucherForm,
    getClientId,
    formatTimelineDate
  };
};
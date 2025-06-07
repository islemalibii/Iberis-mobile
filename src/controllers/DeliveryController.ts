import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useRouter } from 'vue-router';
import { 
    downloadDeliveryNote, 
    deleteDeliveryNote, 
    getDeliveryNoteDetails,
    duplicateDeliveryNote,
    validateDeliveryNote,
    fetchClientDeliveryNotes
} from '@/services/DeliveryService';
import { 
    formatDate, 
    getDeliveryStatusClass, 
    DeliveryNote, 
    getDeliveryStatusText, 
    formatCurrency,
      
} from '@/models/DeliveryNotesModel';

import { popoverController, toastController,loadingController, alertController } from '@ionic/vue';
import axios from 'axios';
/*const items = ref<Item[]>([]);*/

// Dans DeliveryController.ts
type DeliveryNoteAction = "modify" | "delete" | "download" | "send" | "visualize" | "validate" | "duplicate";
export const DeliveryNotesController = () => {
  const router = useRouter();
  const route = useRoute();
      const deliveryNotes = ref<DeliveryNote[]>([]);
    const currentPage = ref(1);
    const deliveriesPerPage = 7;
    const isModalOpen = ref(false);
    const selectedDeliveryNote = ref<DeliveryNote | null>(null);
    const deliveryData = ref<DeliveryNote | null>(null);
    const isLoading = ref(false);
    const error = ref<string | null>(null);
    const searchQuery = ref('');
    const expandedDeliveryNote = ref<string | null>(null);
  const clientId = ref<string>((route.params.id as string) || '');

    // Computed properties
    const filteredDeliveryNotes = computed(() => {
        if (!searchQuery.value) return deliveryNotes.value;
        const query = searchQuery.value.toLowerCase();
        return deliveryNotes.value.filter(delivery => 
            (delivery.client.display_name?.toLowerCase().includes(query) ?? false) ||
            (delivery.delivery_number?.toLowerCase().includes(query) ?? false)
        );
    });

    const paginatedDeliveryNotes = computed(() => {
        const start = (currentPage.value - 1) * deliveriesPerPage;
        return filteredDeliveryNotes.value.slice(start, start + deliveriesPerPage);
    });

    const totalPages = computed(() => 
        Math.ceil(filteredDeliveryNotes.value.length / deliveriesPerPage)
    );

    // Helper functions
    const showToast = async (message: string, color: 'success' | 'danger' = 'success') => {
        const toast = await toastController.create({
            message,
            duration: color === 'success' ? 2000 : 3000,
            color,
            position: 'top'
        });
        await toast.present();
    };
// Dans DeliveryController.ts
/*
const handleDuplicate = async (delivery: DeliveryNote) => {
    try {
        const result = await (delivery.hashed_id);
        
        await showToast('Delivery note duplicated successfully');
        
        // Recharger la liste des delivery notes
        await loadDeliveryNotes();
        
        // Rediriger vers la page d'édition
        router.push({
            path: "/clients/id/bonslivraison/id/edit-delivery",
            query: { 
                id: result.hashed_id,
                status: 0, // Statut draft
                client_id: delivery.client.hashed_contact_id
            }
        });
        
    } catch (error) {
        await showToast(
            error instanceof Error ? error.message : 'Duplication failed',
            'danger'
        );
    }
};
*
const loadItems = async () => {
    try {
        items.value = await fetchItems();
        console.log('Items loaded:', items.value);
    } catch (error) {
        console.error('Error loading items:', error);
    }
};*/
    const updateDeliveryStatus = (deliveryId: string, status: number) => {
        const index = deliveryNotes.value.findIndex(note => note.hashed_id === deliveryId);
        if (index !== -1) {
            deliveryNotes.value[index].status = status;
        }

        if (isModalOpen.value && selectedDeliveryNote.value?.hashed_id === deliveryId) {
            selectedDeliveryNote.value.status = status;
        }
    };
   

    // Core functions
    const toggleAccordion = (id: string) => {
        expandedDeliveryNote.value = expandedDeliveryNote.value === id ? null : id;
    };

    const openDeliveryNoteModal = (delivery: DeliveryNote) => {
        selectedDeliveryNote.value = delivery;
        isModalOpen.value = true;
    };

    const closeModal = () => {
        isModalOpen.value = false;
        selectedDeliveryNote.value = null;
    };

    const confirmDelete = async (delivery: DeliveryNote) => {
        const alert = await alertController.create({
            header: 'Confirm Deletion',
            message: `Are you sure you want to delete delivery note #${delivery.delivery_number}?`,
            buttons: [
                {
                    text: 'Cancel',
                    role: 'cancel',
                    cssClass: 'secondary'
                },
                {
                    text: 'Delete',
                    role: 'destructive',
                    handler: async () => {
                        await performDelete(delivery.hashed_id);
                    }
                }
            ]
        });
        await alert.present();
    };

    const performDelete = async (deliveryId: string) => {
        let loadingToast: HTMLIonToastElement | null = null;
        
        try {
            loadingToast = await toastController.create({
                message: 'Deleting delivery note...',
                duration: 0,
                position: 'top'
            });
            await loadingToast.present();
    
            await deleteDeliveryNote(deliveryId);
            
            deliveryNotes.value = deliveryNotes.value.filter(
                note => note.hashed_id !== deliveryId
            );
            
            await loadingToast.dismiss();
            await showToast('Delivery note deleted successfully');
            
            if (isModalOpen.value && selectedDeliveryNote.value?.hashed_id === deliveryId) {
                closeModal();
            }
        } catch (err) {
            if (loadingToast) await loadingToast.dismiss();
            
            console.error('Delete error:', err);
            let errorMessage = 'Failed to delete delivery note';
            
            if (axios.isAxiosError(err)) {
                errorMessage = err.response?.data?.message || err.message || errorMessage;
            } else if (err instanceof Error) {
                errorMessage = err.message;
            }
            
            await showToast(errorMessage, 'danger');
            await loadDeliveryNotes();
        }
    };
    const getClientId = (DeliveryNote) => {
  // Vérifier d'abord si voucher existe
  if (!DeliveryNote) {
    console.error("Erreur: voucher est null ou undefined");
    return null;
  }
  
  if (DeliveryNote.client && DeliveryNote.client.hashed_contact_id) {
    return DeliveryNote.client.hashed_contact_id;
  }
  
  if (DeliveryNote.hashed_contact_id) {
    return DeliveryNote.hashed_contact_id;
  }
  
  if (DeliveryNote.client && DeliveryNote.client.additional_contact_id) {
    return DeliveryNote.client.additional_contact_id;
  }
  
  if (DeliveryNote.client_id) {
    return DeliveryNote.client_id;
  }
  
  // Tenter de récupérer d'autres identifiants potentiels
  const possibleIds = [
    DeliveryNote.client?.id,
    DeliveryNote.contact_id,
    DeliveryNote.client?.contact_id
  ].filter(Boolean);
  
  if (possibleIds.length > 0) {
    return possibleIds[0];
  }
  
  console.log("Structure du voucher pour debug:", JSON.stringify(voucher, null, 2));
  return null;
};

    const handleValidate = async (delivery: DeliveryNote) => {
        try {
            const result = await validateDeliveryNote(delivery.hashed_id);
            
            if (result.status.code === 200) {
                updateDeliveryStatus(delivery.hashed_id, 1); // 1 = Valid status
                await showToast(result.status.message);
            } else {
                throw new Error(result.status.message);
            }
        } catch (error) {
            await showToast(
                error instanceof Error ? error.message : 'Validation failed',
                'danger'
            );
        }
    };// Fonction createLoading corrigée
const createLoading = async (message: string) => {
  const loading = await loadingController.create({
    message,
    spinner: 'circular',
    backdropDismiss: false
  });
  await loading.present();
  return loading;
};


const handleDuplicate = async (delivery: DeliveryNote) => {
  const loading = await createLoading("Duplication en cours...");

  try {
    console.log("Début duplication pour:", delivery.hashed_id);

    const result = await duplicateDeliveryNote(delivery);
    console.log("Résultat duplication:", result);

    if (result.success) {
      await loadDeliveryNotes();
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

const getDeliveryId = (delivery: DeliveryNote): string => {
  return delivery?.hashed_id || delivery.hashed_id|| '';
};
    const handleAction = async (action: DeliveryNoteAction, event: Event, delivery: DeliveryNote | null) => {
        if (!delivery) return;
        event.stopPropagation();

        try {
            switch (action) {
   case "modify":
  closeModal();
  
  // Vérifier d'abord si le voucher existe
  if (!delivery) {
    console.error("Erreur: voucher est null ou undefined");
    await showToast('Bon de livraison invalide ou manquant', 'warning');
    return;
  }
  
  // Utiliser la fonction utilitaire pour récupérer l'ID client
  const clientId = getClientId(delivery);
  
  if (!clientId) {
    console.error("Données du bon de sortie:", delivery);
    await showToast('ID client introuvable dans le bon de sortie', 'warning');
    return;
  }
  
  console.log("ID client trouvé:", clientId);
  console.log("ID voucher:", getDeliveryId(delivery));
  
  router.push({
    path: `/clients/${clientId}/bonslivraison/${getDeliveryId(delivery)}/edit-delivery`,
    query: {
      client_id: clientId, 
    },
  });
  break;
                    
                case "download":
                    await downloadDeliveryNote(delivery.hashed_id);
                    break;
                    
                case "visualize":
                    deliveryData.value = (await getDeliveryNoteDetails(delivery.hashed_id)).delivery;
                    break;
                    
                case "delete":
                    await confirmDelete(delivery);
                    break;
                    
                case "validate":
                    await handleValidate(delivery);
                    break;
                    
                case "send":
                    await showToast('Send functionality not yet implemented', 'danger');
                    break;
                       case 'duplicate':
          await handleDuplicate(delivery);
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

const loadDeliveryNotes = async () => {
  isLoading.value = true;
  error.value = null;



  try {
    deliveryNotes.value = await fetchClientDeliveryNotes(clientId.value);
    if (deliveryNotes.value.length === 0) {
      await showToast('Aucun bon de sortie trouvé pour ce client', 'warning');
    }
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Erreur inconnue';
    await showToast(error.value, 'danger');
  } finally {
    isLoading.value = false;
  }
};

    const nextPage = () => {
        if (currentPage.value < totalPages.value) {
            currentPage.value++;
        }
    };

    const prevPage = () => {
        if (currentPage.value > 1) {
            currentPage.value--;
        }
    };

    const submitEditDeliveryNote = async (formValues: EditDeliveryNoteParams) => {
        isLoading.value = true;
        try {
            await editDeliveryNote(formValues);
            await showToast('Delivery note updated successfully');
            await loadDeliveryNotes();
            router.push('/clients/id/bonslivraison');
        } catch (error) {
            console.error('Edit error:', error);
            await showToast('Failed to update delivery note', 'danger');
        } finally {
            isLoading.value = false;
        }
    };

    onMounted(() => {
        loadDeliveryNotes();
    });

    return {
        currentPage,
        totalPages,
        paginatedDeliveryNotes,
        isModalOpen,
        selectedDeliveryNote,
        filteredDeliveryNotes,
        searchQuery,
        expandedDeliveryNote,
        deliveryData,
        isLoading,
        error,
        formatCurrency,
        toggleAccordion,
        nextPage,
        prevPage,
        openDeliveryNoteModal,
        closeModal,
        handleAction,
        confirmDelete,
        formatDate,
        getDeliveryStatusClass,
        getDeliveryStatusText,
        loadDeliveryNotes,
        submitEditDeliveryNote,
        handleValidate,
       /* handleDuplicate*/
    };
};
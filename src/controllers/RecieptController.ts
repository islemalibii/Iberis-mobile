import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useRouter } from 'vue-router';
import { 
    downloadReceiptNote, 
    deleteReceiptNote, 
    getReceiptNoteDetails,
    duplicateReceiptNote,
    validateReceiptNote,
    fetchProviderReceiptNotes
} from '@/services/ReceiptsService';
import { 
    formatDate, 
    getReceiptStatusClass, 
    ReceiptNote, 
    getReceiptStatusText, 
    formatCurrency,
} from '@/models/Receipt';

import { popoverController, toastController, loadingController, alertController } from '@ionic/vue';
import axios from 'axios';

type ReceiptNoteAction = "modify" | "delete" | "download" | "send" | "visualize" | "validate" | "duplicate";

export const ReceiptNotesController = () => {
    const router = useRouter();
    const route = useRoute();
    const receiptNotes = ref<ReceiptNote[]>([]);
    const currentPage = ref(1);
    const receiptsPerPage = 7;
    const isModalOpen = ref(false);
    const selectedReceiptNote = ref<ReceiptNote | null>(null);
    const receiptData = ref<ReceiptNote | null>(null);
    const isLoading = ref(false);
    const error = ref<string | null>(null);
    const searchQuery = ref('');
    const expandedReceiptNote = ref<string | null>(null);
    const providerId = ref<string>((route.params.id as string) || '');

    // Computed properties
    const filteredReceiptNotes = computed(() => {
        if (!searchQuery.value) return receiptNotes.value;
        const query = searchQuery.value.toLowerCase();
        return receiptNotes.value.filter(receipt => 
            (receipt.provider.display_name?.toLowerCase().includes(query) ?? false) ||
            (receipt.receipt_number?.toLowerCase().includes(query) ?? false)
        );
    });

    const paginatedReceiptNotes = computed(() => {
        const start = (currentPage.value - 1) * receiptsPerPage;
        return filteredReceiptNotes.value.slice(start, start + receiptsPerPage);
    });

    const totalPages = computed(() => 
        Math.ceil(filteredReceiptNotes.value.length / receiptsPerPage)
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

    const updateReceiptStatus = (receiptId: string, status: number) => {
        const index = receiptNotes.value.findIndex(note => note.hashed_id === receiptId);
        if (index !== -1) {
            receiptNotes.value[index].status = status;
        }

        if (isModalOpen.value && selectedReceiptNote.value?.hashed_id === receiptId) {
            selectedReceiptNote.value.status = status;
        }
    };

    // Core functions
    const toggleAccordion = (id: string) => {
        expandedReceiptNote.value = expandedReceiptNote.value === id ? null : id;
    };

    const openReceiptNoteModal = (receipt: ReceiptNote) => {
        selectedReceiptNote.value = receipt;
        isModalOpen.value = true;
    };

    const closeModal = () => {
        isModalOpen.value = false;
        selectedReceiptNote.value = null;
    };

    const confirmDelete = async (receipt: ReceiptNote) => {
        const alert = await alertController.create({
            header: 'Confirmer la suppression',
            message: `Êtes-vous sûr de vouloir supprimer le bon de réception #${receipt.receipt_number} ?`,
            buttons: [
                {
                    text: 'Annuler',
                    role: 'cancel',
                    cssClass: 'secondary'
                },
                {
                    text: 'Supprimer',
                    role: 'destructive',
                    handler: async () => {
                        await performDelete(receipt.hashed_id);
                    }
                }
            ]
        });
        await alert.present();
    };

    const performDelete = async (receiptId: string) => {
        let loadingToast: HTMLIonToastElement | null = null;
        
        try {
            loadingToast = await toastController.create({
                message: 'Suppression en cours...',
                duration: 0,
                position: 'top'
            });
            await loadingToast.present();
    
            await deleteReceiptNote(receiptId);
            
            receiptNotes.value = receiptNotes.value.filter(
                note => note.hashed_id !== receiptId
            );
            
            await loadingToast.dismiss();
            await showToast('Bon de réception supprimé avec succès');
            
            if (isModalOpen.value && selectedReceiptNote.value?.hashed_id === receiptId) {
                closeModal();
            }
        } catch (err) {
            if (loadingToast) await loadingToast.dismiss();
            
            console.error('Erreur de suppression:', err);
            let errorMessage = 'Échec de la suppression';
            
            if (axios.isAxiosError(err)) {
                errorMessage = err.response?.data?.message || err.message || errorMessage;
            } else if (err instanceof Error) {
                errorMessage = err.message;
            }
            
            await showToast(errorMessage, 'danger');
            await loadReceiptNotes();
        }
    };

    const getProviderId = (receipt: ReceiptNote): string => {
        return receipt.provider?.hashed_contact_id || receipt.hashed_contact_id || '';
    };

    const handleValidate = async (receipt: ReceiptNote) => {
        try {
            const result = await validateReceiptNote(receipt.hashed_id);
            
            if (result.status.code === 200) {
                updateReceiptStatus(receipt.hashed_id, 1);
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

    const createLoading = async (message: string) => {
        const loading = await loadingController.create({
            message,
            spinner: 'circular',
        });
        await loading.present();
        return loading;
    };

    const handleDuplicate = async (note: ReceiptNote) => {
        const loading = await createLoading('Duplication...');
        try {
            const result = await duplicateReceiptNote(note);
            if (result.success) {
                await loadReceiptNotes();
                await showToast(result.message, 'success');
            } else {
                await showToast(result.message, 'warning');
            }
        } catch (err) {
            await showToast('Erreur de duplication', 'danger');
        } finally {
            await loading.dismiss();
        }
    };

    const handleAction = async (action: ReceiptNoteAction, event: Event, receipt: ReceiptNote | null) => {
        if (!receipt) return;
        event.stopPropagation();

        try {
            switch (action) {
                case "modify":
                    closeModal();
                    const providerId = getProviderId(receipt);
                    
                    if (!providerId) {
                        console.error("Données du bon de réception:", receipt);
                        await showToast('ID fournisseur introuvable', 'warning');
                        return;
                    }
                    
router.push({

    path: `/provider/${providerId}/receipt/${receipt.hashed_id}/edit_receipt`,
    query: { provider_id: providerId }
});
                    break;
                    
                case "download":
                    await downloadReceiptNote(receipt.hashed_id);
                    break;
                    
                case "visualize":
                    receiptData.value = (await getReceiptNoteDetails(receipt.hashed_id)).receipt;
                    break;
                    
                case "delete":
                    await confirmDelete(receipt);
                    break;
                    
                case "validate":
                    await handleValidate(receipt);
                    break;
                    
                case "send":
                    await showToast('Fonctionnalité d\'envoi non implémentée', 'danger');
                    break;
                    
                case 'duplicate':
                    await handleDuplicate(receipt);
                    break;
            }
            await popoverController.dismiss();
        } catch (error) {
            await showToast(
                error instanceof Error ? error.message : 'Action échouée',
                'danger'
            );
        }
    };

    const loadReceiptNotes = async () => {
        isLoading.value = true;
        error.value = null;

        try {
            receiptNotes.value = await fetchProviderReceiptNotes(providerId.value);
            if (receiptNotes.value.length === 0) {
                await showToast('Aucun bon de réception trouvé pour ce fournisseur', 'warning');
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

    onMounted(() => {
        loadReceiptNotes();
    });

    return {
        currentPage,
        totalPages,
        paginatedReceiptNotes,
        isModalOpen,
        selectedReceiptNote,
        filteredReceiptNotes,
        searchQuery,
        expandedReceiptNote,
        receiptData,
        isLoading,
        error,
        formatCurrency,
        toggleAccordion,
        nextPage,
        prevPage,
        openReceiptNoteModal,
        closeModal,
        handleAction,
        confirmDelete,
        formatDate,
        getReceiptStatusClass,
        getReceiptStatusText,
        loadReceiptNotes,
        handleValidate,
    };
};
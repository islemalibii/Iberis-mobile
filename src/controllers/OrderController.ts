import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useRouter } from 'vue-router';
import { 
    downloadOrder, 
    deleteOrder, 
    getOrderDetails,
    duplicateOrder,
    validateOrder,
    fetchProviderOrders,
    convertOrderToInvoice
} from '@/services/OrderService';
import { 
    formatDate, 
    getOrderStatusClass, 
    PurchaseOrder, 
    getOrderStatusText, 
    formatCurrency,
} from '@/models/Order';

import { popoverController, toastController, loadingController, alertController } from '@ionic/vue';
import axios from 'axios';

type OrderAction = "modify" | "delete" | "download" | "send" | "visualize" | "validate" | "duplicate" | "convertToInvoice";

export const OrdersController = () => {
    const router = useRouter();
    const route = useRoute();
    const orders = ref<PurchaseOrder[]>([]);
    const currentPage = ref(1);
    const ordersPerPage = 7;
    const isModalOpen = ref(false);
    const selectedOrder = ref<PurchaseOrder | null>(null);
    const orderData = ref<PurchaseOrder | null>(null);
    const isLoading = ref(false);
    const error = ref<string | null>(null);
    const searchQuery = ref('');
    const expandedOrder = ref<string | null>(null);
    const providerId = ref<string>((route.params.id as string) || '');

    // Computed properties
    const filteredOrders = computed(() => {
        if (!searchQuery.value) return orders.value;
        const query = searchQuery.value.toLowerCase();
        return orders.value.filter(order => 
            (order.contact?.display_name?.toLowerCase().includes(query) ?? false) ||
            (order.order_number?.toLowerCase().includes(query) ?? false)
        );
    });

    const paginatedOrders = computed(() => {
        const start = (currentPage.value - 1) * ordersPerPage;
        return filteredOrders.value.slice(start, start + ordersPerPage);
    });

    const totalPages = computed(() => 
        Math.ceil(filteredOrders.value.length / ordersPerPage)
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

    const updateOrderStatus = (orderId: string, status: number) => {
        const index = orders.value.findIndex(order => order.hashed_id === orderId);
        if (index !== -1) {
            orders.value[index].status = status;
        }

        if (isModalOpen.value && selectedOrder.value?.hashed_id === orderId) {
            selectedOrder.value.status = status;
        }
    };

    // Core functions
    const toggleAccordion = (id: string) => {
        expandedOrder.value = expandedOrder.value === id ? null : id;
    };

    const openOrderModal = (order: PurchaseOrder) => {
        selectedOrder.value = order;
        isModalOpen.value = true;
    };

    const closeModal = () => {
        isModalOpen.value = false;
        selectedOrder.value = null;
    };

    const confirmDelete = async (order: PurchaseOrder) => {
        const alert = await alertController.create({
            header: 'Confirmer la suppression',
            message: `Êtes-vous sûr de vouloir supprimer le bon de commande #${order.order_number} ?`,
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
                        await performDelete(order.hashed_id);
                    }
                }
            ]
        });
        await alert.present();
    };

    const performDelete = async (orderId: string) => {
        let loadingToast: HTMLIonToastElement | null = null;
        
        try {
            loadingToast = await toastController.create({
                message: 'Suppression en cours...',
                duration: 0,
                position: 'top'
            });
            await loadingToast.present();
    
            await deleteOrder(orderId);
            
            orders.value = orders.value.filter(
                order => order.hashed_id !== orderId
            );
            
            await loadingToast.dismiss();
            await showToast('Bon de commande supprimé avec succès');
            
            if (isModalOpen.value && selectedOrder.value?.hashed_id === orderId) {
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
            await loadOrders();
        }
    };

    const getProviderId = (order: PurchaseOrder): string => {
        return order.hashed_contact_id || '';
    };

    const handleValidate = async (order: PurchaseOrder) => {
        try {
            const result = await validateOrder(order.hashed_id);
            
            if (result.status.code === 200) {
                updateOrderStatus(order.hashed_id, 1);
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

    const handleDuplicate = async (order: PurchaseOrder) => {
        const loading = await createLoading('Duplication...');
        try {
            const result = await duplicateOrder(order);
            if (result.success) {
                await loadOrders();
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

    const handleConvertToInvoice = async (order: PurchaseOrder) => {
        const loading = await createLoading('Conversion en facture...');
        try {
            const result = await convertOrderToInvoice(order.hashed_id);
            if (result.success) {
                await showToast(result.message, 'success');
                if (result.invoiceId) {
                    router.push(`/invoice/${result.invoiceId}`);
                }
            } else {
                await showToast(result.message, 'warning');
            }
        } catch (err) {
            await showToast('Erreur de conversion', 'danger');
        } finally {
            await loading.dismiss();
        }
    };

    const handleAction = async (action: OrderAction, event: Event, order: PurchaseOrder | null) => {
        if (!order) return;
        event.stopPropagation();

        try {
            switch (action) {
                case "modify":
                    closeModal();
                    const providerId = getProviderId(order);
                    
                    if (!providerId) {
                        console.error("Données du bon de commande:", order);
                        await showToast('ID fournisseur introuvable', 'warning');
                        return;
                    }
                    
                    router.push({
                        path: `/provider/${providerId}/order/${order.hashed_id}/edit_order`,
                        query: { provider_id: providerId }
                    });
                    break;
                    
                case "download":
                    await downloadOrder(order.hashed_id);
                    break;
                    
                case "visualize":
                    orderData.value = await getOrderDetails(order.hashed_id);
                    break;
                    
                case "delete":
                    await confirmDelete(order);
                    break;
                    
                case "validate":
                    await handleValidate(order);
                    break;
                    
                case "send":
                    await showToast('Fonctionnalité d\'envoi non implémentée', 'danger');
                    break;
                    
                case 'duplicate':
                    await handleDuplicate(order);
                    break;
                    
                case 'convertToInvoice':
                    await handleConvertToInvoice(order);
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

    const loadOrders = async () => {
        isLoading.value = true;
        error.value = null;

        try {
            orders.value = await fetchProviderOrders(providerId.value);
            if (orders.value.length === 0) {
                await showToast('Aucun bon de commande trouvé pour ce fournisseur', 'warning');
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
        loadOrders();
    });

    return {
        currentPage,
        totalPages,
        paginatedOrders,
        isModalOpen,
        selectedOrder,
        filteredOrders,
        searchQuery,
        expandedOrder,
        orderData,
        isLoading,
        error,
        formatCurrency,
        toggleAccordion,
        nextPage,
        prevPage,
        openOrderModal,
        closeModal,
        handleAction,
        confirmDelete,
        formatDate,
        getOrderStatusClass,
        getOrderStatusText,
        loadOrders,
        handleValidate,
    };
};
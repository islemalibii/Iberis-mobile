import { ref, computed, onMounted } from 'vue';
import {
  Client,
  Activity,
  Currency,
  DisplayNameType,
  ClientType,
  PaymentTerm,
  ClientRequest,
  //ClientTitle
} from '@/models/ClientModel';
import { loadingController, toastController } from '@ionic/vue';
import { useRouter } from 'vue-router';

import {
  getClientsList,
  addClient,
  deleteClient as apiDeleteClient,
  fetchActivities,
  fetchCurrencies,
  fetchPaymentTerms,
  fetchTokenAndCompanyId,
  getClientDetails,
  updateClientService
} from '@/services/Clients';

export function useClientController() {
  const router = useRouter();
  
  const clients = ref<Client[]>([]);
  const activities = ref<Activity[]>([]);
  const currencies = ref<Currency[]>([]);
  const paymentTerms = ref<PaymentTerm[]>([]);
  const isLoading = ref(false);
  const isLoadingAdd = ref(false);
  const isLoadingPaymentTerms = ref(false);
  const error = ref<string | null>(null);
  const addError = ref<string | null>(null);
  const searchQuery = ref('');
  const currentPage = ref(1);
  const itemsPerPage = ref(10);
  const isLoadingDetails = ref(false);
  const currentClient = ref<Client | null>(null);
  const isLoadingUpdate = ref(false);
  const updateError = ref<string | null>(null);
  
  // Formulaire client
  const clientForm = ref({
    title: "1" as any,
    first_name: "",
    last_name: "",
    organisation: "",
    display_name: DisplayNameType.COMPANY,
    reference: "",
    email: "",
    phone: "",
    website: "",
    type: ClientType.PROFESSIONAL,
    fiscalId: "",
    activityId: "",
    currencyId: "",
    paymentTerms: "",
    notes: "",
    billingAddress: {
      address: "",
      governorate: "",
      postalCode: "",
      country: "Tunisie",
      countryId: "TN"
    },
    deliveryAddress: {
      address: "",
      governorate: "",
      postalCode: "",
      country: "Tunisie",
      countryId: "TN"
    }
  });

  // Computed
  const filteredClients = computed(() =>
    clients.value.filter(client =>
      [client.display_name, client.email, client.phone, client.reference]
        .some(field => field?.toLowerCase().includes(searchQuery.value.toLowerCase()))
  ));

  const paginatedClients = computed(() => {
    const start = (currentPage.value - 1) * itemsPerPage.value;
    return filteredClients.value.slice(start, start + itemsPerPage.value);
  });

  const totalPages = computed(() =>
    Math.ceil(filteredClients.value.length / itemsPerPage.value)
  );

  // Méthodes
  const loadClients = async () => {
    try {
      isLoading.value = true;
      error.value = null;
      clients.value = await getClientsList();
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Échec du chargement des clients';
      console.error('Erreur chargement clients:', err);
    } finally {
      isLoading.value = false;
    }
  };

  const loadActivities = async () => {
    try {
      const result = await fetchActivities();
      activities.value = result || [];
    } catch (err) {
      console.error('Erreur chargement activités:', err);
      activities.value = [];
    }
  };

  const loadCurrencies = async () => {
    try {
      const result = await fetchCurrencies();
      currencies.value = result || [];
    } catch (err) {
      console.error('Erreur chargement devises:', err);
      currencies.value = [];
    }
  };

  const loadPaymentTerms = async () => {
    try {
      isLoadingPaymentTerms.value = true;
      error.value = null;
      const { companyId } = await fetchTokenAndCompanyId();
      const terms = await fetchPaymentTerms(companyId);
      paymentTerms.value = terms || [];
    } catch (err) {
      console.error('Échec du chargement des conditions de paiement:', err);
      paymentTerms.value = [];
    } finally {
      isLoadingPaymentTerms.value = false;
    }
  };

  const addNewClient = async (): Promise<Client> => {
    try {
      isLoadingAdd.value = true;
      addError.value = null;
      const { token, companyId } = await fetchTokenAndCompanyId();

      const clientRequest: ClientRequest = {
        token,
        title: clientForm.value.title,
        hashed_company_id: companyId,
        first_name: clientForm.value.first_name,
        organisation: clientForm.value.organisation, // Nouveau champ
        last_name: clientForm.value.last_name,
        display_name: clientForm.value.display_name,
        email: clientForm.value.email || null,
        phone: clientForm.value.phone || null,
        type: clientForm.value.type,
        reference: clientForm.value.reference || null,
        hashed_activity_id: clientForm.value.activityId,
        hashed_currency_id: clientForm.value.currencyId,
        hashed_default_invoice_deadline_id: clientForm.value.paymentTerms || null,
        hashed_default_items_price_list_id: "RNmlK",
        billing: { 
          address: clientForm.value.billingAddress.address || '',
          bill_state: clientForm.value.billingAddress.governorate || '',
          zip_code: clientForm.value.billingAddress.postalCode || '',
          country_id: clientForm.value.billingAddress.countryId || 'TN'
        },
        delivery: {
          address: clientForm.value.deliveryAddress.address || '',
          bill_state: clientForm.value.deliveryAddress.governorate || '',
          zip_code: clientForm.value.deliveryAddress.postalCode || '',
          country_id: clientForm.value.deliveryAddress.countryId || 'TN'
        },
        note: clientForm.value.notes || null
      };

      const newClient = await addClient(clientRequest);
      await loadClients();
      router.push('/clients');
      return newClient;
    } catch (err) {
      addError.value = err instanceof Error ? err.message : 'Erreur lors de la création';
      throw err;
    } finally {
      isLoadingAdd.value = false;
    }
  };

  const loadClientDetails = async (clientId: string) => {
    try {
      isLoadingDetails.value = true;
      error.value = null;
      currentClient.value = await getClientDetails(clientId);
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Échec du chargement des détails';
      console.error('Erreur chargement détails client:', err);
    } finally {
      isLoadingDetails.value = false;
    }
  };

  const updateExistingClient = async (clientId: string, formData: Partial<ClientRequest>) => {
    try {
      isLoadingUpdate.value = true;
      updateError.value = null;
      
      if (!formData.first_name?.trim()) throw new Error("Le prénom est obligatoire");
      if (!formData.hashed_activity_id) throw new Error("Veuillez sélectionner une activité");
      if (!formData.hashed_currency_id) throw new Error("Veuillez sélectionner une devise");

      const loading = await loadingController.create({
        message: 'Mise à jour du client en cours...'
      });
      await loading.present();

      try {
        const updatedClient = await updateClientService(clientId, {
          ...formData,
          billing: {
            country_id: formData.billing?.country_id || 'TN',
            address: formData.billing?.address || '',
            bill_state: formData.billing?.bill_state || '',
            zip_code: formData.billing?.zip_code || ''
          },
          delivery: {
            country_id: formData.delivery?.country_id || 'TN',
            address: formData.delivery?.address || '',
            bill_state: formData.delivery?.bill_state || '',
            zip_code: formData.delivery?.zip_code || ''
          }
        });
        
        currentClient.value = updatedClient;
        await loadClients();
        
        const toast = await toastController.create({
          message: 'Client mis à jour avec succès',
          duration: 2000,
          color: 'success'
        });
        await toast.present();

        return updatedClient;
      } finally {
        await loading.dismiss();
      }
    } catch (err: any) {
      console.error('Erreur lors de la mise à jour du client:', err);
      
      const errorMessage = err.response?.data?.message || 
                          err.response?.data?.status?.message || 
                          err.message || 
                          'Échec de la mise à jour du client';
      
      updateError.value = errorMessage;
      
      const toast = await toastController.create({
        message: errorMessage,
        duration: 3000,
        color: 'danger'
      });
      await toast.present();
      
      throw err;
    } finally {
      isLoadingUpdate.value = false;
    }
  };

  const deleteClient = async (clientId: string) => {
    try {
      isLoading.value = true;
      const { success, message } = await apiDeleteClient(clientId);

      if (success) {
        clients.value = clients.value.filter(c => c.hashed_id !== clientId);
      } else {
        throw new Error(message || 'Échec de la suppression');
      }

      return { success: true };
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Erreur technique';
      return { success: false, message: error.value };
    } finally {
      isLoading.value = false;
    }
  };

  const getDisplayNameType = (client: any): DisplayNameType => {
    if (client.display_name === client.Company) return DisplayNameType.COMPANY;
    return client.display_name?.includes(',') 
      ? DisplayNameType.LASTNAME_FIRSTNAME 
      : DisplayNameType.FIRSTNAME_LASTNAME;
  };

  const nextPage = () => currentPage.value < totalPages.value && currentPage.value++;
  const prevPage = () => currentPage.value > 1 && currentPage.value--;

  // Initialisation
  onMounted(() => {
    loadClients();
    loadActivities();
    loadCurrencies();
    loadPaymentTerms();
  });

  return {
    // States
    clients,
    activities,
    currencies,
    paymentTerms,
    isLoading,
    isLoadingAdd,
    isLoadingPaymentTerms,
    error,
    addError,
    searchQuery,
    currentPage,
    itemsPerPage,
    isLoadingDetails,
    currentClient,
    isLoadingUpdate,
    updateError,
    clientForm,

    // Computed
    filteredClients,
    paginatedClients,
    totalPages,

    // Methods
    loadClientDetails,
    updateExistingClient,
    loadPaymentTerms,
    loadActivities,
    loadCurrencies,
    loadClients,
    addNewClient,
    deleteClient,
    nextPage,
    prevPage,
    getDisplayNameType
  };
}
import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useIonRouter ,} from '@ionic/vue';
import { loadingController, toastController, alertController } from '@ionic/vue';
import { getProvidersList, deleteProviderService, addProviderService,getProviderDetails,updateProviderService} from '@/services/Provider';
import { fetchActivities, fetchCurrencies, fetchPaymentTerms, fetchTokenAndCompanyId } from '@/services/Clients';
import { Activity, Currency, PaymentTerm } from '@/models/ClientModel';
import { DisplayNameType, ProviderTitle, ProviderType, ProviderRequest, Provider } from './../models/providerModel';

export function useProviderController() {
  const router = useIonRouter();
  const providers = ref<Provider[]>([]);
  const isLoading = ref(false);
    const isSubmitting = ref(false); 
const popoverOpen = ref(false);
const route = useRoute();
const popoverEvent = ref<any>(null);

const ProviderId = ref<string>(route.params.id as string);

  const isLoadingAdd = ref(false);
  const isLoadingDetails = ref(false);
const providerDetails = ref<Provider | null>(null);
const errorDetails = ref<string | null>(null);
  const error = ref<string | null>(null);
  const searchQuery = ref('');
  const currentPage = ref(1);
  const itemsPerPage = ref(10);
  const activities = ref<Activity[]>([]);
  const currencies = ref<Currency[]>([]);
  const paymentTerms = ref<PaymentTerm[]>([]);
  const isLoadingPaymentTerms = ref(false);
  const localFormData = ref({
  title: ProviderTitle.MR,
  first_name: '',
  last_name: '',
  organisation: '',
  display_name: DisplayNameType.FIRSTNAME_LASTNAME,
  email: '',
  phone: '',
  website: '',
  type: ProviderType.PROFESSIONAL,
  reference: '',
  hashed_activity_id: '',
  hashed_currency_id: '',
  hashed_default_invoice_deadline_id: '',
  note: '',
  fiscal_id: '',
  billing: {
    address: '',
    bill_state: '',
    zip_code: '',
    country_id: '',
    country_title:'TN'

  },
  delivery: {
    address: '',
    bill_state: '',
    zip_code: '',
    country_id: '',
    country_title:'TN'

  }
});
  const filteredProviders = computed(() => {
    if (!searchQuery.value) return providers.value;
    const query = searchQuery.value.toLowerCase().trim();
    return providers.value.filter(provider => 
      (provider.organisation?.toLowerCase().includes(query) ||
      `${provider.first_name} ${provider.last_name}`.toLowerCase().includes(query) ||
      provider.email?.toLowerCase().includes(query) ||
      provider.phone?.toLowerCase().includes(query) ||
      provider.reference?.toLowerCase().includes(query))
    );
  });

  const paginatedProviders = computed(() => {
    const start = (currentPage.value - 1) * itemsPerPage.value;
    const end = start + itemsPerPage.value;
    return filteredProviders.value.slice(start, end);
  });

  const totalPages = computed(() => {
    return Math.max(1, Math.ceil(filteredProviders.value.length / itemsPerPage.value));
  });
  
  const loadActivities = async () => {
    try {
      activities.value = await fetchActivities();
    } catch (err) {
      console.error('Erreur chargement activités:', err);
    }
  };
  const loadCurrencies = async () => {
    try {
      currencies.value = await fetchCurrencies();
    } catch (err) {
      console.error('Erreur chargement devises:', err);
    }
  };

  const loadProviders = async () => {
    try {
      isLoading.value = true;
      error.value = null;
      providers.value = await getProvidersList();
      currentPage.value = 1;
    } catch (err: any) {
      console.error('Erreur chargement fournisseurs', err);
      const toast = await toastController.create({
        message: err instanceof Error ? err.message : 'Erreur de chargement des fournisseurs',
        duration: 3000,
        color: 'danger',
        position: 'bottom'
      });
      await toast.present();
    } finally {
      isLoading.value = false;
    }
  };
  const updateProvider = async (providerId: string, formData: Partial<ProviderRequest>) => {
  try {
    isSubmitting.value = true;
    
    // Validation des champs obligatoires
    if (!formData.first_name?.trim()) {
      throw new Error("Le prénom est obligatoire");
    }
    if (!formData.hashed_activity_id) {
      throw new Error("Veuillez sélectionner une activité");
    }
    if (!formData.hashed_currency_id) {
      throw new Error("Veuillez sélectionner une devise");
    }

    const loading = await loadingController.create({
      message: 'Mise à jour en cours...'
    });
    await loading.present();

    try {
      const updatedProvider = await updateProviderService(providerId, {
        ...formData,
        company: formData.company,
        billing: {
          country_id: formData.billing?.country_id || 'TN',
          address: formData.billing?.address,
          bill_state: formData.billing?.bill_state,
          zip_code: formData.billing?.zip_code
        },
        delivery: {
          country_id: formData.delivery?.country_id || 'TN',
          address: formData.delivery?.address,
          bill_state: formData.delivery?.bill_state,
          zip_code: formData.delivery?.zip_code
        }
      });
      
      // Mettre à jour la liste des fournisseurs
      const index = providers.value.findIndex(p => p.hashed_id === providerId);
      if (index !== -1) {
        providers.value[index] = updatedProvider;
      }
      
      const toast = await toastController.create({
        message: 'Fournisseur mis à jour avec succès',
        duration: 2000,
        color: 'success'
      });
      await toast.present();

      router.push('/fournisseur');
      return updatedProvider;
    } finally {
      isSubmitting.value = false;
      await loading.dismiss();
    }
  } catch (err: any) {
    console.error('Erreur:', err);
    const toast = await toastController.create({
      message: err.message,
      duration: 3000,
      color: 'danger'
    });
    await toast.present();
    throw err;
  }
};
  
  const loadPaymentTerms = async () => {
    try {
      isLoadingPaymentTerms.value = true;
      error.value = null;
      const { companyId } = await fetchTokenAndCompanyId();
      paymentTerms.value = await fetchPaymentTerms(companyId);
    } catch (err) {
      console.error('Échec du chargement des conditions de paiement:', err);
      error.value = "Échec du chargement des conditions de paiement";
      paymentTerms.value = [];
    } finally {
      isLoadingPaymentTerms.value = false;
    }
  };
  const fetchProviderDetails = async (providerId: string, lang: 'fr' | 'en' | 'ar' = 'fr') => {
  try {
    isLoadingDetails.value = true;
    errorDetails.value = null;
    
    console.log('Chargement des détails du fournisseur ID:', providerId);
    
    const details = await getProviderDetails(providerId, lang);
    providerDetails.value = details;
    
    console.log('Détails du fournisseur récupérés:', details);
    
    return details;
  } catch (err: any) {
    errorDetails.value = err.message;
    console.error('Erreur lors de la récupération:', {
      error: err,
      providerId,
      lang
    });
    
    const toast = await toastController.create({
      message: `Erreur: ${err.message}`,
      duration: 3000,
      color: 'danger'
    });
    await toast.present();
    
    throw err;
  } finally {
    isLoadingDetails.value = false;
  }
};
const submitEditForm = async (providerId: string, formData: Partial<ProviderRequest>) => {
  try {
    isSubmitting.value = true;
    
    if (!providerId) {
      throw new Error("ID du fournisseur manquant");
    }

    // Validation des champs obligatoires
    const requiredFields = {
      'Prénom': formData.first_name?.trim(),
      'Activité': formData.hashed_activity_id,
      'Devise': formData.hashed_currency_id
    };

    const missingFields = Object.entries(requiredFields)
      .filter(([_, value]) => !value)
      .map(([field]) => field);

    if (missingFields.length > 0) {
      throw new Error(`Champs obligatoires manquants: ${missingFields.join(', ')}`);
    }

    const loading = await loadingController.create({
      message: 'Mise à jour en cours...'
    });
    await loading.present();

    try {
      // Préparer les données pour l'API
      const apiData = {
        ...formData,
        hashed_default_items_price_list_id: 'RNmlK', // Valeur par défaut
        hashed_default_invoice_deadline_id: formData.hashed_default_invoice_deadline_id || 'JLZnW'
      };

      const updatedProvider = await updateProviderService(providerId, apiData);
      
      // Mise à jour locale
      const index = providers.value.findIndex(p => p.hashed_id === providerId);
      if (index !== -1) {
        providers.value[index] = updatedProvider;
      }
      
      const toast = await toastController.create({
        message: 'Fournisseur mis à jour avec succès',
        duration: 2000,
        color: 'success'
      });
      await toast.present();
      


      return updatedProvider;
      router.push('fournisseur');
    } finally {
      isSubmitting.value = false;
      await loading.dismiss();
    }
  } catch (err: any) {
    console.error('Erreur détaillée:', err);
    
    const errorMessage = err.response?.data?.message || 
                       err.response?.data?.status?.message || 
                       err.message;
    
    const toast = await toastController.create({
      message: errorMessage,
      duration: 5000,
      color: 'danger'
    });
    await toast.present();
    
    throw err;
  }
};
const BonsLivraison = () => {
  popoverOpen.value = false;
  router.push(`/provider/${ProviderId.value}/bonslivraison`);
};
const BonsSortie = () => {
  popoverOpen.value = false;
  router.push(`/provider/${ProviderId.value}/bonsortie`);
};
const facturation = () => {
  popoverOpen.value = false;
  router.push(`/provider/${ProviderId.value}/invoice`);
};
const Devis = () => {
  popoverOpen.value = false;
  router.push(`/provider/${ProviderId.value}/devis`);
};
const  chronologie= () => {
  popoverOpen.value = false;
  router.push(`/provider/${ProviderId.value}/timeline`);
};
const openActionPopover = (event: any) => {
  popoverEvent.value = event;
  popoverOpen.value = true;
};


const createInvoice = () => {
  popoverOpen.value = false;
  router.push(`/provider/${ProviderId.value}/create-invoice`);
};

const recordPayment = () => {
  popoverOpen.value = false;
  router.push(`/clients/${ProviderId.value}/record-payment`);
};
  const navigateToProviderDetails = (providerId: string) => {
    router.push(`/providers/${providerId}`);
  };

  const editProvider = (providerId: string) => {
    router.push(`/edit-fournisseur/${providerId}`);
  };

  const deleteProvider = async (providerId: string) => {
    const alert = await alertController.create({
      header: 'Confirmer la suppression',
      message: 'Êtes-vous sûr de vouloir supprimer ce fournisseur?',
      buttons: [
        {
          text: 'Annuler',
          role: 'cancel',
          cssClass: 'secondary'
        },
        {
          text: 'Supprimer',
          handler: async () => {
            const loading = await loadingController.create({
              message: 'Traitement en cours...',
            });
            await loading.present();

            try {
              const { success, message, isUsedElsewhere } = await deleteProviderService(providerId);
              
              if (isUsedElsewhere) {
                const alert = await alertController.create({
                  header: 'Action impossible',
                  message: 'Ce fournisseur est référencé dans des documents existants',
                  buttons: ['OK'],
                  cssClass: 'custom-alert'
                });
                return alert.present();
              }

              if (success) {
                providers.value = providers.value.filter(p => p.hashed_id !== providerId);
              }

              const toast = await toastController.create({
                message,
                duration: 3000,
                color: success ? 'success' : 'danger',
                position: 'top'
              });
              await toast.present();

            } catch (error) {
              const toast = await toastController.create({
                message: error instanceof Error ? error.message : 'Erreur inconnue',
                duration: 5000,
                color: 'danger'
              });
              await toast.present();
            } finally {
              loading.dismiss();
            }
          }
        }
      ]
    });
    await alert.present();
  };
  
  
  
  const submitProvider = async (formData: Omit<ProviderRequest, 'token'|'hashed_company_id'>) => {
  try {
    isLoadingAdd.value = true;
    error.value = null;

    // Validation des champs obligatoires
    if (!formData.first_name?.trim()) {
      throw new Error("Le prénom est obligatoire");
    }
    if (!formData.hashed_activity_id) {
      throw new Error("Veuillez sélectionner une activité");
    }
    if (!formData.hashed_currency_id) {
      throw new Error("Veuillez sélectionner une devise");
    }

    const loading = await loadingController.create({
      message: 'Enregistrement en cours...'
    });
    await loading.present();

    try {
      const newProvider = await addProviderService({
        ...formData,
        company: formData.company,
        billing: {
          country_id: formData.billing?.country_id || 'TN'
        }
      });
      
      providers.value = [...providers.value, newProvider];
      
      const toast = await toastController.create({
        message: 'Fournisseur ajouté avec succès',
        duration: 2000,
        color: 'success'
      });
      await toast.present();

      router.push('/fournisseur');
      return newProvider;
    } finally {
      isLoadingAdd.value = false;
      await loading.dismiss();
    }
  } catch (err: any) {
    console.error('Erreur:', err);
    const toast = await toastController.create({
      message: err.message,
      duration: 3000,
      color: 'danger'
    });
    await toast.present();
    throw err;
  }
};
const formData = ref({
  title: ProviderTitle.MR,
  first_name: '',
  last_name: '',
  Company: '',
  display_name: DisplayNameType.FIRSTNAME_LASTNAME,
  email: '',
  phone: '',
  website: '',
  type: ProviderType.PROFESSIONAL,
  reference: '',
  hashed_activity_id: '',
  hashed_currency_id: '',
  hashed_default_invoice_deadline_id: '',
  note: '',
  fiscal_id: '',
  billing: {
    address: '',
    bill_state: '',
    zip_code: '',
    country_id: 'TN'
  },
  delivery: {
    address: '',
    bill_state: '',
    zip_code: '',
    country_id: 'TN'
  }
});
const submitForm = async () => {
  try {
    const providerRequest = {
      ...formData.value,
      company: formData.value.Company,
      hashed_activity_id: formData.value.hashed_activity_id,
      hashed_currency_id: formData.value.hashed_currency_id,
      hashed_default_items_price_list_id: 'RNmlK', // Valeur par défaut
      hashed_default_invoice_deadline_id: formData.value.hashed_default_invoice_deadline_id || 'JLZnW', // Valeur par défaut
      billing: {
        address: formData.value.billing.address,
        bill_state: formData.value.billing.bill_state,
        zip_code: formData.value.billing.zip_code,
        country_id: formData.value.billing.country_id
      },
      delivery: {
        address: formData.value.delivery.address,
        bill_state: formData.value.delivery.bill_state,
        zip_code: formData.value.delivery.zip_code,
        country_id: formData.value.delivery.country_id
      }
    };

    await submitProvider(providerRequest);
  } catch (error) {
    const toast = await toastController.create({
      message: error instanceof Error ? error.message : 'Erreur inconnue',
      duration: 3000,
      color: 'danger'
    });
    await toast.present();
    
  }
};

  const getFormData = () => ({
    activities: activities.value,
    currencies: currencies.value,
    paymentTerms: paymentTerms.value,
    isLoadingActivities: isLoading.value,
    isLoadingCurrencies: isLoading.value,
    isLoadingPaymentTerms: isLoadingPaymentTerms.value
  });

  const refreshAllData = async () => {
    await Promise.all([
      loadProviders(),
      loadActivities(), 
      loadCurrencies(),
      loadPaymentTerms()
    ]);
  };
  
const displayNameOptions = computed(() => {
  const firstName = localFormData.value.first_name?.trim() || '';
  const lastName = localFormData.value.last_name?.trim() || '';
  const company = localFormData.value.organisation?.trim() || '';

  return {
    [DisplayNameType.COMPANY]: company || 'Nom entreprise',
    [DisplayNameType.FIRSTNAME_LASTNAME]: (() => {
      if (firstName && lastName) return `${firstName} ${lastName}`;
      if (firstName) return firstName;
      if (lastName) return lastName;
      return 'Prénom Nom';
    })(),
    [DisplayNameType.LASTNAME_FIRSTNAME]: (() => {
      if (firstName && lastName) return `${lastName}, ${firstName}`;
      if (lastName) return lastName;
      if (firstName) return firstName;
      return 'Nom, Prénom';
    })()
  };
});
const initializeFormWithProviderData = async (providerId: string) => {
  try {
    await fetchProviderDetails(providerId);
    
   if (providerDetails.value) {
      
      const parseAddress = (address: any) => {
        if (typeof address === 'string') {
          try {
            return JSON.parse(address);
          } catch {
            return { address: '', bill_state: '', zip_code: '', country_id: 'TN' };
          }
        }
        return address;
      };
        let displayNameType = DisplayNameType.FIRSTNAME_LASTNAME;
        if (providerDetails.value.organisation) {
          displayNameType = DisplayNameType.COMPANY;
        } else if (providerDetails.value.display_name?.includes(', ')) {
          displayNameType = DisplayNameType.LASTNAME_FIRSTNAME;
        }

      localFormData.value = {
        ...localFormData.value,
        title: providerDetails.value.title,
        first_name: providerDetails.value.first_name,
        last_name: providerDetails.value.last_name || '',
        organisation: providerDetails.value.organisation || '',
        display_name: displayNameType,
        email: providerDetails.value.email || '',
        phone: providerDetails.value.phone || '',
        website: providerDetails.value.website || '',
        type: providerDetails.value.type,
        reference: providerDetails.value.reference || '',
        hashed_activity_id: providerDetails.value.hashed_activity_id,
        hashed_currency_id: providerDetails.value.hashed_currency_id,
        hashed_default_invoice_deadline_id: providerDetails.value.hashed_default_invoice_deadline_id || '',
        note: providerDetails.value.note || '',
        fiscal_id: providerDetails.value.fiscal_id || '',
        billing: {
          ...parseAddress(providerDetails.value.billing),
          country_id: parseAddress(providerDetails.value.billing).country_id || 'TN'
        },
        delivery: {
          ...parseAddress(providerDetails.value.delivery),
          country_id: parseAddress(providerDetails.value.delivery).country_id || 'TN'
        }
      };
    }
  } catch (error) {
    console.error('Erreur lors de l\'initialisation du formulaire:', error);
    const toast = await toastController.create({
      message: 'Erreur de chargement des données du fournisseur',
      duration: 3000,
      color: 'danger'
    });
    await toast.present();
    router.replace('/fournisseur');
  }
};



  onMounted(() => {
    refreshAllData();
    
  });

  return {
    providers,
    initializeFormWithProviderData,
    filteredProviders,
    paginatedProviders,
    activities,
    currencies,
    paymentTerms,displayNameOptions,
    updateProvider
    ,submitEditForm,
    isLoadingPaymentTerms,
    isLoading,
    isLoadingAdd,
    error,
    searchQuery,
    currentPage,
    itemsPerPage,
    recordPayment,
    formData,
    localFormData,
    createInvoice,
    totalPages,
    loadPaymentTerms,
    submitProvider,
    loadProviders,
    navigateToProviderDetails,
    editProvider,
    deleteProvider,
    getFormData,
    BonsSortie,
    facturation,
    Devis,
    chronologie,
    openActionPopover,
    refreshAllData,
    BonsLivraison,
    loadActivities,
    loadCurrencies,
    fetchProviderDetails,
    isLoadingDetails,
    providerDetails,
    errorDetails,
    submitForm
  };
}
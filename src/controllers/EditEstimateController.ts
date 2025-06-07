import { ref, computed, onMounted, reactive, watch } from 'vue';
import { 
  AddEstimateForm, 
  Estimate, 
  EstimateItem, 
  ItemTax,
  Discount
} from '@/models/DevisModel';
import { updateEstimate, fetchEstimateDetails } from '@/services/Devis';
import { fetchTaxes } from '@/services/Company';
import { getClientsList } from '@/services/Clients';
import { fetchItems } from '@/services/Items';
import { toastController, loadingController } from '@ionic/vue';
import { fetchCategories } from '@/services/Categories';
import { fetchBanks } from '@/services/Banks';
import { useRoute, useRouter } from 'vue-router';
import { createDefautEstimateForm } from '@/utils/EstimateFactory';

export function useUpdateEstimateController() {
  const router = useRouter();
  const route = useRoute();
  
  // State
  const isLoading = ref(false);
  const error = ref<string | null>(null);
  const EstimateForm = reactive<AddEstimateForm>(createDefautEstimateForm());
  const isArticleModalOpen = ref(false);
  const isArticleDetailsModalOpen = ref(false);
  const isNewItemModalOpen = ref(false);
  const selectedArticle = ref<EstimateItem>({
    id: '',
    hashed_id: '',
    title: '',
    description: '',
    quantity: 1,
    unitPrice: 0,
    discount: { value: 0, type: '%' },
    taxes: [],
    price: 0
  });
  
  const Items = ref<string[]>([]);
  const availableArticles = ref<EstimateItem[]>([]);
  const currentPage = ref(1);
  const articlesPerPage = 5;
  const searchQuery = ref('');
  const fileInputRef = ref<HTMLInputElement | null>(null);
  const clients = ref<any[]>([]);
  const billingAddress = ref<string>('');
  const deliveryAddress = ref<string>('');
  const isNewItem = ref(false);
  const banks = ref<any[]>([]);
  const taxes = ref<any[]>([]);
  const categories = ref<any[]>([]);

  // Utils
  const showToast = async (message: string, color: string = 'warning') => {
    const toast = await toastController.create({
      message,
      duration: 2000,
      color,
      position: 'top',
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

  // Client functions
  const onClientSelected = (selectedValue: string) => {
    const client = clients.value.find(c => c.hashed_id === selectedValue);
    if (client) {
      billingAddress.value = client.billing_address || '';
      deliveryAddress.value = client.delivery_address || '';
    }
  };

  // Articles functions
  const calculateArticlePrice = (article: EstimateItem): number => {
    const quantity = Number(article.quantity || 0);
    const unitPrice = Number(article.unitPrice || 0);
    const basePrice = quantity * unitPrice;
    
    let discountedPrice = basePrice;
    if (article.discount?.type === '%') {
      discountedPrice = basePrice * (1 - (article.discount.value / 100));
    } else {
      discountedPrice = Math.max(0, basePrice - (article.discount?.value || 0));
    }
    
    return parseFloat(discountedPrice.toFixed(2));
  };

  const getTaxAmount = (article: EstimateItem, tax: ItemTax): number => {
    const price = calculateArticlePrice(article);
    return parseFloat((price * (tax.rate || 0) / 100).toFixed(2));
  };

  const addArticleForm = () => {
    const newItem: EstimateItem = {
      id: Date.now().toString(),
      hashed_id: '',
      title: '',
      description: '',
      quantity: 1,
      unitPrice: 0,
      discount: { value: 0, type: '%' },
      taxes: [],
      price: 0
    };
    selectedArticle.value = newItem;
    isNewItem.value = true;
    isArticleDetailsModalOpen.value = true;
  };

  const removeArticle = (articleId: string) => {
    EstimateForm.items = EstimateForm.items.filter(item => item.id !== articleId);
    calculateTotals();
  };

  const openArticleDetailsModal = (article: EstimateItem) => {
    selectedArticle.value = { ...article };
    selectedArticle.value.price = calculateArticlePrice(selectedArticle.value);
    isNewItem.value = false;
    isArticleDetailsModalOpen.value = true;
  };

  const closeArticleDetailsModal = () => {
    isArticleDetailsModalOpen.value = false;
  };

  // Taxes functions
  const onTaxChange = (selectedTaxId: string, taxIndex: number) => {
    const selectedTax = taxes.value.find(t => t.hashed_id === selectedTaxId);
    if (selectedTax && selectedArticle.value) {
      selectedArticle.value.taxes[taxIndex] = {
        id: selectedTax.hashed_id,
        title: selectedTax.title,
        rate: selectedTax.rate
      };
      // Recalculer le prix de l'article avec la nouvelle taxe
      selectedArticle.value.price = calculateArticlePrice(selectedArticle.value);
    }
  };

  const addTax = () => {
    if (selectedArticle.value) {
      selectedArticle.value.taxes.push({
        id: '',
        title: '',
        rate: 0
      });
    }
  };

  const removeTax = (taxIndex: number) => {
    if (selectedArticle.value && selectedArticle.value.taxes.length > taxIndex) {
      selectedArticle.value.taxes.splice(taxIndex, 1);
      // Recalculer le prix de l'article après suppression de la taxe
      selectedArticle.value.price = calculateArticlePrice(selectedArticle.value);
    }
  };

  // Additional Inputs functions
  const toggleAdditionalInput = (inputName: 'tva' | 'stamp' | 'example') => {
    EstimateForm.activeAdditionalInputs[inputName] = !EstimateForm.activeAdditionalInputs[inputName];
    calculateTotals();
  };

  // Totals calculations
  const calculateSubtotal = (): number => {
    return EstimateForm.items.reduce((sum, item) => {
      return sum + calculateArticlePrice(item);
    }, 0);
  };

  const calculateTaxes = (): number => {
    return EstimateForm.items.reduce((sum, item) => {
      return sum + item.taxes.reduce((taxSum, tax) => {
        return taxSum + getTaxAmount(item, tax);
      }, 0);
    }, 0);
  };

  const calculateAdditionalInputs = (): number => {
    let total = 0;
    
    // TVA (19%)
    if (EstimateForm.activeAdditionalInputs.tva) {
      const subtotal = calculateSubtotal();
      total += subtotal * 0.19;
    }
    
    // Timbre Fiscal
    if (EstimateForm.activeAdditionalInputs.stamp) {
      total += 1; // Valeur fixe du timbre fiscal
    }
    
    // Example (peut être ajusté selon besoin)
    if (EstimateForm.activeAdditionalInputs.example) {
      total += 0; // Mettre la valeur souhaitée
    }
    
    return total;
  };


// Dans le script setup
const calculateTvaAmount = () => {
  if (EstimateForm.activeAdditionalInputs.tva) {
    const subtotal = parseFloat(EstimateForm.totals.subtotal);
    return subtotal * 0.19;
  }
  return 0;
};

const calculateStampAmount = () => {
  return EstimateForm.activeAdditionalInputs.stamp ? 1 : 0;
};

// Modifiez la fonction calculateTotals dans le contrôleur
const calculateTotals = () => {
  const subtotal = calculateSubtotal();
  const discount = parseFloat(EstimateForm.totals.discount) || 0;
  const taxes = calculateTaxes();
  const additionalInputs = calculateAdditionalInputs();
  const total = Math.max(0, (subtotal - discount )+ taxes + additionalInputs);
  
  EstimateForm.totals = {
    subtotal: subtotal.toFixed(2),
    taxes: taxes.toFixed(2),
    discount: discount.toFixed(2),
    total: total.toFixed(2)
  };
};
// Watch pour les changements d'articles
watch(() => EstimateForm.items, () => {
  calculateTotals();
}, { deep: true });

// Watch pour les changements de discount
watch(() => EstimateForm.totals.discount, () => {
  calculateTotals();
});

// Watch pour les additional inputs
watch(() => EstimateForm.activeAdditionalInputs, () => {
  calculateTotals();
}, { deep: true });

  const formatPrice = (price: any): string => {
    return Number(price).toFixed(3);
  };

  // File handling
  const triggerFileInput = () => {
    fileInputRef.value?.click();
  };

  const handleFileChange = (event: Event) => {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) {
      EstimateForm.attachments = Array.from(input.files);
    }
  };

  const getFileDisplayText = (): string => {
    if (!EstimateForm.attachments.length) return "Aucun fichier sélectionné";
    if (EstimateForm.attachments.length === 1) return EstimateForm.attachments[0].name;
    return `${EstimateForm.attachments.length} fichiers sélectionnés`;
  };

  // Articles modal
  const openArticleModal = () => {
    isArticleModalOpen.value = true;
  };

  const closeArticleModal = () => {
    isArticleModalOpen.value = false;
  };

  const itemSelection = (itemId: string) => {
    const index = Items.value.indexOf(itemId);
    if (index === -1) {
      Items.value.push(itemId);
    } else {
      Items.value.splice(index, 1);
    }
  };

  const addSelectedItems = async () => {
    for (const itemId of Items.value) {
      const item = availableArticles.value.find(a => a.id === itemId);
      if (item) {
        const newItem: EstimateItem = {
          id: item.id,
          hashed_id: item.hashed_id,
          title: item.title,
          description: item.description,
          quantity: 1,
          unitPrice: item.unitPrice,
          discount: { value: 0, type: '%' },
          taxes: item.taxes || [],
          price: item.unitPrice
        };
        EstimateForm.items.push(newItem);
      }
    }
    Items.value = [];
    isArticleModalOpen.value = false;
    calculateTotals();
  };

  // Pagination
  const paginatedArticles = computed(() => {
    const filtered = availableArticles.value.filter(article =>
      article.title.toLowerCase().includes(searchQuery.value.toLowerCase())
    );
    const start = (currentPage.value - 1) * articlesPerPage;
    return filtered.slice(start, start + articlesPerPage);
  });

  const totalPages = computed(() => {
    const filteredCount = availableArticles.value.filter(article =>
      article.title.toLowerCase().includes(searchQuery.value.toLowerCase())
    ).length;
    return Math.ceil(filteredCount / articlesPerPage);
  });

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

  // Observer les changements dans l'article sélectionné pour les calculs en temps réel
  watch(
    () => selectedArticle.value,
    () => {
      if (selectedArticle.value) {
        selectedArticle.value.price = calculateArticlePrice(selectedArticle.value);
      }
    },
    { deep: true }
  );

  // Save article
  const saveArticle = () => {
    if (!selectedArticle.value) return;

    selectedArticle.value.price = calculateArticlePrice(selectedArticle.value);
    
    const itemIndex = EstimateForm.items.findIndex(
      item => item.id === selectedArticle.value?.id
    );

    if (itemIndex !== -1) {
      EstimateForm.items[itemIndex] = { ...selectedArticle.value };
    } else {
      EstimateForm.items.push({ ...selectedArticle.value });
    }
    
    closeArticleDetailsModal();
    calculateTotals();
  };

  // Form validation
  const validateEstimateForm = (): boolean => {
    if (!EstimateForm.client_id) {
      showToast('Client requis', 'danger');
      return false;
    }
    if (EstimateForm.items.length === 0) {
      showToast('Au moins un article est requis', 'danger');
      return false;
    }
    return true;
  };

  const fetchEstimate = async () => {
    isLoading.value = true;
    try {
      const estimateId = route.params.idestimate as string;
      if (!estimateId) throw new Error('ID du devis manquant');

      const response = await fetchEstimateDetails(estimateId);
      if (!response?.data?.estimate) throw new Error('Structure de données invalide');

      const estimateData = response.data.estimate;

      // Mappage des données principales
      EstimateForm.date = estimateData.date?.split('T')[0] || '';
      EstimateForm.due = estimateData.due?.split('T')[0] || '';
      EstimateForm.estimate_number = estimateData.estimate_number || '';
      EstimateForm.referenceNumber = estimateData.reference_number || '';
      EstimateForm.client_id = estimateData.hashed_contact_id || '';
      EstimateForm.tax_type = estimateData.tax_type || 1;
      EstimateForm.object = estimateData.object || '';
      EstimateForm.watermark = estimateData.watermark || '';
      EstimateForm.generalTerms = estimateData.conditions || '';
      EstimateForm.language = estimateData.language || 'fr';
      EstimateForm.category = estimateData.hashed_invoice_category_id || '';
      EstimateForm.currency_rate = estimateData.currency_rate || 1;
      EstimateForm.remarks = estimateData.notes || '';
      EstimateForm.show_unity = estimateData.show_unity ? 1 : 0;

      // Gestion des totaux
      if (typeof estimateData.totals === 'string') {
        EstimateForm.totals = JSON.parse(estimateData.totals);
      } else {
        EstimateForm.totals = estimateData.totals || {
          discount: '0',
          total: '0',
          taxes: '0',
          subtotal: '0'
        };
      }

      // Paramètres d'affichage
      const display = typeof estimateData.display === 'string' 
        ? JSON.parse(estimateData.display) 
        : estimateData.display || {};

      EstimateForm.show_description = display.description ? 1 : 0;
      EstimateForm.showArticleUnit = display.unity ? 1 : 0;
      EstimateForm.showArticleTTCPrices = display.ttc ? 1 : 0;
      EstimateForm.show_pictures = display.pictures ? 1 : 0;
      EstimateForm.show_billing = display.billing ? 1 : 0;
      EstimateForm.show_delivery = display.delivery ? 1 : 0;
      EstimateForm.show_conditions = display.conditions ? 1 : 0;
      EstimateForm.show_stamp = display.stamp ? 1 : 0;
      EstimateForm.show_bank = display.bank ? 1 : 0;
      EstimateForm.selected_bank = display.selected_bank || '';

      // Mapping des articles
      EstimateForm.items = (estimateData.items || []).map((item: any) => ({
        id: item.hashed_id || '',
        hashed_id: item.hashed_id || '',
        title: item.temporary_item || item.item?.title || '',
        description: item.description || '',
        quantity: item.quantity || 0,
        unitPrice: parseFloat(item.rate) || 0,
        discount: {
          value: parseFloat(item.discount_rate) || 0,
          type: item.discount_type === 1 ? '%' : 'fixed'
        },
        taxes: (item.taxes || []).map((tax: any) => ({
          id: tax.hashed_id || '',
          title: tax.title || '',
          rate: parseFloat(tax.rate) || 0
        })),
        price: (parseFloat(item.rate) || 0) * (item.quantity || 0)
      }));

      // Gestion des additional inputs
      if (estimateData.additional_inputs) {
        estimateData.additional_inputs.forEach((input: any) => {
          if (input.hashed_id === 'tva' && input.value > 0) {
            EstimateForm.activeAdditionalInputs.tva = true;
          } else if (input.hashed_id === 'stamp' && input.value > 0) {
            EstimateForm.activeAdditionalInputs.stamp = true;
          } else if (input.hashed_id === 'example' && input.value > 0) {
            EstimateForm.activeAdditionalInputs.example = true;
          }
        });
      }

      calculateTotals();

    } catch (err) {
      console.error('Erreur lors du chargement du devis:', err);
      error.value = 'Échec du chargement du devis';
      showToast('Erreur lors du chargement du devis', 'danger');
    } finally {
      isLoading.value = false;
    }
  };

 // Submit form
const validateAndSubmit = async () => {
  if (!validateEstimateForm()) return;
  
  const loading = await createLoading('Mise à jour du devis...');
  try {
    // Mise à jour des additional inputs avec les valeurs actuelles
    EstimateForm.additional_inputs = EstimateForm.additional_inputs.map(input => {
      const isActive = EstimateForm.activeAdditionalInputs[input.hashed_id as keyof typeof EstimateForm.activeAdditionalInputs];
      return {
        ...input,
        value: isActive ? (input.hashed_id === 'tva' ? 19 : input.hashed_id === 'stamp' ? 1 : 0) : 0,
        active: isActive
      };
    });

    // Afficher les données avant envoi
    console.log("Données à envoyer:", {
      ...EstimateForm,
      // Convertir les fichiers en noms pour une meilleure lisibilité
      attachments: EstimateForm.attachments.map(file => file.name),
      items: EstimateForm.items.map(item => ({
        ...item,
        price: calculateArticlePrice(item) // Calculer le prix final
      }))
    });

    const result = await updateEstimate(route.params.idestimate as string, EstimateForm);
    
    if (result.success) {
      await showToast('Devis mis à jour avec succès', 'success');
      router.back();
    } else {
      await showToast(result.message || 'Échec de la mise à jour', 'danger');
    }
  } catch (error) {
    console.error("Erreur lors de l'envoi:", error);
    await showToast('Erreur lors de la mise à jour', 'danger');
  } finally {
    loading.dismiss();
  }
};
  onMounted(async () => {
    try {
      // Charger les données nécessaires
      clients.value = await getClientsList();
      
      const itemsResponse = await fetchItems();
      availableArticles.value = itemsResponse.items.data.map((item: any) => ({
        id: item.hashed_id,
        hashed_id: item.hashed_id,
        title: item.title,
        description: item.description || '',
        quantity: item.stock || 0,
        unitPrice: parseFloat(item.prices?.[0]?.default_selling_rate) || 0,
        discount: { value: 0, type: '%' },
        taxes: [],
        price: parseFloat(item.prices?.[0]?.default_selling_rate) || 0
      }));
  
      categories.value = (await fetchCategories()).categories;
      banks.value = (await fetchBanks()).banks.data;
      taxes.value = (await fetchTaxes())?.data?.data?.taxes?.data || [];
      
      // Charger les détails du devis
      await fetchEstimate();
    } catch (error) {
      console.error('Erreur initialisation:', error);
      error.value = 'Échec du chargement des données';
      await showToast('Erreur lors du chargement des données', 'danger');
    }
  });

  return {
    // State
    EstimateForm,
    isLoading,
    error,
    isArticleModalOpen,
    isArticleDetailsModalOpen,
    isNewItemModalOpen,
    selectedArticle,
    Items,
    paginatedArticles,
    totalPages,
    currentPage,
    searchQuery,
    clients,
    billingAddress,
    deliveryAddress,
    categories,
    banks,
    fileInputRef,
    taxes,
    calculateTotals,
  calculateTvaAmount,
  calculateStampAmount,
    
    onClientSelected,
    calculateArticlePrice,
    getTaxAmount,
    addArticleForm,
    removeArticle,
    openArticleDetailsModal,
    closeArticleDetailsModal,
    onTaxChange,
    addTax,
    removeTax,
    toggleAdditionalInput,
    calculateSubtotal,
    calculateTaxes,
    
    formatPrice,
    triggerFileInput,
    handleFileChange,
    getFileDisplayText,
    openArticleModal,
    closeArticleModal,
    itemSelection,
    addSelectedItems,
    nextPage,
    prevPage,
    saveArticle,
    validateEstimateForm,
    validateAndSubmit,
    fetchEstimate
  };
}
import { fetchDeliveryNotes } from '../services/DeliveryService';
import { ref, computed, onMounted, watch, reactive } from 'vue';
import type { AddDeliveryNoteForm, DeliveryNoteItem} from '@/models/DeliveryNotesModel';
import type { Currency } from '@/models/CompanyModel';
import type { Address } from '@/models/ClientModel';
import type { Client } from '@/models/ClientModel';
import { updatedDeliveryNote, getDeliveryNoteDetails, validateDeliveryNote } from '@/services/DeliveryService'; 
import { fetchTaxes } from '@/services/Company'; 
import { getClientsList } from '@/services/Clients'; 
import { fetchItems } from '@/services/Items'; 
import { Item } from '@/models/ItemModel';
import { toastController } from '@ionic/vue'; 
import { fetchCategories } from '@/services/Categories';
import { fetchBanks } from '@/services/Banks'; 
import { Bank } from '@/models/BankModel';
import { fetchCurrentCompany } from '@/services/Dashboard'; 
import apiService from '@/services/Dashboard'; 
import { AddItem, getPriceList, getBrandsList, getCategoriesList, getUnitiesList } from '@/services/Items'; 
import { useRoute } from 'vue-router';
import { createDefautDeliveryNoteForm} from '@/utils/DeliveryNotesFactory';
export function useUpdateDeliverNoteController() {
  const isLoading = ref(false);
  const error = ref<string | null>(null);
  const route = useRoute();
  const DeliveryForm = reactive<AddDeliveryNoteForm>(createDefautDeliveryNoteForm());
  const companyName = ref('');
  const isArticleModalOpen = ref(false);
  const isArticleDetailsModalOpen = ref(false);
  const isNewItemModalOpen = ref(false);
  const isNewItemPopoverOpen = ref(false);
  const selectedArticle = ref<DeliveryNoteItem>({
        id: '',
    title: '',
    description: '',
    quantity: 1,
    unitPrice: 0,
    discount: { value: 0, type: '%' }, // Fixed type from '0.0' to '%'
    taxes: [{ hashed_id: '', title: '', rate: 0 }],
    price: 0
  });
    const Items = ref<string[]>([]);
    const availableArticles = ref<DeliveryNoteItem[]>([]);
    const currentPage = ref(1);
    const articlesPerPage = 5;
    const searchQuery = ref('');
    const fileInputRef = ref<HTMLInputElement | null>(null);
    const clients = ref<Client[]>([]);
    const selectedClient = ref<Client | null>(null);
    const selectedCurrency = ref<Currency | null>(null);
    const billingAddress = ref<Address | null>(null);
    const deliveryAddress = ref<Address | null>(null);
    const isNewItem = ref(false);
     const newItemForm = ref({
    title: '',
    reference: '',
    description: '',
    taxe: '0%',
    unity: '',
    category: 'None',
    brand: 'None',
  });
    const itemUnities = ref([]);
  const itemCategories = ref([]);
  const itemBrands = ref([]);
  const banks = ref<Bank[]>([]);
  const taxes = ref<any[]>([]);
  const itemDestination = ref<number | null>(null);
  const itemType = ref<number | null>(null);
  const sellingRate = ref(0);
  const buyingRate = ref(0);
  const taxValues = ref({
    tva: 10.07
  });
    const currentYear = ref(new Date().getFullYear());

  const categories = ref<any[]>([]);
  const DeliveryId = route.params.id as string;
  const currencyRate = ref(3.315);

  const showToast = async (message: string) => {
    const toast = await toastController.create({
      message,
      duration: 2000,
      color: 'warning',
      position: 'top',
    });
    toast.present();
  };
    const triggerFileInput = () => {
    if (fileInputRef.value) {
      fileInputRef.value.click();
    } else {
      console.error("File input ref not found");
    }
  };
  
  const handleFileChange = (event: Event) => {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      DeliveryForm.attachments = Array.from(input.files);
      console.log("Files added:", DeliveryForm.attachments);
      if (DeliveryForm.attachments.length > 0) {
        console.log("Files successfully saved to form");
        console.log("Number of files:", DeliveryForm.attachments.length);
        const fileNames = DeliveryForm.attachments.slice(0, 3).map(file => file.name);
        console.log("File names:", fileNames);
      } else {
        console.error("Files were not saved to form");
      }
    }
  };
   const getFileDisplayText = () => {
    if (!DeliveryForm.attachments || DeliveryForm.attachments.length === 0) {
      return "No file chosen";
    } else if (DeliveryForm.attachments.length === 1) {
      return DeliveryForm.attachments[0].name;
    } else {
      return `${DeliveryForm.attachments.length} files selected`; // Fixed template string syntax
    }
  };
    // Calculs
  const calculateSubtotal = () => {
    if (!DeliveryForm.items || DeliveryForm.items.length === 0) {
      return 0;
    }
    const subtotal = DeliveryForm.items.reduce((sum, item) => {
      const itemTotal = calculateArticlePrice(item);
      return sum + itemTotal;
    }, 0);
    DeliveryForm.totals.subtotal = subtotal.toFixed(3);
    return subtotal;
  };

    const calculateTaxes = (): number => {
    if (!DeliveryForm?.AdditionalEntries) {
      return 0;
    }
    const totalTax = (Object.keys(taxValues.value) as Array<keyof typeof taxValues.value>)
      .reduce((sum, key) => {
        const isEnabled = DeliveryForm.AdditionalEntries[key] === 1;
        const taxAmount = taxValues.value[key] || 0;
        return sum + (isEnabled ? taxAmount : 0);
      }, 0);
    console.log('exitvoucher Form:', DeliveryForm);
    DeliveryForm.totals.taxes = totalTax.toFixed(3);
    return totalTax;
  };
    const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const discount = parseFloat(DeliveryForm.totals.discount) ;
    const taxes = calculateTaxes();
    const total = Math.max(0, subtotal - discount + taxes);
    DeliveryForm.totals.taxes = taxes.toFixed(3);
    DeliveryForm.totals.total = total.toFixed(3);
    return total;
  };

    const formatPrice = (price: any) => {
    return Number(price).toFixed(3);
  };

  const updateTotals = () => {
    calculateTotal();
  };

  const toDateOnly = (dateStr: string | null): string => {
    return dateStr ? dateStr.split('T')[0] : '';
  };
    // Gestion des articles
    const addArticleForm = () => {
      const newItemForm: DeliveryNoteItem = {
        id: Date.now().toString(),
        title: '',
        description: '',
        quantity: 1,
        unitPrice: 0,
        discount: { value: 0, type: '%' },
        taxes: [{
          hashed_id: '',        
          title: '',    
          rate: 0        
        }],
        price: 0.0
      };
      selectedArticle.value = newItemForm;
      isNewItem.value = true;
      isArticleDetailsModalOpen.value = true;
    };
   const removeArticle = (articleId: string) => {
    if (DeliveryForm.items.length > 1) {
      DeliveryForm.items = DeliveryForm.items.filter(item => item.id !== articleId);
    }
  };

  const openArticleDetailsModal = (articleParam: any) => {
    let article;
    if (typeof articleParam === 'object') {
      article = articleParam;
    } else {
      article = DeliveryForm.items.find(item => item.id === articleParam);
    }
    
    if (article) {
      selectedArticle.value = { 
        id: article.id || '',
        title: article.title || '',
        description: article.description || '',
        quantity: article.quantity || 0,
        unitPrice: article.unitPrice || 0,
        discount: article.discount || { value: 0, type: '%' }, // Fixed type from '0.0' to '%'
        taxes: article.taxes || [],
        price: 0
      };
      selectedArticle.value.price = calculateArticlePrice(selectedArticle.value);
      if (!article.title) {
        isNewItemPopoverOpen.value = true;
      }
      isNewItem.value = false;
      isArticleDetailsModalOpen.value = true;
    } else {
      console.error("Could not find article:", articleParam);
    }
  };     

  const closeArticleDetailsModal = () => {
    isArticleDetailsModalOpen.value = false;
    setTimeout(() => {
      selectedArticle.value = {
        id: '',
        title: '',
        description: '',
        quantity: 1,
        unitPrice: 0,
        discount: { value: 0, type: '%' }, // Fixed type from '0.0' to '%'
        taxes: [],
        price: 0
      };
    }, 100);
  };
   const calculateArticlePrice = (article: DeliveryNoteItem): number => {
      const quantity = Number(article.quantity || 0);
      const unitPrice = Number(article.unitPrice || 0);
      const basePrice = quantity * unitPrice;
      let discountedPrice = basePrice;
      const discount = article.discount || { value: 0, type: '%' }; // Fixed type from '0.0' to '%'
  
      if (discount.type === '0.0') { // Keep this for backward compatibility
        discountedPrice = Math.max(0, basePrice - discount.value);
      } else {
        discountedPrice = basePrice * (1 - (discount.value / 100));
      }
      
      return parseFloat(discountedPrice.toFixed(2));
    };
      const getTaxAmount = (article: DeliveryNoteItem, tax: { rate: number }): number => {
        const quantity = Number(article.quantity || 0);
        const unitPrice = Number(article.unitPrice || 0);
        const rate = Number(tax.rate || 0);
        const basePrice = quantity * unitPrice;  
        const discount = article.discount || { value: 0, type: "%" };
        let discountedPrice = basePrice;
      
        if (discount.type === "%") {
          discountedPrice = basePrice * (1 - discount.value / 100);
        } else {
          discountedPrice = Math.max(0, basePrice - discount.value);
        }
    
        const taxAmount = parseFloat((discountedPrice * rate / 100).toFixed(2));  
        return taxAmount;
      };
        const onTaxChange = (selectedTaxId: string, articleId: string, taxIndex: number) => {
    const selectedTax = taxes.value.find(t => t.hashed_id === selectedTaxId);
    if (selectedTax) {  
      selectedArticle.value.taxes[taxIndex] = {
        hashed_id: selectedTax.hashed_id,
        title: selectedTax.title,
        rate: selectedTax.rate,
      };
    } else {
      console.warn('Tax not found for ID:', selectedTaxId);
    }
  };
    const addTax = (articleId: string) => {
    const article = selectedArticle.value?.id === articleId
      ? selectedArticle.value
      : DeliveryForm.items.find(a => a.id === articleId);

    if (article) {
      article.taxes = article.taxes || [];
      article.taxes.push({
        hashed_id: '',
        title: '',
        rate: 0
      });
    }
  };
    const removeTax = (articleId: string, taxIndex: number) => {
    const article = selectedArticle.value?.id === articleId
      ? selectedArticle.value
      : DeliveryForm.items.find(a => a.id === articleId);
  
    if (!article || !article.taxes) return;
  
    if (article.taxes.length <= 1) {
      console.warn("At least one tax must remain.");
      return;
    }
    article.taxes.splice(taxIndex, 1);
  };
    const saveArticle = () => {
    if (selectedArticle.value) {
      selectedArticle.value.price = calculateArticlePrice(selectedArticle.value);
  
      const itemCopy = {
        ...selectedArticle.value,
        taxes: selectedArticle.value.taxes
          ? selectedArticle.value.taxes.map(t => ({ ...t })) 
          : []
      };
      const itemIndex = DeliveryForm.items.findIndex(
        item => item.id === selectedArticle.value.id
      );
  
      if (itemIndex !== -1) {
        DeliveryForm.items[itemIndex] = itemCopy;
      } else {
        DeliveryForm.items.push(itemCopy);
      }
      closeArticleDetailsModal();
    }
  };
   const validateDeliveryNoteForm = (): boolean => { // Fixed function name casing
    if (DeliveryForm.items.length === 0) {
      console.error('At least one article is required');
      return false;
    }
    if (!DeliveryForm.client_id) {
      console.error('Client is required');
      return false;
    }
    return true;
  };
const validateAndSubmit = async () => {
  if (validateDeliveryNoteForm()) {
    isLoading.value = true;
    try {
      const deliveryId = route.params.idbons as string;
      const updatedVoucher = await updatedDeliveryNote(deliveryId, DeliveryForm);
      
      if (updatedVoucher.success) {
        await showToast('Bon de livraison mis à jour avec succès', 'success');
        console.log("Voucher updated successfully:", updatedVoucher);
      } else {
        await showToast(updatedVoucher.message || 'Échec de la mise à jour', 'warning');
      }
    } catch (error) {
      console.error("Failed to update voucher:", error);
      await showToast('Erreur lors de la mise à jour', 'danger');
    } finally {
      isLoading.value = false;
    }
  }
};
      const openArticleModal = () => isArticleModalOpen.value = true;
  const closeArticleModal = () => isArticleModalOpen.value = false;
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

  watch(searchQuery, () => {
    currentPage.value = 1;
  });
    const itemSelection = async (itemId: any) => {
    const isSelected = Items.value.includes(itemId);
    const article = availableArticles.value.find(a => a.id === itemId);
    if (!article) return;
    if (!isSelected) {
      if (article.quantity <= 0) {
        await showToast(`${article.title || 'Item'} is not in stock`);
        return;
      }
      Items.value.push(itemId);
      article.quantity -= 1;
    } else {
      Items.value = Items.value.filter(id => id !== itemId);
      article.quantity += 1;
    }
  };
    const addSelectedItems = async () => {
      for (const itemId of Items.value) {
        const item = availableArticles.value.find(a => a.id === itemId);
        if (!item) continue;
        if (item.quantity <= -1) {
          await showToast(`${item.title || 'Item'} is not in stock`);
          continue;
        }
        const newItem: DeliveryNoteItem = {
          id: item.id,
          title: item.title || '',
          description: item.description || '',
          quantity: 1,
          unitPrice: item.unitPrice || 0,
          discount: { value: 0, type: '%' },
          taxes: item.taxes || [{ id: Date.now().toString(), type: 'TVA(0%)' }],
  
          price: item.unitPrice || 0,
        };
        DeliveryForm.items.push(newItem);
        item.quantity -= 1;
      }
      Items.value = [];
      isArticleModalOpen.value = false;
    };
  
    // Navigation pagination
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
    // Gestion nouveau article
  const openNewItemModal = async () => {
    isNewItemModalOpen.value = true;
    isNewItemPopoverOpen.value = false;
    newItemForm.value = {
      title: '',
      reference: '',
      description: '',
      taxe: '0%',
      unity: '',
      category: '',
      brand: '',
    };
    itemDestination.value = 1;
    itemType.value = 1;
    sellingRate.value = 0;
    buyingRate.value = 0;
    
    try {
      const [unitiesRes, categoriesRes, brandsRes] = await Promise.all([
        getUnitiesList(),
        getCategoriesList(),
        getBrandsList(),
      ]);
      
      itemUnities.value = unitiesRes.unities || [];
      itemCategories.value = categoriesRes.categories || [];
      itemBrands.value = brandsRes.brands || [];
    } catch (error) {
      console.error("Error fetching item data:", error);
    }
  };


  const closeNewItemModal = () => {
    console.log('Closing modal');  
    isNewItemModalOpen.value = false;
  };


  const addNewItem = async () => {
  try {
    const priceListResponse  = await getPriceList();
    const priceLists = priceListResponse.priceLists;
    const priceListId = priceLists[0]?.hashed_id;
    if (!priceListId) {
      throw new Error('No price list found');
    }
    const payload = {
      title: newItemForm.value.title,
      reference: newItemForm.value.reference,
      description: newItemForm.value.description,
      taxe: newItemForm.value.taxe,
      type: itemType.value ?? 1,
      destination: itemDestination.value ?? 1,
      unity_id: newItemForm.value.unity,
      category: newItemForm.value.category,
      brand: newItemForm.value.brand,
      prices: [{
        default_selling_rate: sellingRate.value.toString(),
        default_buying_rate: buyingRate.value.toString(),
        item_price_list_hashed_id: priceListId, 
      }],
    };
    const createdItem = await AddItem(payload);
    console.log('jadwil dharb : ', payload);

    console.log('Item created:', createdItem);
    closeNewItemModal();
  } catch (error) {
    console.error('Error creating item:', error);
  }
};

  const onClientSelected = (selectedValue : string) => {
    console.log('Client ID selected:', selectedValue);
    const client = clients.value.find(c => c.hashed_id === selectedValue);
    console.log('Found client:', client);
    selectedClient.value = client || null;
    selectedCurrency.value = client?.currency || null;
    console.log('Selected currency:', selectedCurrency.value);
    if (client?.billing) {
      if (typeof client.billing === 'string') {
        try {
          billingAddress.value = JSON.parse(client.billing) as Address;
          deliveryAddress.value = JSON.parse(client.delivery) as Address;

        } catch (e) {
          console.warn('Failed to parse billing address:', e);
          billingAddress.value = null;
          deliveryAddress.value = null;
        }
      } else {
        billingAddress.value = client.billing;
        deliveryAddress.value = client.billing;
      }
    } else {
      billingAddress.value = null;
      deliveryAddress.value = null;

    }
    console.log('Selected billing:', billingAddress.value);
    console.log('Selected delivary:', deliveryAddress.value);

  };
  
 const fetchDeliveryNotes = async () => {
  try {
    // Utiliser le bon paramètre d'ID depuis la route
    const deliveryId = route.params.idbons as string;
    
    if (!deliveryId) {
      throw new Error('Delivery ID is missing');
    }
    
    // Appel au service
    const response = await getDeliveryNoteDetails(deliveryId);
    
    // Vérifier la structure de réponse
    if (!response?.data?.delivery) {
      throw new Error('Invalid API response structure');
    }
    
    const delivery = response.data.delivery;
    const contact = delivery.contact || {};
    
    // Mise à jour du formulaire avec les données
    DeliveryForm.date = delivery.date?.split('T')[0] || new Date().toISOString().split('T')[0];
    DeliveryForm.DeliveryNote_number = delivery.delivery_number || '';
    DeliveryForm.client_id = contact.hashed_id || '';
    DeliveryForm.referenceNumber = delivery.reference_number || '';
    DeliveryForm.object = delivery.object || '';
    DeliveryForm.category = delivery.hashed_invoice_category_id || '';
    DeliveryForm.generalTerms = delivery.conditions || '';
    DeliveryForm.watermark = delivery.watermark || '';
    DeliveryForm.remarks = delivery.notes;
    DeliveryForm.tax_type = delivery.tax_type;
    DeliveryForm.currency_rate = delivery.currency_rate;
    DeliveryForm.language = delivery.language;
    
    // Gestion des totaux (qui peut être une string JSON)
    if (typeof delivery.totals === 'string') {
      try {
        DeliveryForm.totals = JSON.parse(delivery.totals);
      } catch (e) {
        console.error('Failed to parse totals:', e);
        DeliveryForm.totals = {
          discount: '0',
          total: '0',
          taxes: '0',
          subtotal: '0'
        };
      }
    } else {
      DeliveryForm.totals = delivery.totals || {
        discount: '0',
        total: '0',
        taxes: '0',
        subtotal: '0'
      };
    }
    
    // Gestion des paramètres d'affichage
    const display = typeof delivery.display === 'string' 
      ? JSON.parse(delivery.display) 
      : delivery.display || {};
    
    DeliveryForm.show_billing = display.billing ? 1 : 0;
    DeliveryForm.showArticleUnit = display.unity ? 1 : 0;
    DeliveryForm.show_delivery = display.delivery ? 1 : 0;
    DeliveryForm.show_conditions = display.conditions ? 1 : 0;
    DeliveryForm.show_stamp = display.stamp ? 1 : 0;
    DeliveryForm.show_description = display.description ? 1 : 0;
    DeliveryForm.show_bank = display.bank ? 1 : 0;
    DeliveryForm.selected_bank = display.selected_bank || '';
    DeliveryForm.show_pictures = display.pictures ? 1 : 0;
    DeliveryForm.showArticleTTCPrices = display.ttc ? 1 : 0;
    
    // Gestion des articles
    DeliveryForm.items = (delivery.items || []).map((item: any) => ({
      id: item.hashed_id || '',
      title: item.item?.title || item.temporary_item || '',
      description: item.description || '',
      quantity: item.quantity || 0,
      unitPrice: parseFloat(item.rate) || 0,
      discount: {
        value: parseFloat(item.discount_rate) || 0,
        type: item.discount_type === 1 ? '%' : '0.0'
      },
      taxes: (item.taxes || []).map((tax: any) => ({
        hashed_id: tax.hashed_id || '',
        title: tax.title || '',
        rate: parseFloat(tax.rate) || 0
      })),
      price: parseFloat(item.rate) * (item.quantity || 0) || 0
    }));
    
    // Calcul des totaux
    calculateTotal();
    
  } catch (err) {
    console.error('Error fetching delivery note details:', {
      error: err,
      routeId: route.params.idbons,
      timestamp: new Date().toISOString()
    });
    error.value = 'Failed to load delivery note details';
    throw err;
  }
};
    onMounted(async () => {
  try {
    // Charger les données nécessaires
    clients.value = await getClientsList();
    const res = await fetchItems(); 
    const items = res.items.data;
    availableArticles.value = items.map((item: Item) => ({
      id: item.hashed_id,
      title: item.title,
      quantity: item.stock,
      unitPrice: parseFloat(item.prices?.[0]?.default_selling_rate || '0'),
      discount: { value: 0, type: '%' },
      taxes: [], 
      price: parseFloat(item.prices?.[0]?.default_selling_rate || '0'),
    }));

    const category = await fetchCategories();
    categories.value = category.categories;

    const bankResponse = await fetchBanks();
    banks.value = bankResponse.banks.data;

    const { companyId } = await fetchCurrentCompany();
    const companyData = await apiService.getCompanyData(companyId);
    companyName.value = companyData.data.company.title;

    const tax = await fetchTaxes();
    const taxList = tax?.data?.data?.taxes?.data ?? [];
    taxes.value = taxList;

    // Charger les détails du bon de livraison
    await fetchDeliveryNotes();
  } catch (error) {
    console.error('Error in component initialization:', error);
    error.value = 'Failed to initialize component data';
    await showToast('Failed to load data. Please try again.', 'danger');
  }
});
          return {
    DeliveryForm,
    isArticleModalOpen,
    isArticleDetailsModalOpen,
    isNewItemModalOpen,
    isNewItemPopoverOpen,
    selectedArticle,
    currentPage,
    searchQuery,
    Items,
    paginatedArticles,
    totalPages,
    clients,
    isNewItem,
    newItemForm,
    sellingRate,
    buyingRate,
    fileInputRef,
    categories,
    selectedCurrency,
    selectedClient,
    billingAddress,
    deliveryAddress,
    itemCategories,
    itemBrands,
    itemUnities,
    banks,
    companyName,
    taxValues,
    toDateOnly,
    currencyRate,
    taxes,
    onClientSelected,
    calculateSubtotal,
    calculateTotal,
    formatPrice,
    updateTotals,
    getFileDisplayText,
    triggerFileInput,
    handleFileChange,
    addArticleForm,
    removeArticle,
    openArticleDetailsModal,
    closeArticleDetailsModal,
    addTax,
    removeTax,
    saveArticle,
    itemSelection,
    addSelectedItems,
    nextPage,
    prevPage,
    openArticleModal,
    closeArticleModal,
    openNewItemModal,
    closeNewItemModal,
    addNewItem,
    validateAndSubmit,
    calculateArticlePrice,
    onTaxChange,
    getTaxAmount,
    fetchDeliveryNotes,
    validateDeliveryNoteForm // Fixed function name casing
  };
}
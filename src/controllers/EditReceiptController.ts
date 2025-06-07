import { Receipt } from './../models/Receipt';
import { fetchReceiptNotes } from './../services/ReceiptsService';
import { ref, computed, onMounted, watch, reactive } from 'vue';
import type { AddReceiptNoteForm, ReceiptNoteItem} from '@/models/Receipt';
import type { Currency } from '@/models/CompanyModel';
import type { Address } from '@/models/ClientModel';
import type { Provider } from './../models/providerModel';
import { updateReceiptNote, getReceiptNoteDetails, validateReceiptNote } from '@/services/ReceiptsService'; 
import { fetchTaxes } from '@/services/Company'; 
import { getProvidersList } from '@/services/Provider'; 
import { fetchItems } from '@/services/Items'; 
import { Item } from '@/models/ItemModel';
import { toastController } from '@ionic/vue'; 
import { fetchCategoriesList } from '@/services/Categories';
import { fetchBanks } from '@/services/Banks'; 
import { Bank } from '@/models/BankModel';
import { fetchCurrentCompany } from '@/services/Dashboard'; 
import apiService from '@/services/Dashboard'; 
import { AddItem, getPriceList, getBrandsList, getCategoriesList, getUnitiesList } from '@/services/Items'; 
import { useRoute } from 'vue-router';
import { createDefaultReceiptNoteForm} from '@/utils/ReceiptNotesFactory';

export function useUpdateReceiptController() {
  const isLoading = ref(false);
  const error = ref<string | null>(null);
  const route = useRoute();
  const ReceiptForm = reactive<AddReceiptNoteForm>(createDefaultReceiptNoteForm());
  const companyName = ref('');
  const isArticleModalOpen = ref(false);
  const isArticleDetailsModalOpen = ref(false);
  const isNewItemModalOpen = ref(false);
  const isNewItemPopoverOpen = ref(false);
  const selectedArticle = ref<ReceiptNoteItem>({
    id: '',
    title: '',
    description: '',
    quantity: 1,
    unitPrice: 0,
    discount: { value: 0, type: '%' },
    taxes: [{ hashed_id: '', title: '', rate: 0 }],
    price: 0
  });

  const Items = ref<string[]>([]);
  const availableArticles = ref<ReceiptNoteItem[]>([]);
  const currentPage = ref(1);
  const articlesPerPage = 5;
  const searchQuery = ref('');
  const fileInputRef = ref<HTMLInputElement | null>(null);
  const providers = ref<Provider[]>([]);
  const selectedProvider = ref<Provider | null>(null);
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

  const categories = ref<any[]>([]);
  const ReceiptId = route.params.id as string;
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
    }
  };
  
  const handleFileChange = (event: Event) => {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      ReceiptForm.attachments = Array.from(input.files);
    }
  };

  const getFileDisplayText = () => {
    if (!ReceiptForm.attachments || ReceiptForm.attachments.length === 0) {
      return "No file chosen";
    } else if (ReceiptForm.attachments.length === 1) {
      return ReceiptForm.attachments[0].name;
    } else {
      return `${ReceiptForm.attachments.length} files selected`;
    }
  };

  const calculateSubtotal = () => {
    if (!ReceiptForm.items || ReceiptForm.items.length === 0) {
      return 0;
    }
    const subtotal = ReceiptForm.items.reduce((sum, item) => {
      const itemTotal = calculateArticlePrice(item);
      return sum + itemTotal;
    }, 0);
    ReceiptForm.totals.subtotal = subtotal.toFixed(3);
    return subtotal;
  };

  const calculateTaxes = (): number => {
    if (!ReceiptForm?.AdditionalEntries) {
      return 0;
    }
    const totalTax = (Object.keys(taxValues.value) as Array<keyof typeof taxValues.value>)
      .reduce((sum, key) => {
        const isEnabled = ReceiptForm.AdditionalEntries[key] === 1;
        const taxAmount = taxValues.value[key] || 0;
        return sum + (isEnabled ? taxAmount : 0);
      }, 0);
    ReceiptForm.totals.taxes = totalTax.toFixed(3);
    return totalTax;
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const discount = parseFloat(ReceiptForm.totals.discount) || 0;
    const taxes = calculateTaxes();
    const total = Math.max(0, subtotal - discount + taxes);
    ReceiptForm.totals.taxes = taxes.toFixed(3);
    ReceiptForm.totals.total = total.toFixed(3);
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

  const addArticleForm = () => {
    const newItemForm: ReceiptNoteItem = {
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
    if (ReceiptForm.items.length > 1) {
      ReceiptForm.items = ReceiptForm.items.filter(item => item.id !== articleId);
    }
  };

  const openArticleDetailsModal = (articleParam: any) => {
    let article;
    if (typeof articleParam === 'object') {
      article = articleParam;
    } else {
      article = ReceiptForm.items.find(item => item.id === articleParam);
    }
    
    if (article) {
      selectedArticle.value = { 
        id: article.id || '',
        title: article.title || '',
        description: article.description || '',
        quantity: article.quantity || 0,
        unitPrice: article.unitPrice || 0,
        discount: article.discount || { value: 0, type: '%' },
        taxes: article.taxes || [],
        price: 0
      };
      selectedArticle.value.price = calculateArticlePrice(selectedArticle.value);
      if (!article.title) {
        isNewItemPopoverOpen.value = true;
      }
      isNewItem.value = false;
      isArticleDetailsModalOpen.value = true;
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
        discount: { value: 0, type: '%' },
        taxes: [],
        price: 0
      };
    }, 100);
  };

  const calculateArticlePrice = (article: ReceiptNoteItem): number => {
    const quantity = Number(article.quantity || 0);
    const unitPrice = Number(article.unitPrice || 0);
    const basePrice = quantity * unitPrice;
    let discountedPrice = basePrice;
    const discount = article.discount || { value: 0, type: '%' };

    if (discount.type === '0.0') {
      discountedPrice = Math.max(0, basePrice - discount.value);
    } else {
      discountedPrice = basePrice * (1 - (discount.value / 100));
    }
    
    return parseFloat(discountedPrice.toFixed(2));
  };

  const getTaxAmount = (article: ReceiptNoteItem, tax: { rate: number }): number => {
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
    }
  };

  const addTax = (articleId: string) => {
    const article = selectedArticle.value?.id === articleId
      ? selectedArticle.value
      : ReceiptForm.items.find(a => a.id === articleId);

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
      : ReceiptForm.items.find(a => a.id === articleId);
  
    if (!article || !article.taxes) return;
  
    if (article.taxes.length <= 1) {
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
      const itemIndex = ReceiptForm.items.findIndex(
        item => item.id === selectedArticle.value.id
      );
  
      if (itemIndex !== -1) {
        ReceiptForm.items[itemIndex] = itemCopy;
      } else {
        ReceiptForm.items.push(itemCopy);
      }
      closeArticleDetailsModal();
    }
  };

  const validateReceiptNoteForm = (): boolean => {
    if (ReceiptForm.items.length === 0) {
      console.error('At least one article is required');
      return false;
    }
    if (!ReceiptForm.provider_id) {
      console.error('Provider is required');
      return false;
    }
    return true;
  };

  const validateAndSubmit = async () => {
    if (validateReceiptNoteForm()) {
      isLoading.value = true;
      try {
        const receiptId = route.params.idreceipt as string;
        const updatedReceipt = await updateReceiptNote(receiptId, ReceiptForm);
        
        if (updatedReceipt.success) {
          await showToast('Bon de réception mis à jour avec succès');
          console.log("Receipt updated successfully:", updatedReceipt);
        } else {
          await showToast(updatedReceipt.message || 'Échec de la mise à jour');
        }
      } catch (error) {
        console.error("Failed to update receipt:", error);
        await showToast('Erreur lors de la mise à jour');
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
      const newItem: ReceiptNoteItem = {
        id: item.id,
        title: item.title || '',
        description: item.description || '',
        quantity: 1,
        unitPrice: item.unitPrice || 0,
        discount: { value: 0, type: '%' },
        taxes: item.taxes || [{ hashed_id: '', title: '', rate: 0 }],
        price: item.unitPrice || 0,
      };
      ReceiptForm.items.push(newItem);
      item.quantity -= 1;
    }
    Items.value = [];
    isArticleModalOpen.value = false;
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
    isNewItemModalOpen.value = false;
  };

  const addNewItem = async () => {
    try {
      const priceListResponse = await getPriceList();
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
      console.log('Item created:', createdItem);
      closeNewItemModal();
    } catch (error) {
      console.error('Error creating item:', error);
    }
  };

  const onProviderSelected = (selectedValue: string) => {
    const provider = providers.value.find(p => p.hashed_id === selectedValue);
    selectedProvider.value = provider || null;
    selectedCurrency.value = provider?.currency || null;
    
    if (provider?.billing) {
      if (typeof provider.billing === 'string') {
        try {
          billingAddress.value = JSON.parse(provider.billing) as Address;
          deliveryAddress.value = JSON.parse(provider.receipt) as Address;
        } catch (e) {
          console.warn('Failed to parse billing address:', e);
          billingAddress.value = null;
          deliveryAddress.value = null;
        }
      } else {
        billingAddress.value = provider.billing;
        deliveryAddress.value = provider.billing;
      }
    } else {
      billingAddress.value = null;
      deliveryAddress.value = null;
    }
  };const fetchReceiptNotes = async () => {
  try {
    const receiptId = route.params.idreceipt as string; 
    if (!receiptId) {
      throw new Error('Receipt ID is missing');
    }
    
    const response = await getReceiptNoteDetails(receiptId);
    

    if (!response?.data?.receipt) { 
      throw new Error('Invalid API response structure - missing receipt data');
    }
    
    const receipt = response.data.receipt; // Correction de la casse (Receipt -> receipt)
    const provider = receipt.contact || {}; // Meilleur nom pour la variable
    
    
    // Mise à jour du formulaire avec les données
    ReceiptForm.date = receipt.date?.split('T')[0] || new Date().toISOString().split('T')[0];
    ReceiptForm.receipt_number = receipt.receipt_number || ''; // Correction du champ (delivery_number -> receipt_number)
    ReceiptForm.provider_id = receipt.hashed_contact_id || provider.hashed_id || ''; // Correction client_id -> provider_id
    ReceiptForm.referenceNumber = receipt.reference_number || '';
    ReceiptForm.object = receipt.object || '';
    ReceiptForm.category = receipt.hashed_expense_category_id || ''; // Correction invoice_category_id -> expense_category_id
    ReceiptForm.generalTerms = receipt.conditions || '';
    ReceiptForm.watermark = receipt.watermark || '';
    ReceiptForm.remarks = receipt.notes || '';
    ReceiptForm.tax_type = receipt.tax_type || 1;
    ReceiptForm.currency_rate = receipt.currency_rate || 1;
    ReceiptForm.language = receipt.language || 'fr';
    
    // Gestion des totaux (qui peut être une string JSON)
    if (typeof receipt.totals === 'string') {
      try {
        ReceiptForm.totals = JSON.parse(receipt.totals);
      } catch (e) {
        console.error('Failed to parse totals:', e);
        ReceiptForm.totals = {
          discount: '0',
          total: '0',
          taxes: '0',
          subtotal: '0'
        };
      }
    } else {
      ReceiptForm.totals = receipt.totals || {
        discount: '0',
        total: '0',
        taxes: '0',
        subtotal: '0'
      };
    }
    
    // Gestion des paramètres d'affichage
    const display = typeof receipt.display === 'string' 
        ? JSON.parse(receipt.display) 
        : receipt.display || {};
    
    
    // Mappage des paramètres d'affichage
    ReceiptForm.show_billing = display.billing ? 1 : 0;
    ReceiptForm.showArticleUnit = display.unity ? 1 : 0;
    ReceiptForm.show_delivery = display.delivery ? 1 : 0; // Correction receipt -> delivery
    ReceiptForm.show_conditions = display.conditions ? 1 : 0;
    ReceiptForm.show_stamp = display.stamp ? 1 : 0;
    ReceiptForm.show_description = display.description ? 1 : 0;
    ReceiptForm.show_bank = display.bank ? 1 : 0;
    ReceiptForm.selected_bank = display.selected_bank || '';
    ReceiptForm.show_pictures = display.pictures ? 1 : 0;
    ReceiptForm.showArticleTTCPrices = display.ttc ? 1 : 0;
    
    // Gestion des articles
    ReceiptForm.items = (receipt.items || []).map((item: any) => ({
      id: item.hashed_id || Date.now().toString(),
      title: item.item?.title || item.temporary_item || 'Nouvel article',
      description: item.description || '',
      quantity: item.quantity || 1,
      unitPrice: parseFloat(item.rate) || 0,
      discount: {
        value: parseFloat(item.discount_rate) || 0,
        type: item.discount_type === 1 ? '%' : '0.0'
      },
      taxes: (item.taxes || []).map((tax: any) => ({
        hashed_id: tax.hashed_id || '',
        title: tax.title || 'Taxe',
        rate: parseFloat(tax.rate) || 0
      })),
      price: parseFloat(item.rate) * (item.quantity || 0) || 0
    }));
    
    // Calcul des totaux
    calculateTotal();
    
  } catch (err) {
    console.error('Error fetching receipt note details:', {
      error: err,
      routeId: route.params.idreceipt, // Correction idbons -> id
      timestamp: new Date().toISOString()
    });
    
    // Réinitialisation du formulaire en cas d'erreur
    
    error.value = 'Failed to load receipt note details';
    await showToast('Failed to load receipt details. Please try again.');
    throw err;
  }
};
  onMounted(async () => {
    try {
      providers.value = await getProvidersList();
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

      const category = await fetchCategoriesList();
      categories.value = category.categories;

      const bankResponse = await fetchBanks();
      banks.value = bankResponse.banks.data;

      const { companyId } = await fetchCurrentCompany();
      const companyData = await apiService.getCompanyData(companyId);
      companyName.value = companyData.data.company.title;

      const tax = await fetchTaxes();
      const taxList = tax?.data?.data?.taxes?.data ?? [];
      taxes.value = taxList;

      await fetchReceiptNotes();
    } catch (error) {
      console.error('Error in component initialization:', error);
      error.value = 'Failed to initialize component data';
      await showToast('Failed to load data. Please try again.');
    }
  });

  return {
    ReceiptForm,
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
    providers,
    isNewItem,
    newItemForm,
    sellingRate,
    buyingRate,
    fileInputRef,
    categories,
    selectedCurrency,
    selectedProvider,
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
    onProviderSelected,
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
    fetchReceiptNotes,
    validateReceiptNoteForm
  };
}
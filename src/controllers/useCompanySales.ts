import { ref, computed } from 'vue';
import { getCompanySales, type SalesData } from '@/services/CompanySalesService';

export default function useCompanySales() {
  const salesData = ref<SalesData | null>(null);
  const loading = ref(true);
  const error = ref<string | null>(null);

  const fetchData = async (fromDate?: string, toDate?: string) => {
    try {
      loading.value = true;
      error.value = null;
      salesData.value = await getCompanySales(fromDate, toDate);
    } catch (err: any) {
      error.value = err.message;
      salesData.value = null;
    } finally {
      loading.value = false;
    }
  };

  // Totaux calculés
  const totalEstimates = computed(() => {
    return salesData.value?.estimatesConvertedSum.reduce((a, b) => a + b, 0) || 0;
  });

  const totalDeliveries = computed(() => {
    return salesData.value?.deliveriesConvertedSum.reduce((a, b) => a + b, 0) || 0;
  });

  const totalIncomes = computed(() => {
    return salesData.value?.incomesConvertedSum.reduce((a, b) => a + b, 0) || 0;
  });

  const totalInvoices = computed(() => {
    return salesData.value?.invoicesConvertedSum.reduce((a, b) => a + b, 0) || 0;
  });

  return { 
    salesData, 
    loading, 
    error,
    totalEstimates,
    totalDeliveries,
    totalIncomes,
    totalInvoices,
    fetchData 
  };
}
import { ref, computed } from 'vue';
import { getCompanyResults, type ResultsData } from '@/services/CompanyResultsService';

export default function useCompanyResults() {
  const data = ref<ResultsData | null>(null);
  const loading = ref(true);
  const error = ref<string | null>(null);

  const monthlyResults = computed(() => {
    if (!data.value) return [];
    return data.value.invoicesConvertedSum.map((invoice, index) => {
      const expense = data.value?.expensesConvertedSum[index] || 0;
      return invoice - expense;
    });
  });

  const totalResults = computed(() => {
    return monthlyResults.value.reduce((a, b) => a + b, 0);
  });

  const totalInvoices = computed(() => {
    return data.value?.invoicesConvertedSum.reduce((a, b) => a + b, 0) || 0;
  });

  const totalExpenses = computed(() => {
    return data.value?.expensesConvertedSum.reduce((a, b) => a + b, 0) || 0;
  });

  const fetchData = async (fromDate?: string, toDate?: string) => {
    try {
      loading.value = true;
      error.value = null;
      data.value = await getCompanyResults(fromDate, toDate);
    } catch (err: any) {
      error.value = err.message;
      data.value = null;
    } finally {
      loading.value = false;
    }
  };

  return { 
    data, 
    loading, 
    error,
    monthlyResults,
    totalResults,
    totalInvoices,
    totalExpenses,
    fetchData 
  };
}

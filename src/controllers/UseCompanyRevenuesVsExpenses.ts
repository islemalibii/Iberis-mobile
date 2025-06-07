import { ref, computed } from 'vue';
import { getCompanyRevenuesVsExpenses, type RevenuesVsExpensesData } from '@/services/CompanyRevenuesVsExpensesService';

export default function useCompanyRevenuesVsExpenses() {
  const data = ref<RevenuesVsExpensesData | null>(null);
  const loading = ref(true);
  const error = ref<string | null>(null);

  const totalIncomes = computed(() => {
    return data.value?.incomesConvertedSum.reduce((a, b) => a + b, 0) || 0;
  });

  const totalOutcomes = computed(() => {
    return data.value?.outcomesConvertedSum.reduce((a, b) => a + b, 0) || 0;
  });

  const balance = computed(() => {
    return totalIncomes.value - totalOutcomes.value;
  });

  const fetchData = async (fromDate?: string, toDate?: string) => {
    try {
      loading.value = true;
      error.value = null;
      data.value = await getCompanyRevenuesVsExpenses(fromDate, toDate);
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
    totalIncomes,
    totalOutcomes,
    balance,
    fetchData 
  };
}
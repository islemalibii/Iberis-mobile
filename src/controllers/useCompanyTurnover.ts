import { ref, computed } from 'vue';
import { getCompanyTurnover, type TurnoverData } from '@/services/CompanyTurnoverService';

const createEmptyChartData = () => ({
  currentExerciseYear: '',
  lastExerciseYear: '',
  organisedMonths: [],
  currentExerciseInvoices: [],
  lastExerciseInvoices: [],
  extraData: {
    notFormatted: 0,
    currencySymbol: ''
  }
});

export default function useCompanyTurnover() {
  const turnoverData = ref<TurnoverData>(createEmptyChartData());
  const loading = ref(false);
  const error = ref<string | null>(null);

  const growthRate = computed(() => {
    const current = currentYearTotal.value;
    const last = previousYearTotal.value;
    if (last === 0) return current > 0 ? 100 : 0;
    return ((current - last) / last) * 100;
  });

  const currentYearTotal = computed(() => {
    return turnoverData.value.currentExerciseInvoices.reduce((a, b) => a + b, 0);
  });

  const previousYearTotal = computed(() => {
    return turnoverData.value.lastExerciseInvoices.reduce((a, b) => a + b, 0);
  });

  const formatAmount = (amount: number) => {
    return amount.toFixed(3).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  };

  const fetchData = async (fromDate?: string, toDate?: string) => {
    try {
      loading.value = true;
      error.value = null;
      
      const data = await getCompanyTurnover(fromDate, toDate);
      turnoverData.value = data;
    } catch (err: any) {
      error.value = err.message;
      turnoverData.value = createEmptyChartData();
    } finally {
      loading.value = false;
    }
  };

  return { 
    turnoverData, 
    loading, 
    error,
    growthRate,
    currentYearTotal,
    previousYearTotal,
    formatAmount,
    fetchData 
  };
}
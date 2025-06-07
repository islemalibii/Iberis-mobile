import { ref, computed } from 'vue';
import { getCompanyTurnover, type TurnoverData } from '@/services/CompanyTurnoverService';

export default function useCompanyTurnover() {
  const turnoverData = ref<TurnoverData | null>(null);
  const loading = ref(true);
  const error = ref<string | null>(null);

  const growthRate = computed(() => {
    if (!turnoverData.value) return 0;

    const current = turnoverData.value.currentExerciseInvoices.reduce((a, b) => a + b, 0);
    const last = turnoverData.value.lastExerciseInvoices.reduce((a, b) => a + b, 0);

    if (last === 0) return current > 0 ? 100 : 0;

    return ((current - last) / last) * 100;
  });

  const fetchData = async (fromDate?: string, toDate?: string) => {
    try {
      loading.value = true;
      error.value = null;
      turnoverData.value = await getCompanyTurnover(fromDate, toDate);
    } catch (err: any) {
      error.value = err.message;
      turnoverData.value = null;
    } finally {
      loading.value = false;
    }
  };

  return { 
    turnoverData, 
    loading, 
    error, 
    growthRate,
    fetchData 
  };
}
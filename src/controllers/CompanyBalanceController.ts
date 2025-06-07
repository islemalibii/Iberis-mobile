import { ref } from 'vue';
import { getCompanyBalance, type CompanyBalanceData } from '@/services/CompanyBalanceService';

export default function useCompanyBalance() {
  const balanceData = ref<CompanyBalanceData | null>(null);
  const loading = ref(true);
  const error = ref<string | null>(null);

  const fetchData = async (toDate?: string) => {
    try {
      loading.value = true;
      error.value = null;
      balanceData.value = await getCompanyBalance(toDate);
    } catch (err: any) {
      error.value = err.message;
    } finally {
      loading.value = false;
    }
  };

  return { balanceData, loading, error, fetchData };
}
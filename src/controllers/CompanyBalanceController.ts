import { ref, computed } from 'vue';
import { getCompanyBalance, type CompanyBalanceData } from '@/services/CompanyBalanceService';

export default function useCompanyBalance() {
  const balanceData = ref<CompanyBalanceData | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);

  const fetchData = async (fromDate?: string, toDate?: string) => {
    try {
      loading.value = true;
      error.value = null;
      
      if (fromDate && toDate) {
        console.log('Récupération du solde pour la période spécifiée:', fromDate, 'à', toDate);
      } else if (toDate) {
        console.log('Récupération du solde jusqu\'à la date:', toDate);
      } else {
        console.log('Récupération du solde avec la période comptable par défaut');
      }
      
      // Validation des dates
      if (fromDate || toDate) {
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (fromDate && !dateRegex.test(fromDate)) {
          throw new Error('Format de date invalide pour fromDate. Utilisez YYYY-MM-DD');
        }
        if (toDate && !dateRegex.test(toDate)) {
          throw new Error('Format de date invalide pour toDate. Utilisez YYYY-MM-DD');
        }
        
        if (fromDate && toDate && new Date(fromDate) > new Date(toDate)) {
          throw new Error('La date de début doit être antérieure à la date de fin');
        }
      }
      
      const data = await getCompanyBalance(fromDate, toDate);
      balanceData.value = data;
      
      console.log('Données de solde récupérées:', data);
    } catch (err: any) {
      console.error('Erreur lors de la récupération du solde:', err);
      error.value = err.message || 'Erreur de chargement des données';
      
      // En cas d'erreur, créer des données vides pour éviter les erreurs d'affichage
      balanceData.value = {
        integer: '0',
        strings: '0.000',
        extraData: {
          currencySymbol: ''
        }
      };
    } finally {
      loading.value = false;
    }
  };

  const fetchDefaultData = async () => {
    console.log('Chargement du solde avec la période comptable par défaut');
    await fetchData();
  };

  const fetchDataWithEndDate = async (endDate: string) => {
    console.log('Chargement du solde jusqu\'à la date:', endDate);
    await fetchData(undefined, endDate);
  };

  const currencySymbol = computed(() => {
    return balanceData.value?.extraData?.currencySymbol || 'TND';
  });

  // Vérifier s'il y a des données réelles (pas seulement des zéros)
  const hasRealData = computed(() => {
    if (!balanceData.value) return false;
    
    const numericValue = parseFloat(balanceData.value.strings.replace(/\s/g, ''));
    const integerValue = parseInt(balanceData.value.integer);
    
    return numericValue > 0 || integerValue > 0;
  });

  // Formatage des montants pour l'affichage
  const formatAmount = (amount: number) => {
    return amount.toFixed(3).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  };

  // Calculer la valeur numérique totale du solde
  const totalBalance = computed(() => {
    if (!balanceData.value) return 0;
    
    const mainAmount = parseFloat(balanceData.value.strings.replace(/\s/g, '')) || 0;
    const decimals = parseInt(balanceData.value.integer) || 0;
    
    return mainAmount + (decimals / 1000);
  });

  // Déterminer si le solde est positif, négatif ou nul
  const balanceStatus = computed(() => {
    const balance = totalBalance.value;
    if (balance > 0) return 'positive';
    if (balance < 0) return 'negative';
    return 'neutral';
  });

  return { 
    balanceData,
    loading, 
    error,
    currencySymbol,
    hasRealData,
    totalBalance,
    balanceStatus,
    formatAmount,
    fetchData,
    fetchDefaultData,
    fetchDataWithEndDate
  };
}
import { ref, computed } from 'vue';
import { getCompanyResults, type ResultsData } from '@/services/CompanyResultsService';

export default function useCompanyResults() {
  const data = ref<ResultsData | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);

  const fetchData = async (fromDate?: string, toDate?: string) => {
    try {
      loading.value = true;
      error.value = null;
      
      if (fromDate && toDate) {
        console.log('Récupération des résultats pour la période spécifiée:', fromDate, 'à', toDate);
      } else if (fromDate) {
        console.log('Récupération des résultats depuis la date:', fromDate);
      } else {
        console.log('Récupération des résultats avec la période comptable par défaut');
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
      
      const resultData = await getCompanyResults(fromDate, toDate);
      data.value = resultData;
      
      console.log('Données de résultats récupérées:', resultData);
    } catch (err: any) {
      console.error('Erreur lors de la récupération des résultats:', err);
      error.value = err.message || 'Erreur de chargement des données';
      
      // En cas d'erreur, créer des données vides pour éviter les erreurs d'affichage
      data.value = {
        currentExerciseYear: new Date().getFullYear().toString(),
        organisedMonths: [],
        expensesConvertedSum: [],
        invoicesConvertedSum: [],
        extraData: {
          notFormatted: 0,
          strings: '0.000',
          integer: '0',
          currencySymbol: ''
        }
      };
    } finally {
      loading.value = false;
    }
  };

  const fetchDefaultData = async () => {
    console.log('Chargement des résultats avec la période comptable par défaut');
    await fetchData();
  };

  const fetchDataWithPeriod = async (startDate: string, endDate: string) => {
    console.log('Chargement des résultats pour la période:', startDate, 'à', endDate);
    await fetchData(startDate, endDate);
  };

  const monthlyResults = computed(() => {
    if (!data.value || !data.value.invoicesConvertedSum || !data.value.expensesConvertedSum) {
      return [];
    }
    
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

  const currencySymbol = computed(() => {
    return data.value?.extraData?.currencySymbol || 'TND';
  });

  // Vérifier s'il y a des données réelles (pas seulement des zéros)
  const hasRealData = computed(() => {
    if (!data.value) return false;
    
    const hasInvoices = data.value.invoicesConvertedSum.some(amount => amount > 0);
    const hasExpenses = data.value.expensesConvertedSum.some(amount => amount > 0);
    
    return hasInvoices || hasExpenses;
  });

  // Formatage des montants pour l'affichage
  const formatAmount = (amount: number) => {
    return amount.toFixed(3).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  };

  // Déterminer le statut des résultats (positif, négatif, neutre)
  const resultsStatus = computed(() => {
    const total = totalResults.value;
    if (total > 0) return 'positive';
    if (total < 0) return 'negative';
    return 'neutral';
  });

  // Obtenir les mois organisés avec fallback
  const organisedMonths = computed(() => {
    return data.value?.organisedMonths || [];
  });

  // Année d'exercice actuelle
  const currentExerciseYear = computed(() => {
    return data.value?.currentExerciseYear || new Date().getFullYear().toString();
  });

  return { 
    data, 
    loading, 
    error,
    monthlyResults,
    totalResults,
    totalInvoices,
    totalExpenses,
    currencySymbol,
    hasRealData,
    resultsStatus,
    organisedMonths,
    currentExerciseYear,
    formatAmount,
    fetchData,
    fetchDefaultData,
    fetchDataWithPeriod
  };
}
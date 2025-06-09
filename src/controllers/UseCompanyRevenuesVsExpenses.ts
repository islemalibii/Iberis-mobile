import { ref, computed } from 'vue';
import {
  getCompanyRevenuesVsExpenses,
  getCompanyRevenuesVsExpensesWithCompanyDates,
  type RevenuesVsExpensesData
} from '@/services/CompanyRevenuesVsExpensesService';

export default function useCompanyRevenuesVsExpenses() {
  const data = ref<RevenuesVsExpensesData | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);

  // Charge les données avec des dates spécifiques
  const fetchData = async (fromDate?: string, toDate?: string) => {
    try {
      loading.value = true;
      error.value = null; // Reset error state
      
      if (fromDate && toDate) {
        console.log('Récupération des revenus vs dépenses pour la période:', fromDate, 'à', toDate);
      } else if (fromDate || toDate) {
        console.log('Récupération des revenus vs dépenses avec date spécifiée');
      } else {
        console.log('Récupération des revenus vs dépenses avec la période comptable par défaut');
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

      const result = await getCompanyRevenuesVsExpenses(fromDate, toDate);
      data.value = result;
      
      console.log('Données de revenus vs dépenses récupérées:', result);
    } catch (err: any) {
      console.error('Erreur lors de la récupération des revenus vs dépenses:', err);
      error.value = err.message || 'Erreur lors du chargement des données';
      
      // En cas d'erreur, créer des données vides pour éviter les erreurs d'affichage
      data.value = {
        currentExerciseYear: new Date().getFullYear().toString(),
        organisedMonths: [],
        incomesConvertedSum: [],
        outcomesConvertedSum: [],
        extraData: {
          currencySymbol: 'TND',
          incomes: { strings: '0.000', integer: '0' },
          outcomes: { strings: '0.000', integer: '0' }
        }
      };
    } finally {
      loading.value = false;
    }
  };

  // Charge les données avec les dates comptables de l'entreprise
  const fetchDataWithCompanyDates = async (company: { accounting_period_id: number }) => {
    try {
      loading.value = true;
      error.value = null; // Reset error state
      console.log('Récupération des revenus vs dépenses avec les dates comptables de l\'entreprise');
      
      const result = await getCompanyRevenuesVsExpensesWithCompanyDates(company);
      data.value = result;
      
      console.log('Données récupérées avec les dates comptables:', result);
    } catch (err: any) {
      console.error('Erreur lors de la récupération avec les dates comptables:', err);
      error.value = err.message || 'Erreur lors du chargement des données';
      
      // En cas d'erreur, créer des données vides
      data.value = {
        currentExerciseYear: new Date().getFullYear().toString(),
        organisedMonths: [],
        incomesConvertedSum: [],
        outcomesConvertedSum: [],
        extraData: {
          currencySymbol: 'TND',
          incomes: { strings: '0.000', integer: '0' },
          outcomes: { strings: '0.000', integer: '0' }
        }
      };
    } finally {
      loading.value = false;
    }
  };

  // Charge les données par défaut (dates comptables ou année courante)
  const fetchDefaultData = async () => {
    console.log('Chargement des revenus vs dépenses avec la période comptable par défaut');
    await fetchData();
  };

  // Fonction pour réinitialiser l'état d'erreur
  const clearError = () => {
    error.value = null;
  };

  // Calcul des totaux
  const totalIncomes = computed(() => {
    return data.value?.incomesConvertedSum.reduce((a, b) => a + b, 0) || 0;
  });

  const totalOutcomes = computed(() => {
    return data.value?.outcomesConvertedSum.reduce((a, b) => a + b, 0) || 0;
  });

  const balance = computed(() => {
    return totalIncomes.value - totalOutcomes.value;
  });

  // Vérifie si des données réelles sont disponibles (pas seulement des zéros)
  const hasData = computed(() => {
    if (!data.value || !data.value.organisedMonths || data.value.organisedMonths.length === 0) {
      return false;
    }
    
    // Vérifier s'il y a des revenus ou des dépenses non nulles
    const hasIncomes = data.value.incomesConvertedSum.some(v => v > 0);
    const hasOutcomes = data.value.outcomesConvertedSum.some(v => v > 0);
    
    return hasIncomes || hasOutcomes;
  });

  // Vérifier s'il y a des données réelles (pas seulement des zéros)
  const hasRealData = computed(() => {
    if (!data.value) return false;
    
    const totalIncome = totalIncomes.value;
    const totalOutcome = totalOutcomes.value;
    
    return totalIncome > 0 || totalOutcome > 0;
  });

  // Formate les montants pour l'affichage
  const formatAmount = (amount: number) => {
    return amount.toFixed(3).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  };

  // Récupère le symbole de la devise
  const currencySymbol = computed(() => {
    return data.value?.extraData?.currencySymbol || 'TND';
  });

  // Récupère l'année de l'exercice
  const currentExerciseYear = computed(() => {
    return data.value?.currentExerciseYear || new Date().getFullYear().toString();
  });

  return {
    data,
    loading,
    error,
    totalIncomes,
    totalOutcomes,
    balance,
    hasData,
    hasRealData,
    currencySymbol,
    currentExerciseYear,
    formatAmount,
    fetchData,
    fetchDataWithCompanyDates,
    fetchDefaultData,
    clearError
  };
}
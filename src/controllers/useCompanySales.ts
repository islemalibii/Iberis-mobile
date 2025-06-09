import { ref, computed } from 'vue';
import { getCompanySales, type SalesData } from '@/services/CompanySalesService';

// Couleurs pour les différents types de ventes
const SALES_COLORS = {
  estimates: '#FFA500',
  deliveries: '#37BC9B',
  invoices: '#E9573F',
  incomes: '#4A89DC'
};

export default function useCompanySales() {
  const salesData = ref<SalesData | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);

  const processChartData = (data: SalesData) => {
    // Même s'il n'y a pas de données, on traite la structure
    if (!data || !data.organisedMonths || data.organisedMonths.length === 0) {
      return {
        labels: ['Aucune donnée'],
        datasets: [{
          label: 'Aucune donnée',
          data: [0],
          backgroundColor: '#e0e0e0',
          borderColor: '#cccccc',
          borderWidth: 1
        }],
        totals: {
          estimates: 0,
          deliveries: 0,
          invoices: 0,
          incomes: 0
        }
      };
    }

    // Formatage des mois (3 premières lettres en minuscules)
    const months = data.organisedMonths.map(month => 
      month.substring(0, 3).toLowerCase()
    );

    // S'assurer que tous les tableaux ont la même longueur
    const estimates = data.estimatesConvertedSum || new Array(months.length).fill(0);
    const deliveries = data.deliveriesConvertedSum || new Array(months.length).fill(0);
    const invoices = data.invoicesConvertedSum || new Array(months.length).fill(0);
    const incomes = data.incomesConvertedSum || new Array(months.length).fill(0);

    return {
      labels: months,
      datasets: [
        {
          label: 'Devis',
          data: estimates,
          backgroundColor: SALES_COLORS.estimates + '80', // Ajout de transparence
          borderColor: SALES_COLORS.estimates,
          borderWidth: 2,
          tension: 0.4,
          borderRadius: 4 // Pour les barres arrondies
        },
        {
          label: 'Livraisons',
          data: deliveries,
          backgroundColor: SALES_COLORS.deliveries + '80',
          borderColor: SALES_COLORS.deliveries,
          borderWidth: 2,
          tension: 0.4,
          borderRadius: 4
        },
        {
          label: 'Factures',
          data: invoices,
          backgroundColor: SALES_COLORS.invoices + '80',
          borderColor: SALES_COLORS.invoices,
          borderWidth: 2,
          tension: 0.4,
          borderRadius: 4
        }
      ],
      totals: {
        estimates: estimates.reduce((a, b) => a + b, 0),
        deliveries: deliveries.reduce((a, b) => a + b, 0),
        invoices: invoices.reduce((a, b) => a + b, 0),
        incomes: incomes.reduce((a, b) => a + b, 0)
      }
    };
  };

  const fetchData = async (fromDate?: string, toDate?: string) => {
    try {
      loading.value = true;
      error.value = null;
      
      if (fromDate && toDate) {
        console.log('Récupération des données de ventes pour la période spécifiée:', fromDate, 'à', toDate);
      } else {
        console.log('Récupération des données de ventes avec la période comptable par défaut');
      }
      
      // Validation des dates
      if (fromDate && toDate) {
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (!dateRegex.test(fromDate) || !dateRegex.test(toDate)) {
          throw new Error('Format de date invalide. Utilisez YYYY-MM-DD');
        }
        
        if (new Date(fromDate) > new Date(toDate)) {
          throw new Error('La date de début doit être antérieure à la date de fin');
        }
      }
      
      const data = await getCompanySales(fromDate, toDate);
      salesData.value = data;
      
      console.log('Données de ventes récupérées:', data);
    } catch (err: any) {
      console.error('Erreur lors de la récupération des données de vente:', err);
      error.value = err.message || 'Erreur de chargement des données';
      
      // En cas d'erreur, créer des données vides pour éviter les erreurs d'affichage
      salesData.value = {
        currentExerciseYear: new Date().getFullYear().toString(),
        organisedMonths: ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 
                         'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'],
        estimatesConvertedSum: new Array(12).fill(0),
        deliveriesConvertedSum: new Array(12).fill(0),
        incomesConvertedSum: new Array(12).fill(0),
        invoicesConvertedSum: new Array(12).fill(0),
        extraData: {
          currencySymbol: 'TND',
          estimates: { strings: '0.000', integer: '0' },
          incomes: { strings: '0.000', integer: '0' },
          invoices: { strings: '0.000', integer: '0' },
          deliveries: { strings: '0.000', integer: '0' }
        }
      };
    } finally {
      loading.value = false;
    }
  };

  const fetchDefaultData = async () => {
    console.log('Chargement des données avec la période comptable par défaut');
    await fetchData();
  };

  const chartData = computed(() => {
    return salesData.value ? processChartData(salesData.value) : {
      labels: [],
      datasets: [],
      totals: {
        estimates: 0,
        deliveries: 0,
        invoices: 0,
        incomes: 0
      }
    };
  });

  const currencySymbol = computed(() => {
    return salesData.value?.extraData?.currencySymbol || 'TND';
  });

  const currentYear = computed(() => {
    return salesData.value?.currentExerciseYear || new Date().getFullYear().toString();
  });

  // Vérifier s'il y a des données réelles (pas seulement des zéros)
  const hasRealData = computed(() => {
    if (!salesData.value) return false;
    
    const totals = chartData.value.totals;
    return totals.estimates > 0 || totals.deliveries > 0 || totals.invoices > 0 || totals.incomes > 0;
  });

  // Formatage des montants pour l'affichage
  const formatAmount = (amount: number) => {
    return amount.toFixed(3).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  };

  return { 
    salesData,
    chartData,
    loading, 
    error,
    currencySymbol,
    currentYear,
    hasRealData,
    formatAmount,
    fetchData,
    fetchDefaultData,
    SALES_COLORS // Export pour utilisation dans le template
  };
}
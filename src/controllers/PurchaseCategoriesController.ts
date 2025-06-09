import { ref } from 'vue';
import { getPurchaseCategories, type PurchaseCategoriesData } from '@/services/PurshaseCategoriesService';

// Palette de couleurs pour les catégories
const CATEGORY_COLORS = ['#36a7ab', '#4bc078', '#FFCE56', '#FF6384', '#9966FF'];

export default function usePurchaseCategories() {
  const chartData = ref<any>(null);
  const loading = ref(true);
  const error = ref<string | null>(null);

  const processChartData = (data: PurchaseCategoriesData) => {
    // Vérifier si on a des données
    if (!data.topFiveExpenseCategories || Object.keys(data.topFiveExpenseCategories).length === 0) {
      return {
        labels: ['Aucune donnée'],
        datasets: [{
          data: [1],
          backgroundColor: ['#e0e0e0'],
          borderWidth: 0
        }],
        percentages: [100],
        total: '0.000 ',
        currency: ''
      };
    }

    // Convertir en tableau et trier par montant décroissant
    const categories = Object.entries(data.topFiveExpenseCategories)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5); // Prendre seulement les 5 premières

    const total = data.extraData.notFormatted;
    
    // Extraire les noms et valeurs
    const labels = categories.map(([name]) => name);
    const values = categories.map(([, value]) => value);
    const percentages = categories.map(([, value]) => 
      parseFloat(((value / total) * 100).toFixed(1))
    );

    // Assigner une couleur à chaque catégorie
    const backgroundColors = CATEGORY_COLORS.slice(0, categories.length);

    return {
      labels,
      datasets: [{
        data: values,
        backgroundColor: backgroundColors,
        borderWidth: 0
      }],
      percentages,
      total: data.extraData.strings,
      currency: data.extraData.currencySymbol
    };
  };

  const fetchData = async (fromDate?: string, toDate?: string) => {
    try {
      loading.value = true;
      error.value = null;
      
      // Log pour indiquer quelle période est utilisée
      if (fromDate && toDate) {
        console.log('Récupération des données d\'achats pour la période spécifiée:', fromDate, 'à', toDate);
      } else {
        console.log('Récupération des données d\'achats avec les dates par défaut (période comptable de l\'entreprise)');
      }
      
      // Validation des dates avant l'appel API (seulement si des dates sont fournies)
      if (fromDate && toDate) {
        // Vérifier le format des dates
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (!dateRegex.test(fromDate) || !dateRegex.test(toDate)) {
          throw new Error('Format de date invalide. Utilisez YYYY-MM-DD');
        }
        
        // Vérifier que la date de début est antérieure à la date de fin
        if (new Date(fromDate) > new Date(toDate)) {
          throw new Error('La date de début doit être antérieure à la date de fin');
        }
      }
      
      // Appel du service - il gérera automatiquement les dates par défaut si aucune n'est fournie
      const data = await getPurchaseCategories(fromDate, toDate);
      chartData.value = processChartData(data);
      
      console.log('Données traitées:', chartData.value);
    } catch (err: any) {
      console.error('Erreur lors de la récupération des données d\'achats:', err);
      error.value = err.message || 'Erreur de chargement des données';
      
      // Données par défaut en cas d'erreur
      chartData.value = {
        labels: ['Erreur de chargement'],
        datasets: [{
          data: [1],
          backgroundColor: ['#ff6b6b'],
          borderWidth: 0
        }],
        percentages: [100],
        total: '0.000 TND',
        currency: 'TND'
      };
    } finally {
      loading.value = false;
    }
  };

  // Nouvelle fonction pour charger les données avec les dates par défaut (période comptable)
  const fetchDefaultData = async () => {
    console.log('Chargement des données avec la période comptable par défaut');
    await fetchData(); // Pas de dates = utilisation de la période comptable
  };

  return { 
    chartData, 
    loading, 
    error, 
    fetchData,
    fetchDefaultData 
  };
}
<template>
  <ion-page>
    <ion-content class="ion-padding" style="--background: white">
      <div class="page-container">
        <div class="page-header">
          <h1 class="main-title">Statistiques des Ventes</h1>
          <p class="subtitle">{{ currentYear }}</p>
        </div>

        <!-- État de chargement -->
        <div v-if="loading" class="state-container">
          <ion-spinner name="crescent" class="custom-spinner"></ion-spinner>
          <p class="loading-text">Chargement des données...</p>
        </div>

        <!-- État d'erreur -->
        <div v-else-if="error" class="state-container error">
          <ion-icon :icon="alertCircleOutline" class="error-icon"></ion-icon>
          <p class="error-text">{{ error }}</p>
        </div>

        <!-- Affichage des données (même si ce sont des zéros) -->
        <template v-else>
          <!-- Message d'information si pas de données réelles -->
          <div v-if="!hasRealData" class="info-message">
            <ion-icon :icon="informationCircleOutline" color="medium"></ion-icon>
            <p>Aucune donnée de vente disponible pour cette période. Les graphiques affichent des valeurs nulles.</p>
          </div>

          <div class="stats-container">
            <div class="stat-card" v-for="stat in statsDisplay" :key="stat.title">
              <div class="stat-title">{{ stat.title }}</div>
              <div class="stat-value">{{ stat.value }}</div>
              <div class="stat-currency">{{ currencySymbol }}</div>
              <div class="stat-formatted">{{ stat.formatted }}</div>
            </div>
          </div>

          <div class="chart-container">
            <canvas ref="chartCanvas"></canvas>
          </div>

          <div class="legend-container">
            <div class="legend-item" v-for="dataset in chartData?.datasets" :key="dataset.label">
              <span class="legend-color" :style="{ backgroundColor: dataset.backgroundColor }"></span>
              <span>{{ dataset.label }}</span>
            </div>
          </div>
        </template>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { 
  IonPage, IonContent, IonSpinner, IonIcon 
} from '@ionic/vue';
import { ref, onMounted, watch, computed } from 'vue';
import { Chart, BarController, BarElement, LinearScale, CategoryScale, Tooltip, Legend } from 'chart.js';
import { alertCircleOutline, informationCircleOutline } from 'ionicons/icons';
import useCompanySales from '@/controllers/useCompanySales';

// Props reçus du dashboard (similaire aux purchase categories)
interface Props {
  period?: string;
  startDate?: Date;
  endDate?: Date;
}

const props = withDefaults(defineProps<Props>(), {
  period: 'thisYear',
  startDate: () => new Date(),
  endDate: () => new Date()
});

// Enregistrer les composants Chart.js
Chart.register(BarController, BarElement, LinearScale, CategoryScale, Tooltip, Legend);

const { 
  salesData,
  chartData,
  loading, 
  error,
  currencySymbol,
  currentYear,
  hasRealData,
  formatAmount,
  fetchData,
  fetchDefaultData 
} = useCompanySales();

const chartCanvas = ref<HTMLCanvasElement | null>(null);
let chartInstance: Chart | null = null;

// Fonction pour formater les dates en YYYY-MM-DD
const formatDate = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

// Fonction pour déterminer si on doit utiliser les dates par défaut ou les props
const shouldUseDefaultDates = (): boolean => {
  return !props.period || props.period === 'default' || props.period === 'thisYear';
};

// Fonction pour charger les données selon la configuration
const loadData = async () => {
  if (shouldUseDefaultDates()) {
    console.log('Utilisation de la période comptable par défaut');
    await fetchDefaultData();
  } else {
    console.log('Utilisation de la période spécifiée:', props.period);
    const fromDate = formatDate(props.startDate);
    const toDate = formatDate(props.endDate);
    await fetchData(fromDate, toDate);
  }
};

const statsDisplay = computed(() => {
  if (!chartData.value) {
    return [
      { title: 'Factures', value: 0, formatted: formatAmount(0) + ' ' + currencySymbol.value },
      { title: 'Devis', value: 0, formatted: formatAmount(0) + ' ' + currencySymbol.value },
      { title: 'Bons de livraison', value: 0, formatted: formatAmount(0) + ' ' + currencySymbol.value }
    ];
  }

  return [
    {
      title: 'Factures',
      value: chartData.value.totals.invoices || 0,
      formatted: formatAmount(chartData.value.totals.invoices || 0) + ' ' + currencySymbol.value
    },
    {
      title: 'Devis',
      value: chartData.value.totals.estimates || 0,
      formatted: formatAmount(chartData.value.totals.estimates || 0) + ' ' + currencySymbol.value
    },
    {
      title: 'Bons de livraison',
      value: chartData.value.totals.deliveries || 0,
      formatted: formatAmount(chartData.value.totals.deliveries || 0) + ' ' + currencySymbol.value
    }
  ];
});

// Initialisation
onMounted(() => {
  loadData();
});

// Surveiller les changements de période
watch([() => props.period, () => props.startDate, () => props.endDate], () => {
  loadData();
}, { deep: true });

// Surveillance des changements pour le graphique
watch([chartData, chartCanvas], () => {
  if (chartInstance) chartInstance.destroy();
  
  if (chartData.value && chartCanvas.value) {
    const ctx = chartCanvas.value.getContext('2d');
    if (ctx) {
      chartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: chartData.value.labels,
          datasets: chartData.value.datasets
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: {
              backgroundColor: '#ffffff',
              titleColor: '#2c3e50',
              bodyColor: '#34495e',
              borderColor: '#e0e0e0',
              borderWidth: 1,
              cornerRadius: 8,
              callbacks: {
                label: (context) => {
                  const label = context.dataset.label || '';
                  const value = context.raw as number;
                  return `${label}: ${formatAmount(value)} ${currencySymbol.value}`;
                }
              }
            }
          },
          scales: {
            x: { 
              stacked: false,
              grid: {
                display: false
              }
            },
            y: { 
              stacked: false,
              beginAtZero: true, // S'assurer que l'axe Y commence à 0
              ticks: {
                callback: (value) => `${value} ${currencySymbol.value}`
              },
              grid: {
                color: '#f0f0f0'
              }
            }
          }
        }
      });
    }
  }
});
</script>

<style scoped>
.page-container {
  background: white;
  padding: 16px;
  max-width: 1000px;
  margin: 0 auto;
  min-height: 100vh;
}

.page-header {
  text-align: center;
  margin-bottom: 24px;
}

.main-title {
  font-size: 1.8rem;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 8px;
}

.subtitle {
  color: #7f8c8d;
  font-size: 1.1rem;
  margin: 0;
}

.state-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 300px;
  gap: 16px;
  text-align: center;
}

.state-container.error {
  color: var(--ion-color-danger);
}

.custom-spinner {
  --color: #667eea;
  transform: scale(1.5);
}

.loading-text {
  color: #7f8c8d;
  font-size: 14px;
  margin: 0;
}

.error-icon {
  font-size: 48px;
  color: var(--ion-color-danger);
}

.error-text {
  font-size: 16px;
  text-align: center;
  color: var(--ion-color-danger);
}

.info-message {
  display: flex;
  align-items: center;
  gap: 12px;
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 24px;
  color: #6c757d;
}

.info-message ion-icon {
  font-size: 24px;
  flex-shrink: 0;
}

.info-message p {
  margin: 0;
  font-size: 14px;
}

.stats-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
}

.stat-card {
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 10px;
  padding: 16px;
  text-align: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  transition: all 0.2s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.stat-title {
  font-size: 1.1rem;
  font-weight: 500;
  color: #2c3e50;
  margin-bottom: 8px;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 600;
  color: #4a89dc;
  margin-bottom: 4px;
}

.stat-currency {
  font-size: 1rem;
  color: #7f8c8d;
  margin-bottom: 8px;
}

.stat-formatted {
  font-size: 0.9rem;
  color: #34495e;
  font-weight: 500;
}

.chart-container {
  height: 350px;
  margin: 24px 0;
  background: white;
  padding: 16px;
  border-radius: 10px;
  border: 1px solid #e0e0e0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.legend-container {
  display: flex;
  justify-content: center;
  gap: 24px;
  margin-top: 16px;
  flex-wrap: wrap;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.9rem;
  color: #2c3e50;
}

.legend-color {
  width: 14px;
  height: 14px;
  border-radius: 3px;
}

@media (max-width: 768px) {
  .stats-container {
    grid-template-columns: 1fr;
  }
  
  .chart-container {
    height: 300px;
  }
  
  .main-title {
    font-size: 1.5rem;
  }
}
</style>
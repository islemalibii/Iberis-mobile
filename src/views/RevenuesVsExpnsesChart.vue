<template>
  <ion-page>
    <ion-content class="ion-padding">
      <!-- Header avec logo et titre -->
      <div class="header-section">
        <div class="logo-container">
          <img src="../assets/budget.png" alt="Logo Iberis" class="logo" @click="goBack" />
        </div>
        <div class="header-text">
          <h1 class="page-title">Revenus vs Dépenses</h1>
          <p class="page-subtitle">{{ formattedPeriod }}</p>
        </div>
      </div>

      <!-- Statistiques de résumé -->
      <div class="stats-summary" v-if="!loading && !error">
        <div class="stat-item">
          <div class="stat-label">Revenus</div>
          <div class="stat-value positive">{{ formatAmount(totalIncomes) }} {{ currencySymbol }}</div>
        </div>
        <div class="stat-item">
          <div class="stat-label">Dépenses</div>
          <div class="stat-value negative">{{ formatAmount(totalOutcomes) }} {{ currencySymbol }}</div>
        </div>
        <div class="stat-item">
          <div class="stat-label">Solde</div>
          <div class="stat-value" :class="balance >= 0 ? 'positive' : 'negative'">
            {{ formatAmount(balance) }} {{ currencySymbol }}
          </div>
        </div>
      </div>

      <!-- Contenu principal -->
      <ion-card class="chart-card">
        <ion-card-header class="chart-header">
          <ion-card-title class="chart-title">Évolution Mensuelle</ion-card-title>
          <ion-card-subtitle class="chart-subtitle">{{ formattedPeriod }}</ion-card-subtitle>
        </ion-card-header>

        <ion-card-content class="chart-content">
          <!-- État de chargement -->
          <div v-if="loading" class="loading-container">
            <div class="loading-content">
              <ion-spinner name="crescent" class="custom-spinner"></ion-spinner>
              <p class="loading-text">Chargement des données...</p>
            </div>
          </div>
          
          <!-- État d'erreur -->
          <div v-else-if="error" class="error-container">
            <div class="error-icon">
              <ion-icon name="alert-circle-outline"></ion-icon>
            </div>
            <ion-text color="danger" class="error-text">{{ error }}</ion-text>
            <ion-button fill="outline" size="small" @click="retryFetch">Réessayer</ion-button>
          </div>

          <!-- Affichage du graphique -->
          <div v-else class="chart-wrapper">
            <!-- Message d'information si pas de données réelles -->
            <div v-if="!hasRealData" class="info-message">
              <ion-icon name="information-circle-outline"></ion-icon>
              <p>Aucune donnée de revenus ou dépenses disponible pour cette période.</p>
            </div>

            <div class="chart-container">
              <canvas ref="chartCanvas"></canvas>
            </div>
          </div>
        </ion-card-content>
      </ion-card>

      <!-- Légende -->
      <div class="legend-container" v-if="!loading && !error">
        <div class="legend-item">
          <span class="legend-dot income"></span>
          <span>Revenus</span>
        </div>
        <div class="legend-item">
          <span class="legend-dot outcome"></span>
          <span>Dépenses</span>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { 
  IonPage, IonContent, IonCard, IonCardHeader, 
  IonCardTitle, IonCardSubtitle, IonCardContent, 
  IonSpinner, IonText, IonIcon, IonButton
} from '@ionic/vue';
import { ref, watch, computed, onMounted, onBeforeUnmount, nextTick } from 'vue';
import { Chart, registerables } from 'chart.js';
import useCompanyRevenuesVsExpenses from '@/controllers/UseCompanyRevenuesVsExpenses';

Chart.register(...registerables);

// Props reçus du dashboard
interface Props {
  period?: string;
  startDate?: Date;
  endDate?: Date;
}

const props = withDefaults(defineProps<Props>(), {
  period: 'default',
  startDate: () => new Date(),
  endDate: () => new Date()
});

const { 
  data, 
  loading, 
  error, 
  totalIncomes, 
  totalOutcomes, 
  balance, 
  hasRealData,
  currencySymbol,
  formatAmount,
  fetchData,
  fetchDefaultData
} = useCompanyRevenuesVsExpenses();

const chartCanvas = ref<HTMLCanvasElement | null>(null);
let chartInstance: Chart | null = null;

// Noms courts des mois en français
const shortMonthNames = [
  'janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin',
  'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'
];

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
    console.log('Utilisation de la période comptable par défaut pour revenus vs dépenses');
    await fetchDefaultData();
  } else {
    console.log('Utilisation de la période spécifiée pour revenus vs dépenses:', props.period);
    const fromDate = formatDate(props.startDate);
    const toDate = formatDate(props.endDate);
    await fetchData(fromDate, toDate);
  }
};

// Formatage de la période pour l'affichage
const formattedPeriod = computed(() => {
  if (shouldUseDefaultDates()) {
    return 'Période comptable par défaut';
  }
  
  const start = props.startDate.toLocaleDateString('fr-FR');
  const end = props.endDate.toLocaleDateString('fr-FR');
  return `Du ${start} au ${end}`;
});

// Fonction pour réessayer le chargement
const retryFetch = () => {
  loadData();
};

const initChart = () => {
  if (!chartCanvas.value || !data.value) return;
  
  if (chartInstance) {
    chartInstance.destroy();
  }
  
  const ctx = chartCanvas.value.getContext('2d');
  if (!ctx) return;
  
  const months = shortMonthNames.slice(0, data.value.organisedMonths.length);
  const incomes = data.value.incomesConvertedSum;
  const outcomes = data.value.outcomesConvertedSum;
  
  chartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels: months,
      datasets: [
        {
          label: 'Revenus',
          data: incomes,
          borderColor: '#2d8dbd',
          backgroundColor: 'rgba(45, 141, 189, 0.1)',
          borderWidth: 3,
          tension: 0.4,
          fill: true,
          pointBackgroundColor: '#2d8dbd',
          pointRadius: 4,
          pointHoverRadius: 6
        },
        {
          label: 'Dépenses',
          data: outcomes,
          borderColor: '#eb63ab',
          backgroundColor: 'rgba(235, 99, 171, 0.1)',
          borderWidth: 3,
          tension: 0.4,
          fill: true,
          pointBackgroundColor: '#eb63ab',
          pointRadius: 4,
          pointHoverRadius: 6
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          enabled: true,
          mode: 'index',
          intersect: false,
          backgroundColor: 'white',
          borderColor: '#E6E9ED',
          borderWidth: 1,
          padding: 12,
          bodyColor: '#2C3E50',
          titleColor: '#656D78',
          titleFont: { size: 12 },
          bodyFont: { size: 14, weight: 'bold' },
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
          grid: { 
            display: true,
            color: 'rgba(0, 0, 0, 0.05)',
            drawOnChartArea: true,
            drawTicks: true
          },
          ticks: {
            font: { size: 10 },
            color: '#656D78'
          },
          border: {
            display: true,
            color: '#E6E9ED'
          }
        },
        y: {
          beginAtZero: true,
          grid: {
            color: 'rgba(0, 0, 0, 0.05)',
            drawTicks: false
          },
          ticks: {
            callback: (value) => {
              return `${value} ${currencySymbol.value}`;
            },
            font: { size: 12 }
          },
          border: {
            display: true,
            color: '#E6E9ED'
          }
        }
      },
      interaction: {
        mode: 'index',
        intersect: false
      },
      onHover: (event, chartElements) => {
        const canvas = event.native?.target as HTMLCanvasElement;
        if (canvas) {
          canvas.style.cursor = chartElements.length ? 'pointer' : 'default';
        }
      }
    }
  });
};

watch(data, (newVal) => {
  if (newVal) {
    nextTick(() => {
      initChart();
    });
  }
}, { deep: true });

// Surveiller les changements de période
watch([() => props.period, () => props.startDate, () => props.endDate], () => {
  loadData();
}, { deep: true });

onBeforeUnmount(() => {
  if (chartInstance) {
    chartInstance.destroy();
  }
});

onMounted(() => {
  loadData();
});
</script>

<style scoped>
/* Configuration générale */
ion-content {
  --background: #ffffff;
  --padding-top: 20px;
}

ion-page {
  --background: #ffffff;
}

/* Header section */
.header-section {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
  padding: 12px 16px;
  background: linear-gradient(135deg, #faf8f0 0%, #ffffff 100%);
  border-radius: 12px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
}

.logo-container {
  margin-right: 12px;
}

.logo {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  cursor: pointer;
  transition: transform 0.2s ease;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
}

.logo:hover {
  transform: scale(1.03);
}

.header-text {
  flex: 1;
}

.page-title {
  font-size: 1.2rem;
  font-weight: 600;
  color: #2c2c2c;
  margin: 0 0 2px 0;
  letter-spacing: -0.01em;
}

.page-subtitle {
  font-size: 0.8rem;
  color: #666;
  margin: 0;
  font-weight: 400;
}

/* Statistiques de résumé */
.stats-summary {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 15px;
  margin-bottom: 20px;
  background: white;
  padding: 15px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.stat-item {
  text-align: center;
}

.stat-label {
  font-size: 0.85rem;
  color: #656D78;
  margin-bottom: 5px;
}

.stat-value {
  font-size: 1.1rem;
  font-weight: 600;
  color: #2C3E50;
}

.positive {
  color: #27ae60;
}

.negative {
  color: #eb63ab;
}

/* Carte du graphique */
.chart-card {
  margin-bottom: 16px;
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
  border: 1px solid #e8e8e8;
  overflow: hidden;
  background: #ffffff;
}

.chart-header {
  background: linear-gradient(135deg, #f7c52d 0%, #e6b800 100%);
  color: #2c2c2c;
  padding: 16px;
}

.chart-title {
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 4px;
  color: #2c2c2c;
}

.chart-subtitle {
  font-size: 0.8rem;
  color: rgba(44, 44, 44, 0.8);
}

.chart-content {
  padding: 20px 16px;
  background: #ffffff;
}

/* États de chargement et d'erreur */
.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 300px;
}

.loading-content {
  text-align: center;
}

.custom-spinner {
  --color: #f7c52d;
  transform: scale(1.2);
  margin-bottom: 12px;
}

.loading-text {
  color: #666;
  font-size: 0.8rem;
  margin: 0;
}

.error-container {
  text-align: center;
  padding: 20px 12px;
  min-height: 300px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.error-icon {
  margin-bottom: 12px;
}

.error-icon ion-icon {
  font-size: 2rem;
  color: var(--ion-color-danger);
}

.error-text {
  display: block;
  margin-bottom: 16px;
  font-size: 0.9rem;
}

/* Message d'information */
.info-message {
  display: flex;
  align-items: center;
  gap: 12px;
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 16px;
  color: #6c757d;
  font-size: 0.85rem;
}

.info-message ion-icon {
  font-size: 1.2rem;
  flex-shrink: 0;
}

.info-message p {
  margin: 0;
}

/* Conteneur du graphique */
.chart-wrapper {
  width: 100%;
}

.chart-container {
  height: 300px;
  position: relative;
  background: white;
  border-radius: 8px;
}

/* Légende */
.legend-container {
  display: flex;
  justify-content: center;
  gap: 20px;
  background: white;
  padding: 15px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.legend-item {
  display: flex;
  align-items: center;
  font-size: 0.8rem;
  color: #656D78;
}

.legend-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  margin-right: 6px;
}

.income {
  background-color: #2d8dbd;
}

.outcome {
  background-color: #eb63ab;
}

/* Responsive */
@media (max-width: 768px) {
  .header-section {
    flex-direction: column;
    text-align: center;
    gap: 8px;
  }

  .stats-summary {
    grid-template-columns: 1fr;
  }
  
  .chart-container {
    height: 250px;
  }

  .legend-container {
    flex-direction: column;
    align-items: center;
    gap: 10px;
  }
}

/* Animations */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(15px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.chart-card {
  animation: fadeInUp 0.5s ease forwards;
}

.stats-summary {
  animation: fadeInUp 0.5s ease forwards;
  animation-delay: 0.1s;
}

.legend-container {
  animation: fadeInUp 0.5s ease forwards;
  animation-delay: 0.2s;
}
</style>

  
<template>
  <ion-page>
    <ion-content class="ion-padding">
      <div class="finance-container">
        <!-- Loading State -->
        <div v-if="loading" class="loading-container">
          <div class="loading-content">
            <ion-spinner name="crescent" class="custom-spinner"></ion-spinner>
            <p class="loading-text">Chargement des données financières...</p>
          </div>
        </div>

        <!-- Error State -->
        <div v-else-if="error" class="error-container">
          <div class="error-icon">
            <ion-icon name="alert-circle-outline"></ion-icon>
          </div>
          <ion-text color="danger" class="error-text">{{ error }}</ion-text>
          <ion-button fill="outline" color="primary" @click="loadDataWithPeriod" class="retry-button">
            <ion-icon name="refresh-outline" slot="start"></ion-icon>
            Réessayer
          </ion-button>
        </div>

        <!-- Main Content -->
        <div v-else>
          <!-- Header -->
          <div class="finance-header">
            <h1>Résultats Financiers: 
              <span class="total-amount" :class="resultsStatus">
                {{ formatAmount(totalResults) }} {{ currencySymbol }}
              </span>
            </h1>
            <p class="period-info">{{ formattedPeriod }}</p>
          </div>

          <!-- Info Message if no real data -->
          <div v-if="!hasRealData" class="info-message">
            <ion-icon name="information-circle-outline"></ion-icon>
            <p>Aucune donnée financière disponible pour cette période. Les résultats affichés sont nuls.</p>
          </div>

          <!-- Stats Summary -->
          <div class="stats-summary">
            <div class="stat-item invoices">
              <div class="stat-label">
                <ion-icon name="document-text-outline"></ion-icon>
                <span>Factures</span>
              </div>
              <div class="stat-value">{{ formatAmount(totalInvoices) }} {{ currencySymbol }}</div>
            </div>
            <div class="stat-item expenses">
              <div class="stat-label">
                <ion-icon name="card-outline"></ion-icon>
                <span>Dépenses</span>
              </div>
              <div class="stat-value">{{ formatAmount(totalExpenses) }} {{ currencySymbol }}</div>
            </div>
            <div class="stat-item results">
              <div class="stat-label">
                <ion-icon name="trending-up-outline"></ion-icon>
                <span>Bénéfice Net</span>
              </div>
              <div :class="['stat-value', resultsStatus]">
                {{ formatAmount(totalResults) }} {{ currencySymbol }}
              </div>
            </div>
          </div>

          <!-- Chart Container -->
          <div class="chart-container" v-if="hasRealData">
            <canvas ref="chartCanvas"></canvas>
          </div>

          <!-- Empty Chart Placeholder -->
          <div v-else class="empty-chart">
            <ion-icon name="bar-chart-outline"></ion-icon>
            <p>Aucune donnée à afficher sur le graphique</p>
          </div>

          <!-- Legend -->
          <div class="legend-container" v-if="hasRealData">
            <div class="legend-item">
              <span class="legend-dot result"></span>
              <span>Résultats Financiers</span>
            </div>
            <div class="legend-item">
              <span class="legend-dot zero-line"></span>
              <span>Seuil de Rentabilité</span>
            </div>
          </div>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { 
  IonPage, IonContent, IonSpinner, IonText, IonIcon, IonButton
} from '@ionic/vue';
import { ref, watch, computed, onMounted, onBeforeUnmount, nextTick } from 'vue';
import { Chart, registerables } from 'chart.js';
import useCompanyResults from '@/controllers/useCompanyResults';

Chart.register(...registerables);

const { 
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
} = useCompanyResults();

const chartCanvas = ref<HTMLCanvasElement | null>(null);
let chartInstance: Chart | null = null;

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

// Fonction pour formater les dates en YYYY-MM-DD
const formatDate = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

// Fonction pour déterminer si on doit utiliser les dates par défaut ou les props
const shouldUseDefaultDates = (): boolean => {
  return !props.period || props.period === 'default' || props.period === 'thisYear';
};

// Fonction pour charger les données selon la configuration
const loadDataWithPeriod = async () => {
  if (shouldUseDefaultDates()) {
    console.log('Utilisation de la période comptable par défaut');
    await fetchDefaultData();
  } else {
    console.log('Utilisation de la période spécifiée:', props.period);
    const fromDate = formatDate(props.startDate);
    const toDate = formatDate(props.endDate);
    await fetchDataWithPeriod(fromDate, toDate);
  }
};

// Formatage de la période pour l'affichage
const formattedPeriod = computed(() => {
  if (shouldUseDefaultDates()) {
    return `Exercice ${currentExerciseYear.value} - Période comptable`;
  }
  
  const start = props.startDate.toLocaleDateString('fr-FR');
  const end = props.endDate.toLocaleDateString('fr-FR');
  return `Du ${start} au ${end}`;
});

// Noms courts des mois en français
const shortMonthNames = [
  'janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin',
  'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'
];

const initChart = () => {
  if (!chartCanvas.value || !data.value || !hasRealData.value) return;
  
  if (chartInstance) {
    chartInstance.destroy();
  }
  
  const ctx = chartCanvas.value.getContext('2d');
  if (!ctx) return;
  
  const months = shortMonthNames.slice(0, organisedMonths.value.length);
  
  // Créer un dataset pour la ligne de zéro
  const zeroDataset = {
    label: 'Seuil de Rentabilité',
    data: months.map(() => 0),
    borderColor: '#2C3E50',
    borderWidth: 2,
    borderDash: [5, 5],
    pointRadius: 0,
    fill: false,
    tension: 0
  };
  
  // Dataset pour les résultats
  const resultDataset = {
    label: 'Résultats Financiers',
    data: monthlyResults.value,
    borderColor: '#4A89DC',
    backgroundColor: 'rgba(74, 137, 220, 0.1)',
    borderWidth: 3,
    pointBackgroundColor: '#4A89DC',
    pointRadius: 6,
    pointHoverRadius: 8,
    tension: 0.4,
    fill: true
  };
  
  chartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels: months,
      datasets: [resultDataset, zeroDataset]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          enabled: true,
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          borderColor: '#E6E9ED',
          borderWidth: 1,
          padding: 12,
          bodyColor: '#2C3E50',
          titleColor: '#4A89DC',
          titleFont: { size: 12, weight: 'bold' },
          bodyFont: { size: 14, weight: '600' },
          cornerRadius: 10,
          callbacks: {
            label: (context) => {
              const value = context.raw as number;
              const label = context.datasetIndex === 0 
                ? (value >= 0 ? 'Bénéfice' : 'Perte')
                : 'Seuil';
              return `${label}: ${formatAmount(Math.abs(value))} ${currencySymbol.value}`;
            },
            title: (context) => {
              return `${shortMonthNames[context[0].dataIndex]} ${currentExerciseYear.value}`;
            }
          }
        }
      },
      scales: {
        x: {
          grid: { 
            display: true,
            color: 'rgba(0, 0, 0, 0.03)'
          },
          ticks: {
            font: {
              size: 11,
              weight: '500'
            },
            color: '#7a8ca5'
          }
        },
        y: {
          beginAtZero: true,
          grid: {
            color: 'rgba(0, 0, 0, 0.03)',
            drawTicks: false
          },
          ticks: {
            callback: (value) => {
              return `${value} ${currencySymbol.value}`;
            },
            font: {
              size: 12,
              weight: '500'
            },
            color: '#7a8ca5'
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

watch([data, monthlyResults, hasRealData], () => {
  if (data.value && hasRealData.value) {
    nextTick(() => {
      initChart();
    });
  }
}, { deep: true });

// Surveiller les changements de période
watch([() => props.period, () => props.startDate, () => props.endDate], () => {
  loadDataWithPeriod();
}, { deep: true });

onBeforeUnmount(() => {
  if (chartInstance) {
    chartInstance.destroy();
  }
});

onMounted(() => {
  loadDataWithPeriod();
});
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');

ion-content {
  --background: #f8fafc;
  font-family: 'Inter', sans-serif;
}

.finance-container {
  background: #ffffff;
  border-radius: 16px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.06);
  overflow: hidden;
  margin: 0 auto;
  max-width: 900px;
}

/* Loading and Error States */
.loading-container,
.error-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  min-height: 300px;
  padding: 40px 20px;
}

.loading-content {
  text-align: center;
}

.custom-spinner {
  --color: #4A89DC;
  transform: scale(1.5);
  margin-bottom: 20px;
}

.loading-text {
  color: #666;
  font-size: 1rem;
  margin: 0;
}

.error-icon {
  margin-bottom: 16px;
}

.error-icon ion-icon {
  font-size: 3rem;
  color: var(--ion-color-danger);
}

.error-text {
  display: block;
  margin-bottom: 20px;
  font-size: 1rem;
  text-align: center;
}

.retry-button {
  margin-top: 10px;
}

/* Info Message */
.info-message {
  display: flex;
  align-items: center;
  gap: 12px;
  background: #e8f4fd;
  border: 1px solid #b8daff;
  border-radius: 12px;
  padding: 16px;
  margin: 20px 25px;
  color: #0c5aa6;
  font-size: 0.9rem;
}

.info-message ion-icon {
  font-size: 1.3rem;
  flex-shrink: 0;
}

.info-message p {
  margin: 0;
}

.finance-header {
  background: linear-gradient(135deg, #2C3E50 0%, #4A89DC 100%);
  color: white;
  padding: 25px;
  text-align: center;
}

.finance-header h1 {
  font-size: 1.4rem;
  font-weight: 600;
  margin: 0 0 8px 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.total-amount {
  font-size: 1.8rem;
  font-weight: 700;
  background: rgba(255, 255, 255, 0.15);
  padding: 12px 24px;
  border-radius: 12px;
  backdrop-filter: blur(4px);
  display: inline-block;
}

.total-amount.positive {
  background: rgba(39, 174, 96, 0.2);
  color: #ffffff;
}

.total-amount.negative {
  background: rgba(231, 76, 60, 0.2);
  color: #ffffff;
}

.period-info {
  font-size: 0.9rem;
  opacity: 0.9;
  margin: 0;
}

.stats-summary {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  padding: 25px;
  background: #f9fbfd;

  }
  
  .stat-item {
    text-align: center;
    background: white;
    border-radius: 14px;
    padding: 20px 15px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);
    transition: all 0.3s ease;
    border-left: 4px solid #4A89DC;
  }
  
  .stat-item:nth-child(2) {
    border-left-color: #37BC9B;
  }
  
  .stat-item:nth-child(3) {
    border-left-color: #E9573F;
  }
  
  .stat-item:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.08);
  }
  
  .stat-label {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    font-size: 0.9rem;
    color: #7a8ca5;
    margin-bottom: 12px;
    font-weight: 500;
  }
  
  .stat-label i {
    font-size: 1.1rem;
  }
  
  .stat-value {
    font-size: 1.4rem;
    font-weight: 700;
    color: #2C3E50;
  }
  
  .positive {
    color: #37BC9B;
  }
  
  .negative {
    color: #E9573F;
  }
  
  .chart-container {
    height: 350px;
    padding: 20px;
    position: relative;
  }
  
  .legend-container {
    display: flex;
    justify-content: center;
    gap: 30px;
    padding: 20px;
    background: #f9fbfd;
    border-top: 1px solid #edf1f7;
  }
  
  .legend-item {
    display: flex;
    align-items: center;
    font-size: 0.9rem;
    color: #2C3E50;
    font-weight: 500;
  }
  
  .legend-dot {
    width: 14px;
    height: 14px;
    border-radius: 50%;
    margin-right: 10px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  }
  
  .result {
    background: linear-gradient(135deg, #4A89DC 0%, #3BAFDA 100%);
  }
  
  .zero-line {
    background: #2C3E50;
  }
  
  @media (max-width: 768px) {
    .stats-summary {
      grid-template-columns: 1fr;
      padding: 15px;
    }
    
    .chart-container {
      height: 280px;
      padding: 15px;
    }
    
    .finance-header h1 {
      font-size: 1.2rem;
    }
    
    .total-amount {
      font-size: 1.5rem;
    }
    
    .legend-container {
      flex-direction: column;
      align-items: center;
      gap: 15px;
    }
    
    .stat-item {
      padding: 15px 10px;
    }
    
    .stat-value {
      font-size: 1.3rem;
    }
  }
  </style>

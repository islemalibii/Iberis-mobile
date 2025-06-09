<template>
    <ion-page>
      <ion-content class="ion-padding">
      <div class="turnover-header">
      <h1>Comparatif du Chiffre d'Affaires: 
            <span class="total-amount">{{ formatAmount(notFormatted) }} {{ currencySymbol }}</span>
          </h1>      </div>
     
  
        <div class="chart-container">
          <canvas ref="chartCanvas"></canvas>
        </div>
  
        <div class="legend-container">
          <div class="legend-item">
            <span class="legend-dot current-year"></span>
            <span>Exercice en cours</span>
          </div>
          <div class="legend-item">
            <span class="legend-dot previous-year"></span>
            <span>Exercice précédent</span>
          </div>
        </div>
      </ion-content>
    </ion-page>
  </template>
  
  <script setup lang="ts">
  import { 
    IonPage, IonContent
  } from '@ionic/vue';
  import { ref, watch, computed, onMounted, onBeforeUnmount, nextTick } from 'vue';
  import { Chart, registerables } from 'chart.js';
  import useCompanyTurnover from '@/controllers/useCompanyTurnover';
  
  Chart.register(...registerables);
  
  const { turnoverData, loading, error, growthRate, fetchData } = useCompanyTurnover();
  const chartCanvas = ref<HTMLCanvasElement | null>(null);
  let chartInstance: Chart | null = null;
  
  // Noms courts des mois en français
  const shortMonthNames = [
    'janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin',
    'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'
  ];
  // Props reçus du dashboard
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
  const formatDate = (date: Date): string => {
    return date.toISOString().split('T')[0];
  };
  const loadDataWithPeriod = async () => {
    const fromDate = formatDate(props.startDate);
    const toDate = formatDate(props.endDate);
    
    await fetchData(fromDate, toDate);
  };
  
  // Charger les données au montage
  onMounted(() => {
    loadDataWithPeriod();
  });
  
  
  
  onMounted(() => {
    fetchData();
  });
  watch([() => props.period, () => props.startDate, () => props.endDate], () => {
    loadDataWithPeriod();
  }, { deep: true });
  const currentYearTotal = computed(() => {
    return turnoverData.value?.currentExerciseInvoices.reduce((a, b) => a + b, 0) || 0;
  });
  
  const previousYearTotal = computed(() => {
    return turnoverData.value?.lastExerciseInvoices.reduce((a, b) => a + b, 0) || 0;
  });
  
  const formatAmount = (amount: number) => {
    return amount.toFixed(3).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  };
  const notFormatted = computed(() => {
    return turnoverData.value?.extraData?.notFormatted || 0;
  });
  const currencySymbol = computed(() => {
    return turnoverData.value?.extraData?.currencySymbol || 'TND';
  });
  
  const initChart = () => {
    if (!chartCanvas.value || !turnoverData.value) return;
    
    if (chartInstance) {
      chartInstance.destroy();
    }
    
    const ctx = chartCanvas.value.getContext('2d');
    if (!ctx) return;
    
    const months = shortMonthNames.slice(0, turnoverData.value.organisedMonths.length);
    const currentData = turnoverData.value.currentExerciseInvoices;
    const previousData = turnoverData.value.lastExerciseInvoices;
    
    chartInstance = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: months,
        datasets: [
          {
            label: 'Exercice en cours',
            data: currentData,
            backgroundColor: 'rgba(120, 120, 120, 0.7)', // Gris pour l'année en cours
            borderColor: 'rgba(120, 120, 120, 1)',
            borderWidth: 0,
            barThickness: 6,
            borderRadius: 3,
          },
          {
            label: 'Exercice précédent',
            data: previousData,
            backgroundColor: 'rgba(59, 175, 218, 0.7)', // Bleu pour l'année précédente
            borderColor: 'rgba(59, 175, 218, 1)',
            borderWidth: 0,
            barThickness: 6,
            borderRadius: 3,
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
                return `${label}: ${formatAmount(value)} TND`;
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
              font: {
                size: 10
              },
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
              display: false
            },
            border: {
              display: true,
              color: '#E6E9ED'
            }
          }
        },
        elements: {
          bar: {
            borderSkipped: false
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
  
  watch(turnoverData, (newVal) => {
    if (newVal) {
      nextTick(() => {
        initChart();
      });
    }
  }, { deep: true });
  
  onBeforeUnmount(() => {
    if (chartInstance) {
      chartInstance.destroy();
    }
  });
  
  onMounted(() => {
    fetchData();
  });
  </script>
  
  <style scoped>
  ion-content {
    --background: #ffffff;
  }
  .turnover-header {
    text-align: center;
    margin-bottom: 20px;
  }
  
  .turnover-header h1 {
    font-size: 1.2rem;
    font-weight: 500;
    color: #2C3E50;
    margin-bottom: 0;
  }
  
  .currency {
    font-size: 0.9rem;
    color: #AAB2BD;
    font-weight: 400;
  }
  
  .stats-summary {
    display: flex;
    justify-content: center;
    gap: 30px;
    margin-bottom: 20px;
    background: white;
    padding: 15px;
    border-radius: 10px;
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
  
  .chart-container {
    height: 200px;
    margin: 10px 0;
    background: white;
    padding: 15px;
    border-radius: 10px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  }
  .turnover-header {
    text-align: center;
    margin-bottom: 20px;
  }
  
  .turnover-header h1 {
    font-size: 1.2rem;
    font-weight: 500;
    color: #2C3E50;
    margin-bottom: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  
  .turnover-header .total-amount {
    font-size: 1.6rem;
    font-weight: 700;
    color: #4A89DC;
    margin-top: 8px;
  }
  .legend-container {
    display: flex;
    justify-content: center;
    gap: 20px;
    margin-top: 20px;
    background: white;
    padding: 15px;
    border-radius: 10px;
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
  
  .current-year {
    background-color: #787878; /* Gris pour l'année en cours */
  }
  
  .previous-year {
    background-color: #3BAFDA; /* Bleu pour l'année précédente */
  }
  
  @media (max-width: 768px) {
    .chart-container {
      height: 180px;
    }
    
    .stats-summary {
      flex-direction: column;
      gap: 15px;
    }
  }
  </style>
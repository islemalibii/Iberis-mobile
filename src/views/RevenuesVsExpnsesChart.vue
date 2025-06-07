<template>
    <ion-page>
      <ion-content class="ion-padding">
        <div class="header">
          <h1>Revenus vs Dépenses</h1>
        </div>
  
       
  
        <div class="chart-container">
          <canvas ref="chartCanvas"></canvas>
        </div>
  
        <div class="legend-container">
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
    IonPage, IonContent
  } from '@ionic/vue';
  import { ref, watch, computed, onMounted, onBeforeUnmount, nextTick } from 'vue';
  import { Chart, registerables } from 'chart.js';
  import useCompanyRevenuesVsExpenses from '@/controllers/UseCompanyRevenuesVsExpenses';
  
  Chart.register(...registerables);
  
  const { data, loading, error, totalIncomes, totalOutcomes, balance, fetchData } = useCompanyRevenuesVsExpenses();
  const chartCanvas = ref<HTMLCanvasElement | null>(null);
  let chartInstance: Chart | null = null;
  
  // Noms courts des mois en français
  const shortMonthNames = [
    'janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin',
    'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'
  ];
  
  const currencySymbol = computed(() => {
    return data.value?.extraData?.currencySymbol || 'TND';
  });
  
  const formatAmount = (amount: number) => {
    return amount.toFixed(3).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
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
            backgroundColor: 'rgba(76, 175, 80, 0.1)',
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
            backgroundColor: 'rgba(244, 67, 54, 0.1)',
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
              callback: (value) => {
                return `${value} ${currencySymbol.value}`;
              },
              font: {
                size: 12
              }
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
  
  .header {
    text-align: center;
    margin-bottom: 20px;
  }
  
  .header h1 {
    font-size: 1.2rem;
    font-weight: 500;
    color: #2C3E50;
    margin-bottom: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  
  .header .total-amount {
    font-size: 1.6rem;
    font-weight: 700;
    color: #4A89DC;
    margin-top: 8px;
  }
  
  .stats-summary {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 15px;
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
  
  .positive {
    color: #4CAF50;
  }
  
  .negative {
    color: #eb63ab;
  }
  
  .chart-container {
    height: 300px;
    margin: 10px 0;
    background: white;
    padding: 15px;
    border-radius: 10px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
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
  
  .income {
    background-color: #2d8dbd; /* Vert pour les revenus */
  }
  
  .outcome {
    background-color: #eb63ab; /* Rouge pour les dépenses */
  }
  
  @media (max-width: 768px) {
    .stats-summary {
      grid-template-columns: 1fr;
    }
    
    .chart-container {
      height: 250px;
    }
  }
  </style>

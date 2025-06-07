<template>
    <ion-page>
      <ion-content class="ion-padding">
        <div class="finance-container">
          <div class="finance-header">
            <h1>Statistiques des Ventes: {{ currentYear }}</h1>
          </div>
  
          <div class="stats-summary">
            <div class="stat-item">
              <div class="stat-label">
                <i class="fas fa-file-estimate"></i> Devis
              </div>
              <div class="stat-value">{{ formatAmount(totalEstimates) }} {{ currencySymbol }}</div>
            </div>
            <div class="stat-item">
              <div class="stat-label">
                <i class="fas fa-truck-loading"></i> Livraisons
              </div>
              <div class="stat-value">{{ formatAmount(totalDeliveries) }} {{ currencySymbol }}</div>
            </div>
          
            <div class="stat-item">
              <div class="stat-label">
                <i class="fas fa-file-invoice"></i> Factures
              </div>
              <div class="stat-value">{{ formatAmount(totalInvoices) }} {{ currencySymbol }}</div>
            </div>
          </div>
  
          <div class="chart-container">
            <canvas ref="chartCanvas"></canvas>
          </div>
  
          <div class="legend-container">
            <div class="legend-item">
              <span class="legend-dot estimates"></span>
              <span>Devis</span>
            </div>
            <div class="legend-item">
              <span class="legend-dot deliveries"></span>
              <span>Livraisons</span>
            </div>
        
            <div class="legend-item">
              <span class="legend-dot invoices"></span>
              <span>Factures</span>
            </div>
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
  import useCompanySales from '@/controllers/useCompanySales';
  interface Props {
    period?: string;
    startDate?: Date;
    endDate?: Date;
  }
  const props = withDefaults(defineProps<Props>(), {
    period: 'thisMonth',
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
  watch([() => props.period, () => props.startDate, () => props.endDate], () => {
    loadDataWithPeriod();
  }, { deep: true });
  Chart.register(...registerables);
  
  const { salesData, loading, error, totalEstimates, totalDeliveries, totalIncomes, totalInvoices, fetchData } = useCompanySales();
  const chartCanvas = ref<HTMLCanvasElement | null>(null);
  let chartInstance: Chart | null = null;
  
  // Noms courts des mois en français
  const shortMonthNames = [
    'janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin',
    'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'
  ];
  
  const currencySymbol = computed(() => {
    return salesData.value?.extraData?.currencySymbol || 'TND';
  });
  
  const currentYear = computed(() => {
    return salesData.value?.currentExerciseYear || new Date().getFullYear();
  });
  
  const formatAmount = (amount: number) => {
    return amount.toFixed(3).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  };
  
  const initChart = () => {
    if (!chartCanvas.value || !salesData.value) return;
    
    if (chartInstance) {
      chartInstance.destroy();
    }
    
    const ctx = chartCanvas.value.getContext('2d');
    if (!ctx) return;
    
    const months = shortMonthNames.slice(0, salesData.value.organisedMonths.length);
    
    // Configuration des datasets
    const datasets = [
      {
        label: 'Devis',
        data: salesData.value.estimatesConvertedSum,
        borderColor: '#FFA500',
        backgroundColor: 'rgba(255, 165, 0, 0.1)',
        borderWidth: 3,
        pointBackgroundColor: '#FFA500',
        pointRadius: 4,
        pointHoverRadius: 6,
        tension: 0.4,
        fill: true
      },
      {
        label: 'Livraisons',
        data: salesData.value.deliveriesConvertedSum,
        borderColor: '#37BC9B',
        backgroundColor: 'rgba(55, 188, 155, 0.1)',
        borderWidth: 3,
        pointBackgroundColor: '#37BC9B',
        pointRadius: 4,
        pointHoverRadius: 6,
        tension: 0.4,
        fill: true
      },
     
      {
        label: 'Factures',
        data: salesData.value.invoicesConvertedSum,
        borderColor: '#E9573F',
        backgroundColor: 'rgba(233, 87, 63, 0.1)',
        borderWidth: 3,
        pointBackgroundColor: '#E9573F',
        pointRadius: 4,
        pointHoverRadius: 6,
        tension: 0.4,
        fill: true
      }
    ];
    
    chartInstance = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: months,
        datasets: datasets
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
                const label = context.dataset.label || '';
                const value = context.raw as number;
                return `${label}: ${formatAmount(value)} ${currencySymbol.value}`;
              },
              title: (context) => {
                return `${context[0].label} ${currentYear.value}`;
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
  
  watch(salesData, (newVal) => {
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
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
  @import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css');
  
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
    max-width: 1200px;
  }
  
  .finance-header {
    background: linear-gradient(135deg, #2C3E50 0%, #4A89DC 100%);
    color: white;
    padding: 20px 25px;
    text-align: center;
  }
  
  .finance-header h1 {
    font-size: 1.4rem;
    font-weight: 600;
    margin: 0;
  }
  
  .stats-summary {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 15px;
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
    border-left: 4px solid;
  }
  
  .stat-item:nth-child(1) {
    border-left-color: #FFA500;
  }
  
  .stat-item:nth-child(2) {
    border-left-color: #37BC9B;
  }
  
  .stat-item:nth-child(3) {
    border-left-color: #4A89DC;
  }
  
  .stat-item:nth-child(4) {
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
    font-size: 1.3rem;
    font-weight: 700;
    color: #2C3E50;
  }
  
  .chart-container {
    height: 400px;
    padding: 20px;
    position: relative;
  }
  
  .legend-container {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 15px;
    padding: 20px;
    background: #f9fbfd;
    border-top: 1px solid #edf1f7;
  }
  
  .legend-item {
    display: flex;
    align-items: center;
    justify-content: center;
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
  
  .estimates {
    background: #FFA500;
  }
  
  .deliveries {
    background: #37BC9B;
  }
  
  .incomes {
    background: #4A89DC;
  }
  
  .invoices {
    background: #E9573F;
  }
  
  @media (max-width: 992px) {
    .stats-summary,
    .legend-container {
      grid-template-columns: repeat(2, 1fr);
    }
  }
  
  @media (max-width: 768px) {
    .stats-summary,
    .legend-container {
      grid-template-columns: 1fr;
    }
    
    .chart-container {
      height: 350px;
      padding: 15px;
    }
    
    .finance-header h1 {
      font-size: 1.2rem;
    }
    
    .stat-item {
      padding: 15px 10px;
    }
  }
  </style>

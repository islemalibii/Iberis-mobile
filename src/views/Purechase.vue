<template>
    <ion-page>
      <ion-content class="ion-padding">
        <div class="page-header">
          <h1 class="main-title">Analyse des Dépenses</h1>
        </div>
  
        <ion-card class="main-card">
          <ion-card-header class="card-header">
            <ion-card-title class="card-title">Répartition par Catégories</ion-card-title>
            <ion-card-subtitle v-if="chartData" class="card-subtitle">
              <span class="total-label">Total des dépenses:</span>
              <span class="total-amount">{{ chartData.total }}</span>
            </ion-card-subtitle>
          </ion-card-header>
          
          <ion-card-content class="card-content">
            <div v-if="loading" class="spinner-container">
              <ion-spinner name="crescent" class="custom-spinner"></ion-spinner>
              <p class="loading-text">Chargement des données...</p>
            </div>
            
            <div v-else-if="error" class="error-container">
              <ion-icon name="alert-circle-outline" class="error-icon"></ion-icon>
              <ion-text color="danger" class="error-text">{{ error }}</ion-text>
            </div>
  
            <div v-else class="chart-container">
              <div class="chart-section">
                <div class="chart-wrapper">
                  <canvas ref="chartCanvas"></canvas>
                </div>
              </div>
              
              <div class="stats-section">
                <h3 class="stats-title">Détail des Catégories</h3>
                <div class="categories-grid">
                  <div 
                    v-for="(label, index) in chartData.labels" 
                    :key="index"
                    class="category-card"
                  >
                    <div class="category-header">
                      <span class="color-indicator" :style="{ backgroundColor: chartData.datasets[0].backgroundColor[index] }"></span>
                      <span class="category-name">{{ label }}</span>
                    </div>
                    <div class="category-stats">
                      <span class="percentage">{{ chartData.percentages[index] }}%</span>
                      <span class="amount">{{ (chartData.datasets[0].data[index] || 0).toLocaleString() }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </ion-card-content>
        </ion-card>
      </ion-content>
    </ion-page>
  </template>
  
  <script setup lang="ts">
  import { ref, onMounted, watch } from 'vue';
  import { 
    IonPage, IonContent, IonCard, IonCardHeader, 
    IonCardTitle, IonCardSubtitle, IonCardContent, 
    IonSpinner, IonText, IonIcon
  } from '@ionic/vue';
  import { Chart, DoughnutController, ArcElement, Tooltip, Legend } from 'chart.js';
  import usePurchaseCategories from '@/controllers/PurchaseCategoriesController';
  
  // Props reçus du dashboard
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
  
  // Enregistrer les composants Chart.js
  Chart.register(DoughnutController, ArcElement, Tooltip, Legend);
  
  const { chartData, loading, error, fetchData } = usePurchaseCategories();
  const chartCanvas = ref<HTMLCanvasElement | null>(null);
  let chartInstance: Chart | null = null;
  
  // Fonction pour formater les dates en YYYY-MM-DD
  const formatDate = (date: Date): string => {
    return date.toISOString().split('T')[0];
  };
  
  // Fonction pour charger les données avec la période
  const loadDataWithPeriod = async () => {
    const fromDate = formatDate(props.startDate);
    const toDate = formatDate(props.endDate);
    
    await fetchData(fromDate, toDate);
  };
  
  // Charger les données au montage
  onMounted(() => {
    loadDataWithPeriod();
  });
  
  // Surveiller les changements de période
  watch([() => props.period, () => props.startDate, () => props.endDate], () => {
    loadDataWithPeriod();
  }, { deep: true });
  
  // Surveiller les changements de données du graphique
  watch([chartData, chartCanvas], () => {
    if (chartInstance) chartInstance.destroy();
    
    if (chartData.value && chartCanvas.value) {
      const ctx = chartCanvas.value.getContext('2d');
      if (ctx) {
        chartInstance = new Chart(ctx, {
          type: 'doughnut',
          data: {
            labels: chartData.value.labels,
            datasets: chartData.value.datasets
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '70%',
            plugins: {
              legend: {
                display: false
              },
              tooltip: {
                backgroundColor: '#ffffff',
                titleColor: '#2c3e50',
                bodyColor: '#34495e',
                borderColor: '#e0e0e0',
                borderWidth: 1,
                cornerRadius: 8,
                displayColors: true,
                callbacks: {
                  label: (context) => {
                    const label = context.label || '';
                    const value = context.parsed;
                    const percentage = chartData.value.percentages[context.dataIndex];
                    return `${label}: ${percentage}% (${value.toLocaleString()})`;
                  }
                }
              }
            },
            elements: {
              arc: {
                borderWidth: 2,
                borderColor: '#ffffff'
              }
            }
          }
        });
      }
    }
  });
  </script>
  
  <style scoped>
  ion-page {
    --background: #ffffff;
  }
  
  ion-content {
    --background: #ffffff;
    --color: #2c3e50;
  }
  
  /* Header de la page */
  .page-header {
    text-align: center;
    margin-bottom: 32px;
    padding: 20px 0;
  }
  
  .main-title {
    font-size: 28px;
    font-weight: 700;
    color: #2c3e50;
    margin: 0 0 8px 0;
    letter-spacing: -0.5px;
  }
  
  .subtitle {
    font-size: 16px;
    color: #7f8c8d;
    margin: 0;
    font-weight: 400;
  }
  
  /* Carte principale */
  .main-card {
    border-radius: 16px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
    border: 1px solid #f1f3f4;
    margin: 0;
    overflow: hidden;
  }
  
  .card-header {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 24px;
  }
  
  .card-title {
    font-size: 20px;
    font-weight: 600;
    margin: 0 0 8px 0;
    color: white;
  }
  
  .card-subtitle {
    display: flex;
    align-items: center;
    gap: 8px;
    margin: 0;
    opacity: 0.9;
  }
  
  .total-label {
    font-size: 14px;
    font-weight: 400;
  }
  
  .total-amount {
    font-size: 18px;
    font-weight: 700;
    background: rgba(255, 255, 255, 0.2);
    padding: 4px 12px;
    border-radius: 20px;
  }
  
  .card-content {
    padding: 32px 24px;
    background: #ffffff;
  }
  
  /* Containers de chargement et erreur */
  .spinner-container {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    height: 300px;
    gap: 16px;
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
  
  .error-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 60px 20px;
    gap: 16px;
  }
  
  .error-icon {
    font-size: 48px;
    color: var(--ion-color-danger);
  }
  
  .error-text {
    font-size: 16px;
    text-align: center;
  }
  
  /* Container principal du graphique */
  .chart-container {
    display: flex;
    flex-direction: column;
    gap: 40px;
  }
  
  .chart-section {
    display: flex;
    justify-content: center;
  }
  
  .chart-wrapper {
    height: 280px;
    width: 100%;
    max-width: 320px;
    position: relative;
  }
  
  /* Section des statistiques */
  .stats-section {
    width: 100%;
  }
  
  .stats-title {
    font-size: 18px;
    font-weight: 600;
    color: #2c3e50;
    margin: 0 0 20px 0;
    text-align: center;
  }
  
  .categories-grid {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  
  .category-card {
    background: #f8f9fa;
    border: 1px solid #e9ecef;
    border-radius: 12px;
    padding: 16px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    transition: all 0.2s ease;
  }
  
  .category-card:hover {
    background: #f1f3f4;
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }
  
  .category-header {
    display: flex;
    align-items: center;
    gap: 12px;
    flex: 1;
  }
  
  .color-indicator {
    display: inline-block;
    width: 14px;
    height: 14px;
    border-radius: 50%;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
  }
  
  .category-name {
    font-size: 15px;
    font-weight: 500;
    color: #2c3e50;
  }
  
  .category-stats {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 2px;
  }
  
  .percentage {
    font-size: 16px;
    font-weight: 700;
    color: #667eea;
  }
  
  .amount {
    font-size: 12px;
    color: #7f8c8d;
    font-weight: 500;
  }
  
  /* Responsive design */
  @media (max-width: 768px) {
    .main-title {
      font-size: 24px;
    }
    
    .card-content {
      padding: 24px 16px;
    }
    
    .chart-wrapper {
      height: 240px;
      max-width: 280px;
    }
    
    .category-card {
      padding: 14px;
    }
  }
  
  @media (min-width: 768px) {
    .categories-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 16px;
    }
    
    .chart-container {
      flex-direction: row;
      align-items: flex-start;
      gap: 48px;
    }
    
    .chart-section {
      flex: 0 0 320px;
    }
    
    .stats-section {
      flex: 1;
    }
    
    .stats-title {
      text-align: left;
    }
  }
  </style>

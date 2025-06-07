import { ref , onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { Preferences } from '@capacitor/preferences';
import { fetchInvoices } from '@/services/Invoices';
import { Invoice, MonthlyRevenue, RevenueAnalysis } from '@/models/InvoicesModel';
import { Chart, registerables } from 'chart.js';
import { getUserCompanies  } from '@/services/User';
import { useUserController } from '@/controllers/UserController';
import { Company } from '@/models/CompanyModel'; 
import { fetchToken, storeCurrentCompany, fetchCurrentCompany } from '@/services/Dashboard';

import { getPaymentsReceived, getPaymentsEmitted } from '@/services/Payment'; // <-- ajoute ceci
Chart.register(...registerables);

let revenueChartInstance: Chart | null = null;

export const useDashboardController = () => {
    const revenueAnalysis = ref<RevenueAnalysis | null>(null);
    const filteredData = ref<MonthlyRevenue[]>([]);
    const loading = ref(false);
    const timePeriod = ref('12m');
    const router = useRouter();

    const forecastChart = ref(null);

    // Paiements
    const receivedPayments = ref([]);
    const emittedPayments = ref([]);
    const totalReceived = ref(0);
    const totalEmitted = ref(0);

    // Factures
    const invoices = ref([]);
    const totalInvoices = ref(0);
    // companies
    const userCompanies = ref<Company[]>([]);
    const selectedCompany = ref('');



    watch(selectedCompany, async (newCompanyId) => {
      if (newCompanyId) {
        await changeCompany(newCompanyId);
        const SavedCompanyId = await Preferences.get({ key: 'current_company_id' });
        const companyId = SavedCompanyId.value;
      console.log("jaw b dhaw : ", companyId);
      }

    });
    
    const changeCompany = async (companyId: string) => {
      try {
        await storeCurrentCompany(companyId);
        selectedCompany.value = companyId; 

        console.log('Selected Company ID:', companyId);
        await loadPayments();
        await loadInvoices();
      } catch (error) {
        console.error('Error changing company:', error);
      }
    };

    const goToCreateCompany = () => {
        router.push('/company/create');
    };

    const loadUserCompanies = async (): Promise<void> => {
      try {
        const { token } = await fetchToken(); 
        await getUserCompanies.fetchAndStoreUserCompanies(token);
        const { ownedCompanies, joinedCompanies } = await getUserCompanies.fetchStoredCompanies();
        console.log('Owned Companies:', ownedCompanies);
        console.log('Joined Companies:', joinedCompanies);
        const uniqueCompanies = Array.from(new Set([
          ...ownedCompanies,
          ...joinedCompanies
        ]));
        console.log('Unique Companies:', uniqueCompanies);
        userCompanies.value = uniqueCompanies;
        const { companyId } = await fetchCurrentCompany();
        selectedCompany.value = companyId;
        console.log('Currently selected company ID:', selectedCompany.value);
      } catch (error) {
        console.error('Failed to load user companies:', error);
      }
    };
  






  // Fonction pour récupérer les paiements
  const loadPayments = async () => {
    try {
      const token = await Preferences.get({ key: 'auth_token' });
      if (!token.value || !selectedCompany.value) return;
      
      const received = await getPaymentsReceived(token.value, selectedCompany.value);
      const emitted = await getPaymentsEmitted(token.value, selectedCompany.value);
  
      if (received.data && received.data.data) {
        receivedPayments.value = received.data.data;
      } else {
        receivedPayments.value = [];
      }
  
      if (emitted.data && emitted.data.data) {
        emittedPayments.value = emitted.data.data;
      } else {
        emittedPayments.value = [];
      }
  
      totalReceived.value = receivedPayments.value.reduce((acc, curr) => acc + parseFloat(curr.amount), 0);
      totalEmitted.value = emittedPayments.value.reduce((acc, curr) => acc + parseFloat(curr.amount), 0);
    } catch (error) {
      console.error('Erreur de chargement des paiements:', error);
    }
  };
  
  // Fonction pour récupérer les factures
  const loadInvoices = async () => {
    try {
      const token = await Preferences.get({ key: 'auth_token' });
      if (!token.value || !selectedCompany.value) return;
  
      const response = await fetchInvoices();
      if (response.data && response.data.data) {
        invoices.value = response.data.data;
        totalInvoices.value = invoices.value.reduce((acc, curr) => acc + parseFloat(curr.amount), 0);
      } else {
        invoices.value = [];
      }
    } catch (error) {
      console.error('Erreur de chargement des factures:', error);
    }
  };
  
  
  // Charger les données au montage du composant


    const loadRevenueData = async () => {
        try {
            loading.value = true;
            const { value: token } = await Preferences.get({ key: 'auth_token' });
            if (!token) throw new Error('Token not found');

            const response = await fetchInvoices();
            const invoices = response.data.data.invoices.data;

            // Process invoice data to get monthly revenue
            const monthlyData = processInvoiceData(invoices);
            filteredData.value = filterDataByTimePeriod(monthlyData, timePeriod.value);

            // Calculate revenue analysis
            revenueAnalysis.value = calculateRevenueAnalysis(monthlyData);
        } catch (error) {
            console.error('Error loading revenue data:', error);
        } finally {
            loading.value = false;
        }
    };

    const processInvoiceData = (invoices: Invoice[]): MonthlyRevenue[] => {
        const monthlyRevenue: Record<string, MonthlyRevenue> = {};

        invoices.forEach(invoice => {
            const date = new Date(invoice.date.split('-').reverse().join('-'));
            const monthYear = `${date.getMonth() + 1}-${date.getFullYear()}`;
            
            if (!monthlyRevenue[monthYear]) {
                monthlyRevenue[monthYear] = {
                    month: monthYear,
                    amount: 0,
                    invoiceCount: 0
                };
            }

            monthlyRevenue[monthYear].amount += invoice.total;
            monthlyRevenue[monthYear].invoiceCount++;
        });

        // Sort by date
        return Object.values(monthlyRevenue).sort((a, b) => {
            const [aMonth, aYear] = a.month.split('-').map(Number);
            const [bMonth, bYear] = b.month.split('-').map(Number);
            return aYear === bYear ? aMonth - bMonth : aYear - bYear;
        });
    };

    const filterDataByTimePeriod = (data: MonthlyRevenue[], period: string): MonthlyRevenue[] => {
        const currentDate = new Date();
        let monthsToShow = 12; // Default to 12 months
        
        if (period === '3m') monthsToShow = 3;
        else if (period === '6m') monthsToShow = 6;

        return data.slice(-monthsToShow);
    };

    const calculateRevenueAnalysis = (data: MonthlyRevenue[]): RevenueAnalysis => {
        if (data.length < 2) {
            return {
                currentMonth: 0,
                previousMonth: 0,
                growthPercentage: 0,
                monthlyTrend: []
            };
        }

        const current = data[data.length - 1];
        const previous = data[data.length - 2];

        const growthPercentage = ((current.amount - previous.amount) / previous.amount) * 100;

        return {
            currentMonth: current.amount,
            previousMonth: previous.amount,
            growthPercentage,
            monthlyTrend: data
        };
    };

    const updateChart = (canvas: HTMLCanvasElement) => {
        if (revenueChartInstance) {
            revenueChartInstance.destroy();
        }

        const labels = filteredData.value.map(item => {
            const [month, year] = item.month.split('-');
            const monthNames = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];
            return `${monthNames[parseInt(month) - 1]} ${year}`;
        });

        const data = filteredData.value.map(item => item.amount);

        revenueChartInstance = new Chart(canvas, {
            type: 'line',
            data: {
                labels,
                datasets: [{
                    label: 'Chiffre d\'affaires (TND)',
                    data,
                    backgroundColor: 'rgba(78, 115, 223, 0.05)',
                    borderColor: 'rgba(78, 115, 223, 1)',
                    pointBackgroundColor: 'rgba(78, 115, 223, 1)',
                    pointBorderColor: '#fff',
                    pointHoverBackgroundColor: '#fff',
                    pointHoverBorderColor: 'rgba(78, 115, 223, 1)',
                    borderWidth: 2,
                    pointRadius: 4,
                    pointHoverRadius: 6,
                    fill: true,
                    tension: 0.3
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        callbacks: {
                            label: (context) => {
                                const index = context.dataIndex;
                                const invoiceCount = filteredData.value[index].invoiceCount;
                                return [
                                    `CA: ${context.parsed.y.toFixed(2)} TND`,
                                    `Factures: ${invoiceCount}`
                                ];
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: (value) => `${value} TND`
                        }
                    }
                }
            }
        });
    };
    onMounted(async () => {
        try {
          await loadUserProfile();
          await loadUserCompanies();
        } catch (error) {
          console.error("Erreur lors du chargement:", error);
        }
      });
      
      // Mettre à jour le graphique lorsque les factures changent
      watch(invoices, () => {
        updateChart();
      });
      
      const{
        loadUserProfile,
      }=useUserController();

    return {
        revenueAnalysis,
        filteredData,
        loading,
        timePeriod,
        totalEmitted,
        totalInvoices,
        totalReceived,
        userCompanies,
        selectedCompany,
        loadUserCompanies,
        loadRevenueData,
        updateChart,
        goToCreateCompany,
        changeCompany,


    };
};

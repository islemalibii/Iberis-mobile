import { ref, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { Preferences } from '@capacitor/preferences';
import { getUserCompanies } from '@/services/User';
import { useUserController } from '@/controllers/UserController';
import { Company } from '@/models/CompanyModel';
import { fetchToken, storeCurrentCompany, fetchCurrentCompany } from '@/services/Dashboard';
import { getTotalPayments } from '@/services/PaymentServicedashboard';

export const useDashboardController = () => {
    const router = useRouter();
    
    // Paiements
    const receivedPayments = ref([]);
    const emittedPayments = ref([]);
    const totalReceived = ref(0);
    const totalEmitted = ref(0);
    const loading = ref(false);

    // Entreprises
    const userCompanies = ref<Company[]>([]);
    const selectedCompany = ref('');

    // Période
    const selectedPeriod = ref('thisYear');
    const customStartDate = ref('');
    const customEndDate = ref('');

    // Watch for changes in company and period selection
    watch([selectedCompany, selectedPeriod, customStartDate, customEndDate], async () => {
      if (selectedCompany.value) {
        await loadPayments();
      }
    });

    const loadPayments = async () => {
      try {
        loading.value = true;
        
        const token = await Preferences.get({ key: 'auth_token' });
        if (!token.value || !selectedCompany.value) {
          console.warn('No token or company selected');
          return;
        }

        const { startDate, endDate } = getCurrentDateRange();

        const { totalReceived: received, totalEmitted: emitted } = await getTotalPayments(
          selectedCompany.value,
          startDate,
          endDate
        );

        totalReceived.value = received || 0;
        totalEmitted.value = emitted || 0;

      } catch (error) {
        console.error('Error loading payments:', error);
        // Reset values on error
        totalReceived.value = 0;
        totalEmitted.value = 0;
      } finally {
        loading.value = false;
      }
    };

    const getCurrentDateRange = () => {
      const now = new Date();
      let startDate = '';
      let endDate = '';

      switch (selectedPeriod.value) {
        case 'today':
          startDate = endDate = now.toISOString().split('T')[0];
          break;
        case 'thisMonth':
          startDate = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
          endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];
          break;
        case 'thisYear':
          startDate = new Date(now.getFullYear(), 0, 1).toISOString().split('T')[0];
          endDate = new Date(now.getFullYear(), 11, 31).toISOString().split('T')[0];
          break;
        case 'custom':
          startDate = customStartDate.value;
          endDate = customEndDate.value;
          break;
        default:
          startDate = new Date(now.getFullYear(), 0, 1).toISOString().split('T')[0];
          endDate = now.toISOString().split('T')[0];
      }

      return { startDate, endDate };
    };

    const changeCompany = async (companyId: string) => {
      try {
        await storeCurrentCompany(companyId);
        selectedCompany.value = companyId;
        await loadPayments();
      } catch (error) {
        console.error('Error changing company:', error);
      }
    };

    const goToCreateCompany = () => {
        router.push('/create-company');
    };

    const loadUserCompanies = async (): Promise<void> => {
      try {
        const { token } = await fetchToken(); 
        await getUserCompanies.fetchAndStoreUserCompanies(token);
        const { ownedCompanies, joinedCompanies } = await getUserCompanies.fetchStoredCompanies();
        
        const uniqueCompanies = Array.from(new Set([
          ...ownedCompanies,
          ...joinedCompanies
        ]));
        
        userCompanies.value = uniqueCompanies;
        const { companyId } = await fetchCurrentCompany();
        selectedCompany.value = companyId;
        
        // Load payments after setting the company
        if (companyId) {
          await loadPayments();
        }
      } catch (error) {
        console.error('Failed to load user companies:', error);
      }
    };

    onMounted(async () => {
      try {
        const { loadUserProfile } = useUserController();
        await loadUserProfile();
        await loadUserCompanies();
      } catch (error) {
        console.error("Erreur lors du chargement:", error);
      }
    });

    return {
        loading,
        totalEmitted,
        totalReceived,
        userCompanies,
        selectedCompany,
        selectedPeriod,
        customStartDate,
        customEndDate,
        loadUserCompanies,
        goToCreateCompany,
        changeCompany,
        loadPayments,
        getCurrentDateRange
    }; 
};
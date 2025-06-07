import axios from 'axios';
import { Preferences } from '@capacitor/preferences';

const API_BASE_URL = 'https://preprod-api.iberis.io/fr/api/private'

export const fetchToken = async () => {
  const Savedtoken = await Preferences.get({ key: 'auth_token' });
  const token = Savedtoken.value;
  if (!token) {
    throw new Error('Missing token');
  }
  return { token }; 
};
export const fetchCurrentCompany = async () => {
  const SavedCompanyId = await Preferences.get({ key: 'current_company_id' });
  const companyId = SavedCompanyId.value;
  if (!companyId) {
    throw new Error('Missing company ID');
  }
  return { companyId }; 
};
export const storeCurrentCompany = async (companyId: string): Promise<void> => {
  try {
    await Preferences.set({
      key: 'current_company_id', 
      value: companyId,          
    });
    console.log('Company ID saved:', companyId); 
  } catch (error) {
    console.error('Error storing company ID:', error);
  }
};

export const fetchTokenAndCompanyid = async () =>{
    const Savedtoken = await Preferences.get({ key: 'auth_token' });
    const SavedCompanyId = await Preferences.get({ key: 'current_company_id' });
    const token = Savedtoken.value;
    const companyId = SavedCompanyId.value;
    if (!token || !companyId) {
      throw new Error('Missing token or company ID');
    }
    return { token, companyId };
  };


const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

apiClient.interceptors.response.use(
  response => response,
  error => {
    console.error('API Error:', error);
    throw error;
  }
);
export default {


  // Récupérer les données de l'entreprise
  async getCompanyData(companyId: string) {
    try {
        const { token } = await fetchTokenAndCompanyid();
        const response = await apiClient.get(`/company/${companyId}`, {
          headers: {
            'Authorization': `Bearer ${token}` 
          }
        });
    
        return response.data; 
      } catch (error) {
        console.error("Error fetching company data:", error);
        throw error; 
      }
  },




  // Récupérer les paiements reçus
  async getReceivedPayments(companyId: string) {
    const response = await apiClient.get(`/company/${companyId}/sales/payments`);
    return response.data;
  },

  // Récupérer les paiements émis
  async getSentPayments(companyId: string) {
    const response = await apiClient.get(`/company/${companyId}/purchases/payments`);
    return response.data;
  },

  // Récupérer les factures
  async getInvoices(companyId: string, period: string = '6m') {
    const response = await apiClient.get(`/company/${companyId}/sales/invoices`);
    return response.data;
  },

  // Récupérer les devis
  async getEstimates(companyId: string) {
    const response = await apiClient.get(`/company/${companyId}/sales/estimates`);
    return response.data;
  },

  // Récupérer les bons de livraison
  async getDeliveryNotes(companyId: string) {
    const response = await apiClient.get(`/company/${companyId}/sales/deliveries`);
    return response.data;
  },

  // Récupérer les catégories de dépenses
  async getExpenseCategories(companyId: string) {
    const response = await apiClient.get(`/company/${companyId}/purchases/expense/categories/list`);
    return response.data;
  },

  // Récupérer les entreprises de l'utilisateur
}
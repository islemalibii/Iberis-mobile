import axios from 'axios';
import { Preferences } from '@capacitor/preferences';
import { providerFromJson, Provider, ProviderRequest, ProviderType, ProviderTitle } from '@/models/providerModel';
import { DisplayNameType } from '@/models/ClientModel';

const API_BASE_URL = 'https://preprod-api.iberis.io';

const getAuthHeaders = (token: string) => ({
  Authorization: `Bearer ${token}`,
});

const handleApiError = (error: any, context: string) => {
  console.error(`Erreur lors du ${context}:, error`);
  
  let errorMessage =` Échec du ${context}`;
  if (error.response && error.response.data && error.response.data.status) {
    errorMessage = error.response.data.status.message || errorMessage;
  }
  
  throw new Error(errorMessage);
};

export const fetchTokenAndCompanyId = async () => {
  const Savedtoken = await Preferences.get({ key: 'auth_token' });
  const SavedCompanyId = await Preferences.get({ key: 'current_company_id' });
  const token = Savedtoken.value;
  const companyId = SavedCompanyId.value;

  if (!token || !companyId) {
    throw new Error('Identifiants de session manquants. Veuillez vous reconnecter.');
  }

  console.log('Fetching with token and companyId:', { token: token, companyId: companyId });
  return { token, companyId };
};

export const getProvidersList = async (
  lang: 'fr' | 'en' | 'ar' = 'fr'
): Promise<Provider[]> => {
  try {
    const { token, companyId } = await fetchTokenAndCompanyId();
    
    const response = await axios.get(
      `${API_BASE_URL}/${lang}/api/private/company/${companyId}/providers/list`, 
      {
        headers: getAuthHeaders(token),
      }
    );
    
    console.log('API Response:', response.data);
    
    if (response.data.status && response.data.status.code >= 400) {
      throw new Error(response.data.status.message || 'Erreur lors du chargement des fournisseurs');
    }
    
    return response.data.data.providers.data.map(providerFromJson);
  
  } catch (error: any) {
    handleApiError(error, 'chargement des fournisseurs');
    return []; 
  }
};export const addProviderService = async (providerData: Omit<ProviderRequest, 'token'>): Promise<Provider> => {
  try {
    const { token, companyId } = await fetchTokenAndCompanyId();

    // Validation des champs obligatoires
    const requiredFields = {
      first_name: providerData.first_name,
      title: providerData.title,
      type: providerData.type,
      display_name: providerData.display_name,
      hashed_activity_id: providerData.hashed_activity_id,
      hashed_currency_id: providerData.hashed_currency_id,
    };

    const missingFields = Object.entries(requiredFields)
      .filter(([_, value]) => !value)
      .map(([key]) => key);

    if (missingFields.length > 0) {
      throw new Error(`Champs obligatoires manquants: ${missingFields.join(', ')}`);
    }

    // Préparation du payload
    const payload: any = {
      token,
      first_name: providerData.first_name,
      last_name: providerData.last_name,
      display_name: providerData.display_name,
      type: providerData.type,
      title: providerData.title,
      company: providerData.company || '',
      activity_id: providerData.hashed_activity_id,
      currency_id: providerData.hashed_currency_id,
      price_list_id: providerData.hashed_default_items_price_list_id || 'RNmlK',
      deadline_id: providerData.hashed_default_invoice_deadline_id || 'JLZnW',
      bill_country: providerData.billing?.country_id || 'TN',
      email: providerData.email || '',
      phone: providerData.phone || '',
      website: providerData.website || '',
      reference: providerData.reference || '',
      note: providerData.note || '',
      fiscal_id: providerData.fiscal_id || '',
      personal_id: providerData.personal_id || ''
    };

    // Gestion des adresses
    if (providerData.billing) {
      payload.bill_address = providerData.billing.address || '';
      payload.bill_state = providerData.billing.bill_state || '';
      payload.bill_zip = providerData.billing.zip_code || '';
    }

    if (providerData.delivery) {
      payload.delivery_address = providerData.delivery.address || '';
      payload.delivery_state = providerData.delivery.bill_state || '';
      payload.delivery_zip = providerData.delivery.zip_code || '';
      payload.delivery_country = providerData.delivery.country_id || 'TN';
    }

    const response = await axios.post(
      `${API_BASE_URL}/fr/api/private/company/${companyId}/provider/new`,
      payload,
      { 
        headers: {
          ...getAuthHeaders(token),
          'Content-Type': 'application/json'
        }
      }
    );

    if (response.data.status?.code !== 200) {
      throw new Error(response.data.status?.message || 'Erreur lors de la création du fournisseur');
    }

    return providerFromJson(response.data.data.provider);
  } catch (error: any) {
    let errorMessage = 'Échec de la création du fournisseur';
    
    if (error.response?.data?.status?.message) {
      errorMessage = error.response.data.status.message;
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    throw new Error(errorMessage);
  }

};
export const getProviderDetails = async (
  providerId: string,
  lang: 'fr' | 'en' | 'ar' = 'fr'
): Promise<Provider> => {
  try {
    const { token, companyId } = await fetchTokenAndCompanyId();
    
    const response = await axios.get(
      `${API_BASE_URL}/${lang}/api/private/company/${companyId}/provider/${providerId}/synthesis`,
      {
        headers: getAuthHeaders(token),
      }
    );
    
    if (response.data.status && response.data.status.code >= 400) {
      throw new Error(response.data.status.message || 'Erreur lors du chargement du fournisseur');
    }
    
    return providerFromJson(response.data.data.provider);
  } catch (error: any) {
    handleApiError(error, 'chargement du fournisseur');
    throw error;
  }
};

export const deleteProviderService = async (
  providerId: string,
  lang: 'fr' | 'en' | 'ar' = 'fr'
): Promise<{ 
  success: boolean; 
  message: string;
  isUsedElsewhere: boolean;
}> => {
  try {
    const { token, companyId } = await fetchTokenAndCompanyId();

    const response = await axios.get(
      `${API_BASE_URL}/${lang}/api/private/company/${companyId}/provider/${providerId}/delete`,
      {
        headers: getAuthHeaders(token),
        validateStatus: () => true // Accepter tous les statuts
      }
    );

    console.log('Delete API response:', response.data);

    // Cas spécifique où le fournisseur est utilisé
    if (response.data.message?.includes('utilisé et ne peut pas être supprimé')) {
      return {
        success: false,
        message: response.data.message,
        isUsedElsewhere: true
      };
    }

    const isSuccess = response.status === 200 && 
                     !response.data.message?.includes('ne peut pas être supprimé');

    return {
      success: isSuccess,
      message: response.data?.message || (isSuccess 
        ? 'Fournisseur supprimé avec succès' 
        : 'Échec de la suppression'),
      isUsedElsewhere: false
    };
  } catch (error: any) {
    console.error('Delete error:', error);
    return {
      success: false,
      message: error.response?.data?.message || error.message || 'Erreur réseau',
      isUsedElsewhere: false
    };
  }
};export const updateProviderService = async (
  providerId: string, 
  data: Partial<ProviderRequest>
): Promise<Provider> => {
  try {
    const { token, companyId } = await fetchTokenAndCompanyId();

    const payload = {
      token,
      first_name: data.first_name || '',
      last_name: data.last_name || '',
      company: data.company || '',
      display_name: data.display_name || DisplayNameType.FIRSTNAME_LASTNAME,
      type: data.type || ProviderType.PROFESSIONAL,
      title: data.title || ProviderTitle.MR,
      email: data.email || '',
      phone: data.phone || '',
      website: data.website || '',
      reference: data.reference || '',
      note: data.note || '',
      fiscal_id: data.fiscal_id || '',
      activity_id: data.hashed_activity_id || '',
      currency_id: data.hashed_currency_id || '',
      price_list_id: 'RNmlK', // Valeur par défaut obligatoire
      deadline_id: data.hashed_default_invoice_deadline_id || 'JLZnW', // Valeur par défaut
      bill_address: data.billing?.address || '',
      bill_state: data.billing?.bill_state || '',
      bill_zip: data.billing?.zip_code || '',
      bill_country: data.billing?.country_id || 'TN',
      delivery_address: data.delivery?.address || '',
      delivery_state: data.delivery?.bill_state || '',
      delivery_zip: data.delivery?.zip_code || '',
      delivery_country: data.delivery?.country_id || 'TN'
    };

    console.log('Payload complet envoyé:', payload);

    const response = await axios.post(
      `${API_BASE_URL}/fr/api/private/company/${companyId}/provider/${providerId}/edit`,
      payload,
      { 
        headers: {
          ...getAuthHeaders(token),
          'Content-Type': 'application/json'
        }
      }
    );

    if (response.data.status?.code !== 200) {
      throw new Error(response.data.status?.message || 'Erreur lors de la mise à jour du fournisseur');
    }

    return providerFromJson(response.data.data.provider);
  } catch (error: any) {
    console.error('Erreur détaillée:', {
      message: error.message,
      response: error.response?.data,
      config: error.config,
      stack: error.stack
    });
    
    throw new Error(error.response?.data?.message || 
                   error.response?.data?.status?.message || 
                   'Échec de la mise à jour du fournisseur');
  }
};
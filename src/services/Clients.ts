import axios from 'axios';
import { Client, clientFromJson, ClientRequest, ClientResponse, Currency, Activity, PaymentTerm, DisplayNameType, ClientTitle, ClientType } from '@/models/ClientModel';
import { Preferences } from '@capacitor/preferences';

const API_BASE_URL = 'https://preprod-api.iberis.io';

const getAuthHeaders = (token: string) => ({
  Authorization: `Bearer ${token}`,
});

const handleApiError = (error: unknown, context: string): never => {
  if (axios.isAxiosError(error)) {
    const message = error.response?.data?.status?.message || error.message;
    console.error(`Erreur API lors du ${context}:`, message);
    throw new Error(`Échec du ${context}: ${message}`);
  }
  console.error(`Erreur inconnue lors du ${context}:`, error);
  throw new Error(`Échec critique lors du ${context}`);
};

export const fetchTokenAndCompanyId = async () => {
  const { value: token } = await Preferences.get({ key: 'auth_token' });
  const { value: companyId } = await Preferences.get({ key: 'current_company_id' });

  if (!token || !companyId) {
    throw new Error('Session expirée. Veuillez vous reconnecter.');
  }

  return { token, companyId };
};

export const fetchPaymentTerms = async (companyId: string): Promise<PaymentTerm[]> => {
  try {
    const { token } = await fetchTokenAndCompanyId();
    
    const response = await axios.get(
      `${API_BASE_URL}/fr/api/private/company/${companyId}/deadlines`,
      { headers: getAuthHeaders(token) }
    );

    return response.data?.data?.invoiceDeadlines?.map((term: any) => ({
      hashed_id: term.hashed_id,
      title: term.title,
      days: term.days,
      created_at: term.created_at,
      updated_at: term.updated_at,
      hashed_company_id: term.hashed_company_id
    })) || [];
  } catch (error) {
    return handleApiError(error, 'chargement des conditions de paiement');
  }
};

export const getClientDetails = async (clientId: string): Promise<Client> => {
  try {
    const { token, companyId } = await fetchTokenAndCompanyId();

    const response = await axios.get(
      `${API_BASE_URL}/fr/api/private/company/${companyId}/client/${clientId}/synthesis`,
      { headers: getAuthHeaders(token) }
    );

    const client = clientFromJson(response.data.data.client);
    return client;
  } catch (error) {
    return handleApiError(error, 'récupération du client');
  }
};

export const updateClientService = async (
  clientId: string, 
  data: Partial<ClientRequest>
): Promise<Client> => {
  try {
    const { token, companyId } = await fetchTokenAndCompanyId();

    const payload = {
      token,
      first_name: data.first_name || '',
      last_name: data.last_name || '',
      organisation: data.organisation || '', 
      display_name: data.display_name || DisplayNameType,
      type: data.type || ClientType,
      title: data.title || ClientTitle,
      email: data.email || '',
      phone: data.phone || '',
      website: data.website || '',
      reference: data.reference || '',
      note: data.note || '',
      fiscal_id: data.fiscal_id || '',
      personal_id: data.personal_id || '',
      activity_id: data.hashed_activity_id || '',
      currency_id: data.hashed_currency_id || '',
      price_list_id: data.price_list_id || 'RNmlK', // Valeur par défaut obligatoire
      deadline_id: data.hashed_default_invoice_deadline_id || 'JLZnW', // Valeur par défaut
      bill_address: data.billing?.address || '',
      bill_state: data.billing?.bill_state || '',
      bill_zip: data.billing?.zip_code || '',
      bill_country: data.billing?.country_id || 'TN',
      delivery_address: data.delivery?.address || '',
      delivery_state: data.delivery?.bill_state || '',
      delivery_zip: data.delivery?.zip_code || '',
      delivery_country: data.delivery?.country_id || 'TN',
      hashed_company_id: data.hashed_company_id || '',
      hashed_default_items_price_list_id: data.hashed_default_items_price_list_id || ''
    };

    const response = await axios.post(
      `${API_BASE_URL}/fr/api/private/company/${companyId}/client/${clientId}/edit`,
      payload,
      { 
        headers: {
          ...getAuthHeaders(token),
          'Content-Type': 'application/json'
        }
      }
    );

    if (response.data.status?.code !== 200) {
      throw new Error(response.data.status?.message || 'Erreur lors de la mise à jour du client');
    }

    return clientFromJson(response.data.data.client);
  } catch (error: any) {
    console.error('Erreur détaillée:', {
      message: error.message,
      response: error.response?.data,
      config: error.config,
      stack: error.stack
    });
    
    throw new Error(error.response?.data?.message || 
                   error.response?.data?.status?.message || 
                   'Échec de la mise à jour du client');
  }
};
export const addClient = async (clientData: Omit<ClientRequest, 'token'|'hashed_company_id'>): Promise<Client> => {
  try {
    const { token, companyId } = await fetchTokenAndCompanyId();
    
    const requiredFields = {
      first_name: clientData.first_name,
      title: clientData.title,
      type: clientData.type,
      display_name: clientData.display_name,
      hashed_activity_id: clientData.hashed_activity_id,
      hashed_currency_id: clientData.hashed_currency_id,
    };
    
    const missingFields = Object.entries(requiredFields)
      .filter(([_, value]) => !value)
      .map(([key]) => key);

    if (missingFields.length > 0) {
      throw new Error(`Champs obligatoires manquants: ${missingFields.join(', ')}`);
    }

    // Validation spécifique pour le display_name de type entreprise
    if (clientData.display_name === DisplayNameType.COMPANY && !clientData.organisation) {
      throw new Error("Le nom de l'entreprise est obligatoire lorsque vous choisissez d'afficher par entreprise");
    }

    // Préparation du payload
    const payload: any = {
      token,
      first_name: clientData.first_name,
      last_name: clientData.last_name,
      display_name: clientData.display_name,    
      type: clientData.type,
      title: clientData.title,
      organisation: clientData.organisation, 
      activity_id: clientData.hashed_activity_id,
      currency_id: clientData.hashed_currency_id,
      price_list_id: clientData.hashed_default_items_price_list_id || 'RNmlK',
      deadline_id: clientData.hashed_default_invoice_deadline_id || 'JLZnW',
      bill_country: clientData.billing?.country_id || 'TN',
      email: clientData.email || '',
      phone: clientData.phone || '',
      website: clientData.website || '',
      reference: clientData.reference || '',
      note: clientData.note || '',
      fiscal_id: clientData.fiscal_id || '',
      personal_id: clientData.personal_id || ''
    };

    // Gestion des adresses
    if (clientData.billing) {
      payload.bill_address = clientData.billing.address || '';
      payload.bill_state = clientData.billing.bill_state || '';
      payload.bill_zip = clientData.billing.zip_code || '';
    }

    if (clientData.delivery) {
      payload.delivery_address = clientData.delivery.address || '';
      payload.delivery_state = clientData.delivery.bill_state || '';
      payload.delivery_zip = clientData.delivery.zip_code || '';
      payload.delivery_country = clientData.delivery.country_id || 'TN';
    }

    // AFFICHAGE DES DONNÉES ENVOYÉES DANS LA CONSOLE
    console.log("======= DONNÉES ENVOYÉES À L'API =======");
    console.log("Endpoint:", `${API_BASE_URL}/fr/api/private/company/${companyId}/client/new`);
    console.log("Méthode: POST");
    console.log("Headers:", {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
    console.log("Payload complet:", JSON.stringify(payload, null, 2));
    console.log("========================================");

    const response = await axios.post<ClientResponse>(
      `${API_BASE_URL}/fr/api/private/company/${companyId}/client/new`,
      payload,
      { 
        headers: {
          ...getAuthHeaders(token),
          'Content-Type': 'application/json'
        }
      }
    );

    console.log("======= RÉPONSE DE L'API =======");
    console.log("Status:", response.status);
    console.log("Data:", response.data);
    console.log("================================");

    if (response.data.status?.code !== 200) {
      throw new Error(response.data.status?.message || 'Erreur lors de la création du client');
    }
    return clientFromJson(response.data.data.client);
  } catch (error) {
    console.error("======= ERREUR D'ENVOI =======");
    console.error("Erreur complète:", error);
    
    if (axios.isAxiosError(error)) {
      console.error("Réponse d'erreur:", error.response?.data);
    }
    
    console.error("==============================");
    return handleApiError(error, 'création du client');
  }
};

export const fetchActivities = async (): Promise<Activity[]> => {
  try {
    const { token } = await fetchTokenAndCompanyId();
    
    const response = await axios.get<{ data: { activities: Activity[] } }>(
      `${API_BASE_URL}/fr/api/private/general/activities`,
      { headers: getAuthHeaders(token) }
    );

    return response.data.data.activities;
  } catch (error) {
    return handleApiError(error, 'chargement des activités');
  }
};

export const fetchCurrencies = async (): Promise<Currency[]> => {
  try {
    const { token } = await fetchTokenAndCompanyId();
    
    const response = await axios.get<{ data: { currencies: Currency[] } }>(
      `${API_BASE_URL}/fr/api/private/general/currencies`,
      { headers: getAuthHeaders(token) }
    );

    return response.data.data.currencies;
  } catch (error) {
    return handleApiError(error, 'chargement des devises');
  }
};

export const getClientsList = async (): Promise<Client[]> => {
  try {
    const { token, companyId } = await fetchTokenAndCompanyId();

    const response = await axios.get(
      `${API_BASE_URL}/fr/api/private/company/${companyId}/clients/list`,
      { headers: getAuthHeaders(token) }
    );

    return response.data.data.clients.data.map(clientFromJson);
  } catch (error) {
    return handleApiError(error, 'chargement des clients');
  }
};

export const deleteClient = async (clientId: string): Promise<{ success: boolean; message?: string }> => {
  try {
    const { token, companyId } = await fetchTokenAndCompanyId();
    
    const response = await axios.get(
      `${API_BASE_URL}/fr/api/private/company/${companyId}/client/${clientId}/delete`,
      { 
        headers: getAuthHeaders(token),
        validateStatus: (status) => status === 200 || status === 404
      }
    );

    if (response.status === 404) {
      return { success: false, message: 'Client non trouvé' };
    }
    
    return { success: response.data?.status?.code === 200 };
  } catch (error) {
    const message = axios.isAxiosError(error) 
      ? error.response?.data?.status?.message || error.message
      : 'Erreur lors de la suppression';
    
    return { success: false, message };
  }
};
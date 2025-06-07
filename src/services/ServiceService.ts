import axios from 'axios';
import { Preferences } from '@capacitor/preferences';
import { ServicePurchase } from '@/models/Services';

const API_BASE_URL = 'https://preprod-api.iberis.io';

export const fetchTokenAndCompanyid = async () => {
  const Savedtoken = await Preferences.get({ key: 'auth_token' });
  const SavedCompanyId = await Preferences.get({ key: 'current_company_id' });
  const token = Savedtoken.value;
  const companyId = SavedCompanyId.value;

  if (!token || !companyId) {
    throw new Error('Missing token or company ID');
  }

  return { token, companyId };
};

export const fetchClientServices = async (clientId: string): Promise<ServicePurchase[]> => {
  if (!clientId) throw new Error('ID client invalide ou manquant');

  const { token, companyId } = await fetchTokenAndCompanyid();

  try {
    const response = await axios.get(
      `${API_BASE_URL}/fr/api/private/company/${companyId}/purchases/services/list`,
      {
        headers: { Authorization: `Bearer ${token}` },
        params: { contact_id: clientId }
      }
    );

    if (!response.data?.data?.services?.data) {
      throw new Error('Invalid response structure');
    }
    return response.data.data.services.data;
  } catch (error) {
    console.error('Error fetching services:', error);
    throw new Error('Failed to fetch services');
  }
};

export const deleteService = async (serviceId: string) => {
  const { token, companyId } = await fetchTokenAndCompanyid();  
  const response = await axios.get(
    `${API_BASE_URL}/fr/api/private/company/${companyId}/purchases/service/${serviceId}/delete`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return response.data.success; 
};

export const downloadService = async (serviceId: string): Promise<boolean> => {
  const { token, companyId } = await fetchTokenAndCompanyid();  
  try {
    const response = await axios.get(
      `${API_BASE_URL}/fr/api/private/company/${companyId}/purchases/service/${serviceId}/download`,
      {
        responseType: 'blob',
        headers: { Authorization: `Bearer ${token}` }
      }
    );
    
    const filename = response.headers['content-disposition']
      ?.split('filename=')[1]
      ?.replace(/["']/g, '') || `service_${serviceId}.pdf`;

    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    link.parentNode?.removeChild(link);
    window.URL.revokeObjectURL(url);
    
    return true;
  } catch (error) {
    console.error('Download failed:', error);
    throw new Error('Échec du téléchargement du service');
  }
};

export const validateService = async (serviceId: string) => {
  const { token, companyId } = await fetchTokenAndCompanyid();
  
  try {
    const response = await axios.get(
      `${API_BASE_URL}/fr/api/private/company/${companyId}/purchases/service/${serviceId}/mark`,
  
    {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                data: { token } // Le token dans le body comme dans votre test Postman
            }
        );
    
    return {
      success: true,
      message: response.data?.status?.message || 'Service validé avec succès',
      status: response.data.status
    };
  } catch (error) {
    console.error('Validation error:', error);
    return {
      success: false,
      message: axios.isAxiosError(error) 
        ? error.response?.data?.error?.message || 'Erreur lors de la validation'
        : 'Erreur inconnue',
      status: error.response?.status || 500
    };
  }
};
export const duplicateService = async (
  originalService: ServicePurchase
): Promise<{ success: boolean; message: string; newService?: ServicePurchase }> => {
  const { token, companyId } = await fetchTokenAndCompanyid();

  try {
    if (!originalService?.hashed_id) {
      throw new Error("ID du service invalide");
    }

    console.log("Duplication en cours pour:", originalService.hashed_id);

    const url = `${API_BASE_URL}/fr/api/private/company/${companyId}/purchases/service/${originalService.hashed_id}/duplicate`;
    
    const response = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      timeout: 15000,
    });

    console.log("Réponse de duplication:", response.data);

    if (response.data?.status?.code === 200) {
      const newService = response.data?.data?.Service;
      return {
        success: true,
        message: `Duplicata ${newService?.hashed_id || ''} créé avec succès`,
        newService: newService,
      };
    }
    
    throw new Error(response.data?.status?.message || "Erreur lors de la duplication");

  } catch (error: any) {
    console.error("Erreur lors de la duplication:", error);
    let errorMessage = "Erreur technique lors de la duplication";

    if (error.response) {
      switch (error.response.status) {
        case 400:
          errorMessage = "Données invalides";
          break;
        case 401:
          errorMessage = "Non autorisé - Veuillez vous reconnecter";
          break;
        case 403:
          errorMessage = "Accès refusé";
          break;
        case 404:
          errorMessage = "Service source introuvable";
          break;
        case 501:
          errorMessage = "Limite de duplication atteinte";
          break;
        default:
          errorMessage = error.response.data?.status?.message || "Erreur inconnue";
      }
    } else if (error.request) {
      errorMessage = "Pas de réponse du serveur";
    } else {
      errorMessage = error.message;
    }

    return {
      success: false,
      message: errorMessage,
    };
  }
};
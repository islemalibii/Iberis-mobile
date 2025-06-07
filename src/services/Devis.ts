import axios from 'axios';
import { Preferences } from '@capacitor/preferences';
import { Discount, ItemTax, EstimateItem, Estimate, AddEstimateForm, AdditionalInput } from '@/models/DevisModel';

const API_URL = 'https://preprod-api.iberis.io';

// Fonction utilitaire pour récupérer token et companyId
const fetchTokenAndCompanyId = async () => {
  const token = (await Preferences.get({ key: 'auth_token' })).value;
  const companyId = (await Preferences.get({ key: 'current_company_id' })).value;
  
  if (!token || !companyId) {
    throw new Error('Token ou ID de société manquant');
  }
  
  return { token, companyId };
};

export const fetchClientEstimates = async (clientId: string): Promise<Estimate[]> => {
  if (!clientId) throw new Error('ID client requis');

  const { token, companyId } = await fetchTokenAndCompanyId();  
    
  try {
    const response = await axios.get(
      `${API_URL}/fr/api/private/company/${companyId}/sales/estimates`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    if (!response.data?.data?.estimates?.data) {
      throw new Error('Structure de réponse invalide');
    }

    return response.data.data.estimates.data.filter(estimate => 
      estimate.hashed_contact_id === clientId || 
      estimate.client?.hashed_id === clientId
    );

  } catch (error) {
    console.error('Erreur récupération devis:', error);
    throw new Error('Échec récupération devis');
  }
};

export const fetchEstimateDetails = async (estimateId: string) => {
  try {
    const { token, companyId } = await fetchTokenAndCompanyId();
  
    const response = await axios.get(
      `${API_URL}/fr/api/private/company/${companyId}/sales/estimate/${estimateId}/synthesis`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    if (!response.data?.data?.estimate) {
      throw new Error('Devis non trouvé dans la réponse API');
    }

    return response.data;

  } catch (error: any) {
    console.error('Erreur détails devis:', error);
    throw error;
  }
};



export const updateEstimate = async (
  estimateId: string,
  formData: AddEstimateForm
): Promise<{
  success: boolean;
  message: string;
  updatedEstimate?: Estimate;
}> => {
  const { token, companyId } = await fetchTokenAndCompanyId();

  try {
    const apiFormData = new FormData();

    // 1. Champs obligatoires de base selon la documentation de l'API
    const requiredFields = {
      date: formData.date || new Date().toISOString().split('T')[0],
      due: formData.due || new Date().toISOString().split('T')[0],
      estimate_number: formData.estimate_number?.split('-').pop()?.padStart(5, '0') || '00001',
      tax_type: formData.tax_type || 1,
      use_conditions: formData.use_conditions ? 1 : 0,
      client_id: formData.client_id,
      currency_rate: formData.currency_rate || 1,
      language: formData.language || 'fr',
      choice: formData.choice || 0, // 0 = Brouillon par défaut
      hashed_invoice_category_id: formData.category, // Assurez-vous que ce champ existe dans votre formData
      naming_series_dynamic: 1, // Ajout car présent dans l'exemple Postman
      show_stamp: formData.show_stamp ? 1 : 0,
      show_billing: formData.show_billing ? 1 : 0,
      show_delivery: formData.show_delivery ? 1 : 0,
      show_bank: formData.show_bank ? 1 : 0,
      show_conditions: formData.show_conditions ? 1 : 0,
      show_description: formData.show_description ? 1 : 0,
      show_pictures: formData.show_pictures ? 1 : 0,
      show_unity: formData.show_unity ? 1 : 0,
      show_ttc: formData.showArticleTTCPrices ? 1 : 0
    };

    // Ajout des champs obligatoires
    Object.entries(requiredFields).forEach(([key, value]) => {
      apiFormData.append(key, value?.toString() || '');
    });

    // 2. Champs optionnels avec validation
    const optionalFields = {
      object: formData.object,
      reference_number: formData.referenceNumber,
      notes: formData.notes,
      conditions: formData.generalTerms,
      bank_id: formData.selected_bank,
      discount: formData.discount || 0
    };

    Object.entries(optionalFields).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        apiFormData.append(key, value.toString());
      }
    });

    // 3. Articles - Format correct pour FormData
    if (!formData.items?.length) {
      return {
        success: false,
        message: 'Au moins un article est requis'
      };
    }
    
    formData.items.forEach((item, index) => {
      // Ajouter chaque champ d'article individuellement dans le FormData
      apiFormData.append(`items[${index}][item_hashed_id]`, item.id || '');
      apiFormData.append(`items[${index}][item]`, item.title || 'Article temporaire');
      apiFormData.append(`items[${index}][description]`, item.description || '');
      apiFormData.append(`items[${index}][price_list]`, 'RNmlK'); // Valeur fixe qui fonctionne
      apiFormData.append(`items[${index}][discountAmount]`, (item.discount?.value || 0).toString());
      apiFormData.append(`items[${index}][discountType]`, (item.discount?.type === '%' ? 1 : 2).toString());
      apiFormData.append(`items[${index}][qte]`, (item.quantity || 1).toString());
      apiFormData.append(`items[${index}][price]`, (item.unitPrice || 0).toString());
      apiFormData.append(`items[${index}][journal_hashed_id]`, 'WDkJGjV'); // Valeur fixe qui fonctionne
      apiFormData.append(`items[${index}][hashed_item_serial_numbers]`, '');
      
      // Ajouter les taxes
      item.taxes?.forEach((tax, taxIndex) => {
        apiFormData.append(`items[${index}][taxes][${taxIndex}][tax_hashed_id]`, tax.id || '');
      });
    });

    // 4. Pièces jointes
    if (formData.attachments && formData.attachments.length > 0) {
      formData.attachments.forEach((file, index) => {
        apiFormData.append(`attachments[${index}]`, file);
      });
    }

    // Debug
    console.log('FormData envoyé:');
    for (const [key, value] of (apiFormData as any).entries()) {
      console.log(`${key}:`, value);
    }

    const response = await axios.post(
      `${API_URL}/fr/api/private/company/${companyId}/sales/estimate/${estimateId}/edit`,
      apiFormData,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        },
        timeout: 15000
      }
    );

    if (response.data?.status?.code !== 200) {
      console.error('Erreur API:', response.data);
      return {
        success: false,
        message: response.data?.status?.message || 'Erreur inconnue',
        updatedEstimate: response.data?.data?.estimate
      };
    }

    return {
      success: true,
      message: response.data?.status?.message || 'Devis mis à jour',
      updatedEstimate: response.data?.data?.estimate
    };

  } catch (error: any) {
    console.error('Erreur complète:', {
      message: error.message,
      response: error.response?.data,
      stack: error.stack
    });

    return {
      success: false,
      message: error.response?.data?.message || 'Erreur technique'
    };
  }
};
export const deleteEstimate = async (
  estimateId: string
): Promise<{ success: boolean; message?: string }> => {
  try {
    const { token, companyId } = await fetchTokenAndCompanyId();

    if (!estimateId) {
      return { success: false, message: 'ID du devis manquant' };
    }

    const response = await axios.get(
      `${API_URL}/fr/api/private/company/${companyId}/sales/estimate/${estimateId}/delete`,
      {
        headers: { Authorization: `Bearer ${token}` },
        validateStatus: (status) => status === 200
      }
    );

    if (!response.data?.success && response.data?.status?.code !== 200) {
      return {
        success: false,
        message: response.data?.message || 'Échec suppression côté serveur'
      };
    }

    return {
      success: true,
      message: response.data?.message || 'Devis supprimé avec succès'
    };

  } catch (error: any) {
    console.error('Erreur suppression devis:', {
      error: error.response?.data || error.message,
      estimateId
    });

    let errorMessage = 'Erreur lors de la suppression';
    if (error.response) {
      switch (error.response.status) {
        case 400: errorMessage = 'Authorization erronée'; break;
        case 401: errorMessage = 'Abonnement actif manquant'; break;
        case 402: errorMessage = 'Non autorisé à accéder à cette société'; break;
        case 404: errorMessage = 'Devis introuvable'; break;
        case 405: errorMessage = 'Authorization manquante'; break;
        default: errorMessage = error.response.data?.message || errorMessage;
      }
    }

    return { success: false, message: errorMessage };
  }
};

export const downloadEstimate = async (estimate: Estimate | string): Promise<void> => {
  const estimateId = typeof estimate === 'string' ? estimate : estimate.hashed_id;
  
  if (!estimateId) {
    throw new Error('Identifiant du devis manquant');
  }

  const { token, companyId } = await fetchTokenAndCompanyId();
  
  try {
    const response = await axios({
      method: 'GET',
      url: `${API_URL}/fr/api/private/company/${companyId}/sales/estimate/${estimateId}/download`,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/pdf'
      },
      responseType: 'blob',
      timeout: 15000
    });

    if (!response.data || response.data.size === 0) {
      throw new Error('Document reçu vide');
    }

    const estimateNumber = typeof estimate === 'object' 
      ? estimate.estimate_number 
      : `estimate_${estimateId}`;
    const fileName = `Devis_${estimateNumber.replace(/\//g, '-')}.pdf`;
    
    const blob = new Blob([response.data], { type: 'application/pdf' });
    const blobUrl = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = fileName;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();

    setTimeout(() => {
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
    }, 100);

  } catch (error: any) {
    console.error('Erreur téléchargement devis:', {
      estimateId,
      error: error.response?.data || error.message
    });

    throw new Error(error.response?.data?.message || 'Échec du téléchargement');
  }
};

export const duplicateEstimate = async (
  originalEstimate: Estimate
): Promise<{ success: boolean; message: string; newEstimate?: Estimate }> => {
  const { token, companyId } = await fetchTokenAndCompanyId();

  try {
    if (!originalEstimate?.hashed_id) {
      throw new Error("ID du devis original invalide");
    }

    // Requête vers l'endpoint de duplication
    const duplicateResponse = await axios.get(
      `${API_URL}/fr/api/private/company/${companyId}/sales/estimate/${originalEstimate.hashed_id}/duplicate`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    const responseData = duplicateResponse.data?.data;

    if (!responseData?.estimate) {
      console.error("Réponse API complète:", duplicateResponse.data);
      throw new Error("Structure de réponse invalide - estimate manquant");
    }

    return {
      success: true,
      message: `Duplicata ${responseData.estimate.estimate_number} créé avec succès`,
      newEstimate: responseData.estimate,
    };
  } catch (error: any) {
    console.error("Erreur duplication devis:", error);

    let errorMessage = "Erreur lors de la duplication";
    if (error.response) {
      errorMessage =
        error.response.data?.status?.message ||
        error.response.data?.message ||
        error.response.statusText ||
        error.message;

      console.error("Détails erreur API:", {
        status: error.response.status,
        data: error.response.data,
        headers: error.response.headers,
      });
    } else {
      errorMessage = error.message || error.toString();
    }

    return {
      success: false,
      message: errorMessage,
    };
  }
};


export const validateEstimate = async (
  estimateId: string
): Promise<{ success: boolean; message: string }> => {
  try {
    const { token, companyId } = await fetchTokenAndCompanyId();
    
    const response = await axios.get(
      `${API_URL}/fr/api/private/company/${companyId}/sales/estimate/${estimateId}/mark`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      }
    );

    return {
      success: response.data?.status?.code === 200,
      message: response.data?.status?.message || 'Devis validé avec succès'
    };

  } catch (error: any) {
    console.error('Erreur validation devis:', error);
    
    return {
      success: false,
      message: error.response?.data?.message || 'Échec de la validation'
    };
  }
};

// Fonction utilitaire interne
async function getLastEstimateNumber(): Promise<number> {
  const { token, companyId } = await fetchTokenAndCompanyId();
  
  try {
    const response = await axios.get(
      `${API_URL}/fr/api/private/company/${companyId}/sales/estimates/last-number`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    
    return response.data?.data?.last_number ? response.data.data.last_number + 1 : 1;
  } catch (error) {
    console.error('Erreur récupération dernier numéro:', error);
    return 1;
  }
}
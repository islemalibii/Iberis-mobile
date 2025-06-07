import axios from 'axios';
import { Preferences } from '@capacitor/preferences';
import { DeliveryNote,AddDeliveryNoteForm,DeliveryNoteItem} from '@/models/DeliveryNotesModel';
/*import { ItemsApiResponse } from '@/models/DeliveryNotesModel';*/

const API_URL = 'https://preprod-api.iberis.io/fr/api/private';

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

/*export const fetchDeliveryNotes = async () => {
    const { token, companyId } = await fetchTokenAndCompanyid();  
    const response = await axios.get(`${API_URL}/company/${companyId}/sales/deliveries`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    return response.data.data; 
};*/
export const fetchClientDeliveryNotes = async (clientId: string): Promise<DeliveryNote[]> => {
  if (!clientId || clientId === 'undefined') {
    throw new Error('ID client invalide pour les bons de livraison');
  }

  const { token, companyId } = await fetchTokenAndCompanyid();
  
  try {
    const response = await axios.get(`${API_URL}/company/${companyId}/sales/deliveries`, {
      headers: { Authorization: `Bearer ${token}` },
      params: {
        contact_id: clientId, 
        items_per_page: 1000
      }
    });

    const rawData = response.data?.data?.deliveries?.data;
    if (!Array.isArray(rawData)) {
      console.error('Structure de réponse inattendue:', response.data);
      return [];
    }

    return rawData.filter(note => {
      const noteClientId = note.hashed_contact_id 
        || note.client?.hashed_contact_id 
        || note.client_id;
      return noteClientId === clientId;
    });

  } catch (error) {
    console.error('Erreur API fetchClientDeliveryNotes:', {
      clientId,
      error: error.response?.data || error.message
    });
    throw new Error('Échec de la récupération des bons de livraison filtrés');
  }
};
export const deleteDeliveryNote = async (deliveryId: string) => {
    const { token, companyId } = await fetchTokenAndCompanyid();  
    const response = await axios.get(`${API_URL}/company/${companyId}/sales/delivery/${deliveryId}/delete`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    return response.data.success; 
};


export const getDeliveryNoteDetails = async (deliveryId: string): Promise<any> => {
  try {
    const { token, companyId } = await fetchTokenAndCompanyid();
    
    const response = await axios.get(
      `${API_URL}/company/${companyId}/sales/delivery/${deliveryId}/synthesis`,
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );
    
    // Vérifier si la réponse contient bien les données attendues
    if (!response.data?.data?.delivery) {
      throw new Error('Delivery data not found in API response');
    }
    
    return response.data; // Retourner toute la réponse
    
  } catch (error: any) {
    console.error('Error in getDeliveryNoteDetails:', error);
    throw error;
  }
};
export const downloadDeliveryNote = async (deliveryId: string) => {
    const { token, companyId } = await fetchTokenAndCompanyid();  
    try {
        const response = await axios.get(
            `${API_URL}/company/${companyId}/sales/delivery/${deliveryId}/download`,
            {
                responseType: 'blob',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            }
        );
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `delivery_${deliveryId}.pdf`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        return true;
    } catch (error) {
        console.error('Download failed:', error);
        throw error;
    }
};
export const validateDeliveryNote = async (deliveryId: string): Promise<{ 
    data: any[], 
    status: { 
        message: string, 
        code: number 
    } 
}> => {
    const { token, companyId } = await fetchTokenAndCompanyid();
    
    try {
        const response = await axios.get(
            `${API_URL}/company/${companyId}/sales/delivery/${deliveryId}/mark`,
            {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                data: { token } // Le token dans le body comme dans votre test Postman
            }
        );
        
        return {
            data: response.data.data || [],
            status: {
                message: response.data.status.message || 'Bon de livraison validé avec succès',
                code: response.data.status.code || 200
            }
        };
    } catch (error) {
        console.error('Validation error:', error);
        throw {
            data: [],
            status: {
                message: axios.isAxiosError(error) 
                    ? error.response?.data?.status?.message || 'Erreur lors de la validation'
                    : 'Erreur inconnue',
                code: axios.isAxiosError(error) 
                    ? error.response?.status || 500 
                    : 500
            }
        };
    }
};export const duplicateDeliveryNote = async (
  originalDeliveryNote: DeliveryNote
): Promise<{ success: boolean; message: string; newDeliveryNote?: DeliveryNote }> => {
  const { token, companyId } = await fetchTokenAndCompanyid();

  try {
    if (!originalDeliveryNote?.hashed_id) {
      throw new Error("ID du bon de livraison invalide");
    }

    console.log("Duplication en cours pour:", originalDeliveryNote.hashed_id);

    const url = `${API_URL}/company/${companyId}/sales/delivery/${originalDeliveryNote.hashed_id}/duplicate`;

    // ❗ Utilisation de GET comme spécifié dans le cahier des charges
    const duplicateResponse = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      timeout: 15000,
    });

    console.log("Réponse de duplication:", duplicateResponse.data);

    if (duplicateResponse.data?.status?.code === 200) {
      const newDelivery = duplicateResponse.data?.data?.delivery;
      return {
        success: true,
        message: `Duplicata ${newDelivery?.delivery_number || ''} créé avec succès`,
        newDeliveryNote: newDelivery,
      };
    } else {
      throw new Error(
        duplicateResponse.data?.status?.message || "Erreur lors de la duplication"
      );
    }
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
          errorMessage = "Document source introuvable";
          break;
        case 501:
          errorMessage = "Limite atteinte pour ce type de document";
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



export const fetchDeliveryNotes = async (): Promise<DeliveryNote[]> => {
  const { token, companyId } = await fetchTokenAndCompanyid();

  try {
    const response = await axios.get(`${API_URL}/company/${companyId}/sales/deliveries`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.data?.data?.exit_vouchers?.data) {
      throw new Error('Invalid response structure');
    }

    return response.data.data.exit_vouchers.data;
  } catch (error) {
    console.error('Erreur lors du fetch des bons de sortie:', error);
    throw new Error('Échec du chargement des bons de sortie');
  }
};
export const getLastDeliveryNotesNumber = async (): Promise<number> => {
  const deliverynote = await fetchDeliveryNotes();
  if (!deliverynote.length) return 1;

  const numbers = deliverynote.map((v) => {
    // Parse the exit voucher number format (e.g., "EV-2025-00001")
    const parts = v.delivery_number?.split('-');
    if (!parts || parts.length !== 3) return 0;
    
    // Extract the sequence number and convert to number
    const seq = parts[2];
    return seq ? parseInt(seq, 10) : 0;
  });

  // Filter out any NaN or invalid values
  const validNumbers = numbers.filter(n => !isNaN(n) && n > 0);
  


  return validNumbers.length > 0 ? Math.max(...validNumbers) + 1 : 1;
};
export const updatedDeliveryNote = async (
  deliveryId: string,
  formData: AddDeliveryNoteForm
): Promise<{
  success: boolean;
  message: string;
  updatedDeliveryNote?: DeliveryNote;
}> => {
  const { token, companyId } = await fetchTokenAndCompanyid();

  try {
    const apiFormData = new FormData();

    // 1. Champs de base avec show_ttc ajouté
    const simpleFields = {
      date: formData.date || new Date().toISOString().split('T')[0],
      delivery_number: formData.DeliveryNote_number?.split('-').pop()?.padStart(5, '0') || '00001',
      tax_type: formData.tax_type || 1,
      client_id: formData.client_id,
      use_conditions: 0,
      show_stamp: formData.show_stamp ? 1 : 0,
      show_billing: formData.show_billing ? 1 : 0,
      show_delivery: formData.show_delivery ? 1 : 0,
      show_bank: formData.show_bank ? 1 : 0,
      show_description: formData.show_description ? 1 : 0,
      show_pictures: formData.show_pictures ? 1 : 0,
      show_ttc: formData.showArticleTTCPrices ? 1 : 0, // Ajouté ici
      choice: formData.choice || 1,
      currency_rate: formData.currency_rate || 1,
      language: formData.language || 'fr',
      naming_series_dynamic: 1
    };

    Object.entries(simpleFields).forEach(([key, value]) => {
      apiFormData.append(key, value.toString());
    });

    // 2. Articles
    formData.items?.forEach((item, index) => {
      const itemData = {
        hashed_id: item.id || '',
        item: item.title || 'Article temporaire',
        description: item.description || '',
        discountAmount: item.discount?.value || 0,
        discountType: item.discount?.type === '%' ? 1 : 2,
        qte: item.quantity || 1,
        price: item.unitPrice || 0,
        // Ajout des taxes si nécessaire
        taxes: item.taxes?.map(tax => ({
          tax_hashed_id: tax.hashed_id || '',
          rate: tax.rate || 0
        })) || []
      };
      
      apiFormData.append(`items[${index}]`, JSON.stringify(itemData));
    });

    // 3. Pièces jointes
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
      `${API_URL}/company/${companyId}/sales/delivery/${deliveryId}/edit`,
      apiFormData,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        },
        timeout: 10000
      }
    );

    return {
      success: response.data?.status?.code === 200,
      message: response.data?.status?.message || 'Bon de livraison mis à jour avec succès',
      updatedDeliveryNote: response.data?.data?.delivery
    };

  } catch (error: any) {
    console.error('Erreur lors de la mise à jour:', {
      message: error.message,
      response: error.response?.data,
      config: error.config
    });

    return {
      success: false,
      message: error.response?.data?.message || 'Erreur technique lors de la mise à jour'
    };
  }
};
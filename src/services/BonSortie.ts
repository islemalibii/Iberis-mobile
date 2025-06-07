import axios from 'axios';
import { Preferences } from '@capacitor/preferences';
import { Discount,ItemTax,VoucherItem,ExitVoucher,AddExitVoucherForm } from '@/models/BonsortieModel';
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

export const fetchClientExitVouchers = async (clientId: string): Promise<ExitVoucher[]> => {
  if (!clientId || clientId === 'undefined') {
    throw new Error('ID client invalide ou manquant');
  }

  const { token, companyId } = await fetchTokenAndCompanyid();
  
  try {
    const response = await axios.get(`${API_BASE_URL}/fr/api/private/company/${companyId}/sales/exit_vouchers`, {
      headers: { Authorization: `Bearer ${token}` },
      params: {
        contact_id: clientId,
        items_per_page: 1000 
      }
    });

    // Validation approfondie de la réponse
    const rawData = response.data?.data?.exit_vouchers?.data;
    
    if (!Array.isArray(rawData)) {
      console.error('Structure de réponse API inattendue:', response.data);
      return [];
    }

    // Filtrage de sécurité côté client
    return rawData.filter(voucher => 
      voucher.hashed_contact_id === clientId ||
      voucher.client?.hashed_contact_id === clientId
    );

  } catch (error) {
    console.error('Erreur API fetchClientExitVouchers:', {
      clientId,
      error: error.response?.data || error.message
    });
    throw new Error('Échec de la récupération des bons filtrés');
  }
};

export const deleteExitVoucher = async (
  voucherId: string
): Promise<{ success: boolean; message?: string }> => {
  try {
    const { token, companyId } = await fetchTokenAndCompanyid();

    if (!voucherId) {
      return { success: false, message: 'ID du bon de sortie manquant' };
    }

    // Utilisation de DELETE au lieu de GET comme recommandé
    const response = await axios.get(
      `${API_BASE_URL}/fr/api/private/company/${companyId}/sales/exit_voucher/${voucherId}/delete`,
      {
        headers: { Authorization: `Bearer ${token}` },
        validateStatus: (status) => status === 200 // Seul le statut 200 est considéré comme succès
      }
    );

    // Vérification plus stricte de la réponse
    if (!response.data?.success && response.data?.status?.code !== 200) {
      return {
        success: false,
        message: response.data?.message || 'La suppression a échoué côté serveur'
      };
    }

    return {
      success: true,
      message: response.data?.message || 'Bon supprimé avec succès'
    };

  } catch (error: any) {
    console.error('Erreur API suppression:', {
      error: error.response?.data || error.message,
      voucherId
    });

    let errorMessage = 'Erreur lors de la suppression';
    if (error.response) {
      switch (error.response.status) {
        case 400: errorMessage = 'Authorization erronée'; break;
        case 401: errorMessage = 'Abonnement actif manquant'; break;
        case 402: errorMessage = 'Non autorisé à accéder à cette société'; break;
        case 404: errorMessage = 'Bon de sortie introuvable'; break;
        case 405: errorMessage = 'Authorization manquante'; break;
        default: errorMessage = error.response.data?.message || errorMessage;
      }
    }

    return { success: false, message: errorMessage };
  }
};

export const downloadExitVoucher = async (voucher: ExitVoucher): Promise<void> => {
  // Récupération de l'ID selon les différentes propriétés possibles
  const exitVoucherId = voucher.hashed_id || voucher.exitVoucherHashedId;
  
  if (!exitVoucherId) {
    console.error('Aucun ID trouvé dans le bon de sortie:', voucher);
    throw new Error('Identifiant du document introuvable');
  }

  const { token, companyId } = await fetchTokenAndCompanyid();
  
  try {
    // Solution avec axios pour un meilleur contrôle
    const response = await axios({
      method: 'GET',
      url: `${API_BASE_URL}/fr/api/private/company/${companyId}/sales/exit_voucher/${exitVoucherId}/download`,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/pdf'
      },
      responseType: 'blob'
    });

    // Création du lien de téléchargement
    const blobUrl = URL.createObjectURL(response.data);
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = `bon_sortie_${voucher.exit_voucher_number}.pdf`;
    document.body.appendChild(link);
    link.click();
    
    // Nettoyage
    setTimeout(() => {
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
    }, 100);

  } catch (error: any) {
    console.error('Erreur API:', {
      endpoint: `${API_BASE_URL}/fr/api/private/company/${companyId}/sales/exit_voucher/${exitVoucherId}/download`,
      error: error.response?.data || error.message
    });
    
    // Fallback: Ouverture dans un nouvel onglet si axios échoue
    const fallbackUrl = `${API_BASE_URL}/fr/api/private/company/${companyId}/sales/exit_voucher/${exitVoucherId}/download?token=${token}`;
    window.open(fallbackUrl, '_blank');
  }
};

export const validateExitVoucher = async (voucher: ExitVoucher): Promise<{ 
  success: boolean;
  message: string;
  requiresRefresh?: boolean;
}> => {
  const { token, companyId } = await fetchTokenAndCompanyid();
  const voucherId = voucher.hashed_id || voucher.exitVoucherHashedId;

  if (!voucherId) {
    return {
      success: false,
      message: 'ID du bon de sortie manquant',
      requiresRefresh: true
    };
  }

  try {
    // Changement de POST à GET comme indiqué par l'erreur
    const response = await axios.get(
      `${API_BASE_URL}/fr/api/private/company/${companyId}/sales/exit_voucher/${voucherId}/mark`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        },
        params: { 
          status: 1,
          persist: true
        },
        timeout: 10000
      }
    );

    if (response.data?.status?.code !== 200) {
      throw new Error(response.data?.status?.message || 'Réponse inattendue');
    }

    return {
      success: true,
      message: response.data?.status?.message || 'Validé avec succès',
      requiresRefresh: false
    };
  } catch (error: any) {
    console.error('Erreur validation:', {
      url: `${API_BASE_URL}/fr/api/private/company/${companyId}/sales/exit_voucher/${voucherId}/mark`,
      error: error.response?.data || error.message
    });
//This estimate has already been validated and cannot be validated again
    return {
      success: false,
      message: 'Échec de la validation. Contactez le support.',
      requiresRefresh: true
    };
  }
};

/**
 * Corrected service function for fetching exit voucher details
 */
export const getExitVoucherDetails = async (exitVoucherId: string): Promise<any> => {
  const { token, companyId } = await fetchTokenAndCompanyid();
  
  try {

    const response = await axios.get(
      `${API_BASE_URL}/fr/api/private/company/${companyId}/sales/exit_voucher/${exitVoucherId}/synthesis`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    
    return response.data;
  } catch (error) {
    console.error('Error fetching exit voucher synthesis:', error);
    throw error;
  }
};


    

    

export const createExitVoucherFormData = (formValues: any, items: any[]): FormData => {
  const formData = new FormData();

  // Ajout des valeurs simples
  Object.entries(formValues).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      formData.append(key, String(value));
    }
  });

  // Ajout des articles
  items.forEach((item, index) => {
    formData.append(`items[${index}][item_hashed_id]`, item.hashed_item_id || '');
    formData.append(`items[${index}][item]`, item.title);
    formData.append(`items[${index}][qte]`, String(item.quantity));
    formData.append(`items[${index}][price]`, String(item.rate || item.unitPrice));
    
    if (item.taxes && item.taxes.length > 0) {
      item.taxes.forEach((tax: any, taxIndex: number) => {
        formData.append(`items[${index}][taxes][${taxIndex}][tax_hashed_id]`, tax.hashed_id);
      });
    }
  });

  return formData;
};

export const updateExitVoucher = async (
  voucherId: string,
  formData: AddExitVoucherForm
): Promise<{
  success: boolean;
  message: string;
  updatedVoucher?: ExitVoucher;
}> => {
  const { token, companyId } = await fetchTokenAndCompanyid();

  // 1. Création du FormData comme dans Postman
  const apiFormData = new FormData();

  // 2. Ajout des champs simples
  const simpleFields = {
    date: formData.date || new Date().toISOString().split('T')[0],
  exit_voucher_number: formData.ExitVoucher_number?.split('-').pop()?.padStart(5, '0') || '00001',    tax_type: formData.tax_type || 1,
    client_id: formData.client_id,
    use_conditions: 0,
    show_stamp: formData.show_stamp ? 1 : 0,
    show_billing: formData.show_billing ? 1 : 0,
    show_delivery: formData.show_delivery ? 1 : 0,
    show_bank: formData.show_bank ? 1 : 0,
    show_description: formData.show_description ? 1 : 0,
    show_pictures: formData.show_pictures ? 1 : 0,
    choice: formData.choice || 1,
    currency_rate: formData.currency_rate || 1,
    language: formData.language || 'fr',
    naming_series_dynamic: 1
  };

  Object.entries(simpleFields).forEach(([key, value]) => {
    apiFormData.append(key, value.toString());
  });

  // 3. Ajout des articles au bon format
  formData.items?.forEach((item, index) => {
    const itemData = {
      hashed_id: item.id || '',
      item: item.title || 'Article temporaire',
      description: item.description || '',
      discountAmount: item.discount?.value || 0,
      discountType: item.discount?.type === '%' ? 1 : 2,
      qte: item.quantity || 1,
      price: item.unitPrice || 0
    };
    apiFormData.append(`items[${index}]`, JSON.stringify(itemData));
  });

  // 4. Debug: Afficher le contenu de FormData
  console.log('FormData envoyé:');
  for (const [key, value] of (apiFormData as any).entries()) {
    console.log(`${key}:`, value);
  }

  try {
    const response = await axios.post(
      `${API_BASE_URL}/fr/api/private/company/${companyId}/sales/exit_voucher/${voucherId}/edit`,
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
      message: response.data?.status?.message || 'Mis à jour avec succès',
      updatedVoucher: response.data?.data?.exit_voucher
    };

  } catch (error: any) {
    console.error('Erreur complète:', {
      message: error.message,
      response: error.response?.data,
      config: error.config
    });

    return {
      success: false,
      message: error.response?.data?.message || 'Erreur technique lors de la mise à jour',
      updatedVoucher: undefined
    };
  }
};
export const fetchExitVouchers = async (): Promise<ExitVoucher[]> => {
  const { token, companyId } = await fetchTokenAndCompanyid();

  try {
    const response = await axios.get(`${API_BASE_URL}/fr/api/private/company/${companyId}/sales/exit_vouchers`, {
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

export const getLastExitVoucherNumber = async (): Promise<number> => {
  const vouchers = await fetchExitVouchers();
  if (!vouchers.length) return 1;

  const numbers = vouchers.map((v) => {
    const parts = v.exit_voucher_number?.split('-');
    if (!parts || parts.length !== 3) return 0;
    
    const seq = parts[2];
    return seq ? parseInt(seq, 10) : 0;
  });

  const validNumbers = numbers.filter(n => !isNaN(n) && n > 0);
  


  return validNumbers.length > 0 ? Math.max(...validNumbers) + 1 : 1;
};
export const duplicateExitVoucher = async (
  originalVoucher: ExitVoucher
): Promise<{ success: boolean; message: string; newVoucher?: ExitVoucher }> => {
  const { token, companyId } = await fetchTokenAndCompanyid();

  try {
    const duplicateResponse = await axios.get(
      `${API_BASE_URL}/fr/api/private/company/${companyId}/sales/exit_voucher/${originalVoucher.hashed_id}/duplicate`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const responseData = duplicateResponse.data?.data;

    if (!responseData?.exitVoucher) {
      console.error('Réponse API complète:', duplicateResponse.data);
      throw new Error('Structure de réponse invalide - exitVoucher manquant');
    }

    return {
      success: true,
      message: `Duplicata ${responseData.exitVoucher.exit_voucher_number} créé avec succès`,
      newVoucher: responseData.exitVoucher
    };

  } catch (error: any) {
    console.error('Erreur complète:', error);

    let errorMessage = 'Erreur lors de la duplication';
    if (error.response) {
      errorMessage = error.response.data?.status?.message 
                  || error.response.data?.message
                  || error.response.statusText
                  || error.message;

      console.error('Détails erreur API:', {
        status: error.response.status,
        data: error.response.data,
        headers: error.response.headers
      });
    } else {
      errorMessage = error.message || error.toString();
    }

    return {
      success: false,
      message: errorMessage
    };
  }
};



export const getStatusClass = (status: number): string => {
  const statusMap: Record<number, string> = {
    0: 'status-draft',     
    1: 'status-paid',      
    2: 'status-pending',      
    3: 'status-overdue',   
    4: 'status-sent',
    5: 'status-cancelled'       
  };
  return statusMap[status] || 'status-draft';
};

export const getStatusText = (status: number): string => {
  const textMap: Record<number, string> = {
    0: 'Draft',
    1: 'Paid',
    2: 'Pending',
    3: 'Overdue',
    4: 'Sent',
    5: 'cancelled'
  };
  return textMap[status] || 'Draft';
};

export const formatCurrency = (amount: string | number) => {
  const value = typeof amount === 'string' ? parseFloat(amount) : amount;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'EUR'  
  }).format(value);
};

export const formatDate = (dateString: string) => {
  if (!dateString) return 'N/A';
  try {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  } catch {
    return 'N/A';
  }
};
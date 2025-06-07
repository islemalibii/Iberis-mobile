import axios from 'axios';
import { Preferences } from '@capacitor/preferences';
import { ReceiptNote, AddReceiptNoteForm, ReceiptNoteItem } from '@/models/Receipt';

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

export const fetchProviderReceiptNotes = async (providerId: string): Promise<ReceiptNote[]> => {
    if (!providerId) {
        throw new Error('Provider ID is required');
    }
    
    const { token, companyId } = await fetchTokenAndCompanyid();
    
    try {
        const response = await axios.get(`${API_URL}/company/${companyId}/purchases/receipts`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
            params: {
                contact_id: providerId
            }
        });
        
        if (!response.data?.data?.receipts?.data) {
            throw new Error('Invalid response structure');
        }
        
       return response.data.data.receipts.data;
  } catch (error) {
    console.error('Error fetching receipts:', error);
    throw new Error('Failed to fetch receipts');
  }
};

export const fetchAllReceiptNotes = async (): Promise<ReceiptNote[]> => {
    const { token, companyId } = await fetchTokenAndCompanyid();
    
    try {
        const response = await axios.get(`${API_URL}/company/${companyId}/purchases/receipts`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        
        if (!response.data?.data?.receipts?.data) {
            throw new Error('Invalid response structure');
        }
        
        return response.data.data.receipts.data.map((receipt: any) => ({
            ...receipt,
            provider: {
                display_name: receipt.display_name,
                hashed_contact_id: receipt.hashed_contact_id || receipt.providerHashedId,
                additional_contact_id: receipt.hashed_contact_additional_id,
                email: '',
                country_title: '',
                billing_address: null,
                delivery_address: null
            },
            totals: typeof receipt.totals === 'string' ? JSON.parse(receipt.totals.replace(/&quot;/g, '"')) : receipt.totals,
            display: typeof receipt.display === 'string' ? JSON.parse(receipt.display.replace(/&quot;/g, '"')) : receipt.display
        }));
    } catch (error) {
        console.error('Error fetching all Receipt Notes:', error);
        throw new Error('Failed to fetch Receipt Notes');
    }
};

export const deleteReceiptNote = async (receiptId: string) => {
    const { token, companyId } = await fetchTokenAndCompanyid();
    const response = await axios.get(`${API_URL}/company/${companyId}/purchases/receipt/${receiptId}/delete`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    return response.data.success;
};

export const getReceiptNoteDetails = async (receiptId: string): Promise<any> => {
  try {
    const { token, companyId } = await fetchTokenAndCompanyid();
    
    const response = await axios.get(
      `${API_URL}/company/${companyId}/purchases/receipt/${receiptId}/synthesis`,
      {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('Full API Response:', response);

    if (!response.data?.data?.receipt) {
      console.error('Invalid receipt response structure:', response.data);
      throw new Error('Invalid receipt data structure');
    }

    return {
      data: {
        receipt: response.data.data.receipt
      },
      status: response.data.status || { code: 200, message: 'Success' }
    };
    
  } catch (error: any) {
    console.error('Error fetching receipt details:', {
      message: error.message,
      response: error.response?.data,
      stack: error.stack
    });
    throw error;
  }
};
        
export const downloadReceiptNote = async (receiptId: string) => {
    const { token, companyId } = await fetchTokenAndCompanyid();
    try {
        const response = await axios.get(
            `${API_URL}/company/${companyId}/purchases/receipt/${receiptId}/download`,
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
        link.setAttribute('download', `receipt_${receiptId}.pdf`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        return true;
    } catch (error) {
        console.error('Download failed:', error);
        throw error;
    }
};

export const validateReceiptNote = async (receiptId: string): Promise<{ 
    data: any[], 
    status: { 
        message: string, 
        code: number 
    } 
}> => {
    const { token, companyId } = await fetchTokenAndCompanyid();
    
    try {
        const response = await axios.get(
            `${API_URL}/company/${companyId}/purchases/receipt/${receiptId}/mark`,
            {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                data: { token }
            }
        );
        
        return {
            data: response.data.data || [],
            status: {
                message: response.data.status.message || 'Bon de réception validé avec succès',
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
};

 export const duplicateReceiptNote = async (
  originalReceiptNote: ReceiptNote
): Promise<{ success: boolean; message: string; newReceiptNote?: ReceiptNote }> => {
  const { token, companyId } = await fetchTokenAndCompanyid();

  try {
    if (!originalReceiptNote?.hashed_id) {
      throw new Error('ID du bon de réception invalide');
    }

    const duplicateResponse = await axios.get(
      `${API_URL}/company/${companyId}/purchases/receipt/${originalReceiptNote.hashed_id}/duplicate`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const responseData = duplicateResponse.data?.data;

    if (!responseData?.receipt) {
      console.error('Réponse API complète:', duplicateResponse.data);
      throw new Error('Structure de réponse invalide - receipt manquant');
    }

    return {
      success: true,
      message: `Duplicata ${responseData.receipt.receipt_number} créé avec succès`,
      newReceiptNote: responseData.receipt
    };

  } catch (error: any) {
    console.error('Erreur complète:', error);

    let errorMessage = 'Erreur lors de la duplication';
    if (error.response) {
      errorMessage =
        error.response.data?.status?.message ||
        error.response.data?.message ||
        error.response.statusText ||
        error.message;

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

export const getLastReceiptNotesNumber = async (): Promise<number> => {
    const receipts = await fetchAllReceiptNotes();
    if (!receipts.length) return 1;

    const numbers = receipts.map((receipt) => {
        const parts = receipt.receipt_number?.split('-');
        if (!parts || parts.length !== 3) return 0;
        
        const seq = parts[2];
        return seq ? parseInt(seq, 10) : 0;
    });

    const validNumbers = numbers.filter(n => !isNaN(n) && n > 0);
    
    return validNumbers.length > 0 ? Math.max(...validNumbers) + 1 : 1;
};export const updateReceiptNote = async (
    receiptId: string,
    formData: AddReceiptNoteForm
): Promise<{
    success: boolean;
    message: string;
    updatedReceiptNote?: ReceiptNote;
}> => {
    const { token, companyId } = await fetchTokenAndCompanyid();

    try {
        const apiFormData = new FormData();
        const formDataLog: Record<string, any> = {};

        // Construction des données avec logging
        const addFormData = (key: string, value: string | Blob, logKey?: string) => {
            apiFormData.append(key, value);
            formDataLog[logKey || key] = value instanceof Blob ? 'FILE' : value;
        };

        // Paramètres obligatoires
        addFormData('date', formData.date.split('T')[0]);
        addFormData('receipt_number', formData.receipt_number?.split('-').pop()?.padStart(5, '0') || '00001');
        addFormData('tax_type', String(formData.tax_type));
        addFormData('provider_id', formData.provider_id);
        addFormData('category_id', formData.category);
        addFormData('choice', String(formData.choice || 1));
        addFormData('currency_rate', String(formData.currency_rate || 1));
        addFormData('language', formData.language || 'fr');
        
        // ✅ CORRECTION : Utiliser les bons noms de paramètres
        addFormData('use_conditions', formData.use_conditions ? '1' : '0');
        addFormData('show_stamp', formData.show_stamp ? '1' : '0');
        addFormData('show_billing', formData.show_billing ? '1' : '0');
        addFormData('show_delivery', formData.show_delivery ? '1' : '0'); // ✅ Était show_conditions
        addFormData('show_bank', formData.show_bank ? '1' : '0'); // ✅ Nouveau paramètre
        addFormData('show_conditions', formData.show_conditions ? '1' : '0');
        addFormData('show_description', formData.show_description ? '1' : '0');
        addFormData('show_pictures', formData.show_pictures ? '1' : '0');

        // Paramètres optionnels
                if (formData.object) addFormData('category', formData.category);

        if (formData.object) addFormData('object', formData.object);
        if (formData.referenceNumber) addFormData('reference', formData.referenceNumber);
        if (formData.generalTerms) addFormData('conditions', formData.generalTerms);
        if (formData.remarks) addFormData('notes', formData.remarks);
        if (formData.selected_bank) addFormData('bank_id', formData.selected_bank);

        // ✅ CORRECTION : Gestion des articles selon le format API exact de votre test réussi
        formData.items?.forEach((item, index) => {
            // Format exact selon votre test réussi
            const itemData = {
                hashed_id: item.id ||  '',
                item: item.title || '',
                description: item.description || '',
                discountAmount: Number(item.discount?.value || 0),
                discountType: item.discount?.type === '%' ? 1 : 2,
                qte: Number(item.quantity || 1),
                price: Number(item.unitPrice || 0)
            };
            
            // Validation des données obligatoires
            if (!itemData.hashed_id) {
                console.warn(`⚠️ Article ${index}: hashed_id manquant`);
            }
            if (!itemData.item) {
                console.warn(`⚠️ Article ${index}: titre manquant`);
            }
            
            addFormData('items[]', JSON.stringify(itemData));
        });

      
      

        const response = await axios.post(
            `${API_URL}/company/${companyId}/purchases/receipt/${receiptId}/edit`,
            apiFormData,
            {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                },
                timeout: 30000 
            }
        );

     
        const isSuccess = response.data?.status?.code === 200;
        const hasErrors = response.data?.errors && Object.keys(response.data.errors).length > 0;
        
        if (!isSuccess || hasErrors) {
            console.error(' Erreurs dans la réponse API:', response.data?.errors);
            
            let errorMessage = 'Erreur lors de la mise à jour';
            if (response.data?.errors) {
                errorMessage = Object.entries(response.data.errors)
                    .map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(', ') : value}`)
                    .join(' | ');
            } else if (response.data?.status?.message) {
                errorMessage = response.data.status.message;
            }
            
            return {
                success: false,
                message: errorMessage
            };
        }

        return {
            success: true,
            message: response.data?.status?.message || 'Bon de réception mis à jour avec succès',
            updatedReceiptNote: response.data?.data?.receipt
        };

    } catch (error: any) {
        console.error(' Erreur lors de la mise à jour:', {
            message: error.message,
            config: error.config ? {
                url: error.config.url,
                method: error.config.method,
                data: 'FormData object'
            } : null,
            response: error.response ? {
                status: error.response.status,
                data: error.response.data
            } : null
        });

        let errorMessage = 'Erreur technique lors de la mise à jour';
        
        if (error.response?.data) {
            if (error.response.data.errors) {
                errorMessage = Object.entries(error.response.data.errors)
                    .map(([key, value]) => `${key}: ${(value as string[]).join(', ')}`)
                    .join(' | ');
            } 
            else if (error.response.data.status?.message) {
                errorMessage = error.response.data.status.message;
            }
        }

        return {
            success: false,
            message: errorMessage
        };
    }
};
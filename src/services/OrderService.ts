import axios from 'axios';
import { Preferences } from '@capacitor/preferences';
import { PurchaseOrder, AddPurchaseOrderForm, OrderItem } from '@/models/Order';

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

export const fetchProviderOrders = async (providerId: string): Promise<PurchaseOrder[]> => {
    if (!providerId) {
        throw new Error('Provider ID is required');
    }
    
    const { token, companyId } = await fetchTokenAndCompanyid();
    
    try {
        const response = await axios.get(`${API_URL}/company/${companyId}/purchases/orders`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
            params: {
                contact_id: providerId
            }
        });
        
        if (!response.data?.data?.orders?.data) {
            throw new Error('Invalid response structure');
        }
        
        return response.data.data.orders.data
    } catch (error) {
        console.error('Error fetching orders:', error);
        throw new Error('Failed to fetch orders');
    }
};

export const fetchAllOrders = async (): Promise<PurchaseOrder[]> => {
    const { token, companyId } = await fetchTokenAndCompanyid();
    
    try {
        const response = await axios.get(`${API_URL}/company/${companyId}/purchases/orders`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        
        if (!response.data?.data?.orders?.data) {
            throw new Error('Invalid response structure');
        }
        
        return response.data.data.orders.data.map((order: any) => ({
            ...order,
            provider: {
                display_name: order.display_name || '',
                hashed_contact_id: order.hashed_contact_id || order.providerHashedId,
                additional_contact_id: order.hashed_contact_additional_id || null,
                email:  '',
                country_title: order.contact?.billing?.country_title || '',
                billing_address: order.contact?.billing?.address || null,
                delivery_address: order.contact?.delivery?.address || null
            },
            totals: typeof order.totals === 'string' ? JSON.parse(order.totals) : order.totals,
            display: typeof order.display === 'string' ? JSON.parse(order.display) : order.display
        }));
    } catch (error) {
        console.error('Error fetching all orders:', error);
        throw new Error('Failed to fetch orders');
    }
};

export const deleteOrder = async (orderId: string): Promise<boolean> => {
    const { token, companyId } = await fetchTokenAndCompanyid();
    
    try {
        const response = await axios.get(
            `${API_URL}/company/${companyId}/purchases/order/${orderId}/delete`,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );
        
        return response.data?.success === true;
    } catch (error) {
        console.error('Error deleting order:', error);
        throw new Error('Failed to delete order');
    }
};

export const getOrderDetails = async (orderId: string): Promise<PurchaseOrder> => {
    const { token, companyId } = await fetchTokenAndCompanyid();
    
    try {
        const response = await axios.get(
            `${API_URL}/company/${companyId}/purchases/order/${orderId}/synthesis`,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );
        
        if (!response.data?.data?.order) {
            throw new Error('Invalid order response structure');
        }
        
        const order = response.data.data.order;
        
        return {
            ...order,
            totals: typeof order.totals === 'string' ? JSON.parse(order.totals) : order.totals,
            display: typeof order.display === 'string' ? JSON.parse(order.display) : order.display,
            items: order.items?.map((item: any) => ({
                ...item,
                id: item.hashed_id,
                title: item.item?.title || item.temporary_item || '',
                unitPrice: parseFloat(item.rate) || 0,
                quantity: item.quantity || 0,
                discount: {
                    value: parseFloat(item.discount_rate) || 0,
                    type: item.discount_type === 1 ? '%' : 'fixed'
                },
                taxes: (item.taxes || []).map((tax: any) => ({
                    hashed_id: tax.hashed_id,
                    title: tax.title || '',
                    rate: parseFloat(tax.rate) || 0
                }))
            })) || []
        };
    } catch (error) {
        console.error('Error fetching order details:', error);
        throw new Error('Failed to fetch order details');
    }
};

export const downloadOrder = async (orderId: string): Promise<boolean> => {
    const { token, companyId } = await fetchTokenAndCompanyid();
    
    try {
        const response = await axios.get(
            `${API_URL}/company/${companyId}/purchases/order/${orderId}/download`,
            {
                responseType: 'blob',
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );
        
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `order_${orderId}.pdf`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        return true;
    } catch (error) {
        console.error('Error downloading order:', error);
        throw new Error('Failed to download order');
    }
};

export const validateOrder = async (orderId: string): Promise<{ 
    data: any[], 
    status: { 
        message: string, 
        code: number 
    } 
}> => {
    const { token, companyId } = await fetchTokenAndCompanyid();
    
    try {
        const response = await axios.get(
            `${API_URL}/company/${companyId}/purchases/order/${orderId}/mark`,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );
        
        return {
            data: response.data?.data || [],
            status: {
                message: response.data?.status?.message || 'Order validated successfully',
                code: response.data?.status?.code || 200
            }
        };
    } catch (error) {
        console.error('Error validating order:', error);
        throw {
            data: [],
            status: {
                message: axios.isAxiosError(error) 
                    ? error.response?.data?.status?.message || 'Validation error'
                    : 'Unknown error',
                code: axios.isAxiosError(error) 
                    ? error.response?.status || 500 
                    : 500
            }
        };
    }
};

export const duplicateOrder = async (
  originalOrder: PurchaseOrder
): Promise<{ success: boolean; message: string; newOrder?: PurchaseOrder }> => {
  const { token, companyId } = await fetchTokenAndCompanyid();

  try {
    const url = `${API_URL}/company/${companyId}/purchases/order/${originalOrder.hashed_id}/duplicate`;

    const duplicateResponse = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    const responseData = duplicateResponse.data?.data;

    if (!responseData?.order) {
      console.error('Réponse API complète:', duplicateResponse.data);
      throw new Error('Structure de réponse invalide - order manquant');
    }

    return {
      success: true,
      message: `Duplicata ${responseData.order.order_number} créé avec succès`,
      newOrder: responseData.order
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
export const getLastOrderNumber = async (): Promise<number> => {
    const orders = await fetchAllOrders();
    if (!orders.length) return 1;

    const numbers = orders.map((order) => {
        const parts = order.order_number?.split('-');
        if (!parts || parts.length !== 3) return 0;
        
        const seq = parts[2];
        return seq ? parseInt(seq, 10) : 0;
    });

    const validNumbers = numbers.filter(n => !isNaN(n) && n > 0);
    
    return validNumbers.length > 0 ? Math.max(...validNumbers) + 1 : 1;
};

export const updateOrder = async (
    orderId: string,
    formData: AddPurchaseOrderForm
): Promise<{
    success: boolean;
    message: string;
    updatedOrder?: PurchaseOrder;
}> => {
    const { token, companyId } = await fetchTokenAndCompanyid();

    try {
        const apiFormData = new FormData();

        // Basic fields
        apiFormData.append('language', formData.language || 'fr');
        apiFormData.append('date', formData.date || new Date().toISOString().split('T')[0]);
        apiFormData.append('tax_type', String(formData.tax_type || 1));
        apiFormData.append('provider_id', formData.provider_id || '');
        apiFormData.append('currency_rate', String(formData.currency_rate || 1));
        
        // Optional fields
        if (formData.referenceNumber) apiFormData.append('reference_number', formData.referenceNumber);
        if (formData.object) apiFormData.append('object', formData.object);
        if (formData.remarks) apiFormData.append('notes', formData.remarks);
        if (formData.generalTerms) apiFormData.append('conditions', formData.generalTerms);
        if (formData.category) apiFormData.append('category', formData.category);

        // Display settings
        apiFormData.append('show_billing', formData.show_billing ? '1' : '0');
        apiFormData.append('show_conditions', formData.show_conditions ? '1' : '0');
        apiFormData.append('show_description', formData.show_description ? '1' : '0');
        apiFormData.append('show_pictures', formData.show_pictures ? '1' : '0');

        // Items
        formData.items.forEach((item, index) => {
            apiFormData.append(`items[${index}][item_hashed_id]`, item.id || '');
            apiFormData.append(`items[${index}][item]`, item.title || '');
            apiFormData.append(`items[${index}][description]`, item.description || '');
            apiFormData.append(`items[${index}][qte]`, String(item.quantity || 0));
            apiFormData.append(`items[${index}][price]`, String(item.unitPrice || 0));
            
            if (item.discount) {
                apiFormData.append(`items[${index}][discountAmount]`, String(item.discount.value || 0));
                apiFormData.append(`items[${index}][discountType]`, item.discount.type === '%' ? '1' : '2');
            }
            
            item.taxes.forEach((tax, taxIndex) => {
                apiFormData.append(`items[${index}][taxes][${taxIndex}][tax_hashed_id]`, tax.hashed_id || '');
            });
        });

        // Attachments
        formData.attachments.forEach((file, index) => {
            apiFormData.append(`attachments[${index}]`, file);
        });

        const response = await axios.post(
            `${API_URL}/company/${companyId}/purchases/order/${orderId}/edit`,
            apiFormData,
            {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                },
                timeout: 30000
            }
        );

        return {
            success: response.data?.status?.code === 200,
            message: response.data?.status?.message || 'Order updated successfully',
            updatedOrder: response.data?.data?.order
        };

    } catch (error: any) {
        console.error('Error updating order:', {
            message: error.message,
            response: error.response?.data,
            status: error.response?.status,
            orderId,
            timestamp: new Date().toISOString()
        });

        let errorMessage = 'Technical error during update';
        
        if (error.response?.data) {
            if (error.response.data.errors) {
                errorMessage = Object.entries(error.response.data.errors)
                    .map(([key, value]) => `${key}: ${(value as string[]).join(', ')}`)
                    .join(' | ');
            } else if (error.response.data.status?.message) {
                errorMessage = error.response.data.status.message;
            }
        }

        return {
            success: false,
            message: errorMessage
        };
    }
};

export const checkOrderNumber = async (
    orderNumber: string,
    currentOrderId?: string
): Promise<{ available: boolean; message: string }> => {
    const { token, companyId } = await fetchTokenAndCompanyid();
    
    try {
        const url = `${API_URL}/company/${companyId}/purchases/order/check/${orderNumber}`;
        const finalUrl = currentOrderId ? `${url}/${currentOrderId}` : url;
        
        const response = await axios.get(finalUrl, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        
        return {
            available: response.data?.available === true,
            message: response.data?.message || ''
        };
    } catch (error) {
        console.error('Error checking order number:', error);
        return {
            available: false,
            message: 'Failed to check order number availability'
        };
    }
};

export const convertOrderToInvoice = async (
    orderId: string
): Promise<{ success: boolean; message: string; invoiceId?: string }> => {
    const { token, companyId } = await fetchTokenAndCompanyid();
    
    try {
        const response = await axios.get(
            `${API_URL}/company/${companyId}/purchases/order/${orderId}/invoice`,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );
        
        return {
            success: response.data?.status?.code === 200,
            message: response.data?.status?.message || 'Order converted to invoice successfully',
            invoiceId: response.data?.data?.invoice_id
        };
    } catch (error) {
        console.error('Error converting order to invoice:', error);
        return {
            success: false,
            message: 'Failed to convert order to invoice'
        };
    }
};
import axios from 'axios';
import { Preferences } from '@capacitor/preferences';
import { AddInvoiceForm, ItemTax, SendInvoiceRequest } from '@/models/InvoicesModel';



export const API_URL = 'https://preprod-api.iberis.io/fr/api/private';
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
export const fetchToken = async (): Promise<string> => {
  const { value } = await Preferences.get({ key: 'auth_token' });
  if (!value) {
    throw new Error('Missing token');
  }
  return value; 
};

export const fetchInvoices = async () => {
  const { token, companyId } = await fetchTokenAndCompanyid();  
  console.log('Fetching invoices for companyId:', companyId);

  const response = await axios.get(`${API_URL}/company/${companyId}/sales/invoices`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data.data; 
};
export const deleteInvoice = async (invoiceId: string) => {
  const { token, companyId } = await fetchTokenAndCompanyid();  
  const response = await axios.get(`${API_URL}/company/${companyId}/sales/invoice/${invoiceId}/delete`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data.data; 
};

export const getInvoice = async (invoiceId: string) => {
  const { token, companyId } = await fetchTokenAndCompanyid();  
  const response = await axios.get(`${API_URL}/company/${companyId}/sales/invoice/${invoiceId}/synthesis`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data.data.invoice;
};

export const fetchInvoicePdfUrl = async (invoiceId: string) => {
  const { token, companyId } = await fetchTokenAndCompanyid();  
  const response = await axios.get(`${API_URL}/company/${companyId}/sales/invoice/${invoiceId}/synthesis`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  const documentName = response.data.data.invoice.invoice_number;
  console.log('lena : ',documentName );
  const pdfUrl = `https://preprod-api.iberis.io/storage/invoices/${companyId}/${documentName}.pdf`;
  return pdfUrl; 
};

export const downloadInvoice = async (invoiceId: string) => {
  const { token, companyId } = await fetchTokenAndCompanyid();  
  try {
    const response = await axios.get(
      `${API_URL}/company/${companyId}/sales/invoice/${invoiceId}/download`,
      {
        responseType: 'blob',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );
    let filename = `invoice_${invoiceId}.pdf`;
    const contentDisposition = response.headers['content-disposition'];
    if (contentDisposition) {
      const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
      if (filenameMatch && filenameMatch[1]) {
        filename = filenameMatch[1].replace(/['"]/g, '');
      }
    }
    const blob = new Blob([response.data], { type: 'application/pdf' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    window.URL.revokeObjectURL(url);
    link.remove();
    return true;
  } catch (error) {
    console.error('Invoice download failed:', error);
    throw error;
  }
};



export const createInvoice = async (InvoiceForm: AddInvoiceForm) => {
  const { token, companyId } = await fetchTokenAndCompanyid();
  const formData = new FormData();

  console.log('FULL INVOICE FORM:', JSON.stringify({
    ...InvoiceForm,

  }));
  for (const [key, value] of Object.entries(InvoiceForm)) {
    if (!['items', 'totals', 'additionalEntries', 'recurrence'].includes(key)) {
      formData.append(key, value as string);
    }
  }

  const itemsList = Array.isArray(InvoiceForm.items) ? InvoiceForm.items : [InvoiceForm.items].filter(Boolean);

  itemsList.forEach(item => {
    formData.append('items[]', JSON.stringify({
      item_hashed_id: item.id || "",
      item: item.title || "",
      description: item.description || "",
      discountAmount: item.discount?.value || 0,
      discountType: item.discount?.type === "%" ? 0 : 1,
      qte: item.quantity || 1,
      price: item.unitPrice || 0,
      journal_hashed_id: item.journal_id || "",
    }));
  });
  formData.append('totals', JSON.stringify(InvoiceForm.totals));
  formData.append('additionalEntries', JSON.stringify(InvoiceForm.additionalEntries));
  formData.append('recurrence', JSON.stringify(InvoiceForm.recurrence));
  try {
    const response = await axios.post(
      `${API_URL}/company/${companyId}/sales/invoice/new`, 
      formData,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
    console.log("Response data:", response.data);
    return response.data.data;
  } catch (error : any) {
    console.error("Error creating invoice:", error.response?.data || error.message);
    throw error;
  }
};


export const getLastInvoiceNumber = async (): Promise<number> => {
  const response = await fetchInvoices();
  const invoices = response.invoices?.data || [];
  if (!invoices || invoices.length === 0) return 1;
  const numbers = invoices.map((inv: any) => {
    const parts = inv.invoice_number?.split('-');
    const seq = parts?.[1];
    return seq ? Number(seq) : 0;
  });
  return Math.max(...numbers) + 1;
};


export const updateInvoice = async (invoiceId: string, InvoiceForm: AddInvoiceForm) => {
  const { token, companyId } = await fetchTokenAndCompanyid();
  const formData = new FormData();
  for (const [key, value] of Object.entries(InvoiceForm)) {
    if (!['items', 'totals', 'additionalEntries', 'recurrence', 'attachments'].includes(key)) {
        formData.append(key, value as string);
    }
  }
  if (Array.isArray(InvoiceForm.attachments)) {
    InvoiceForm.attachments.forEach((attachment) => {
      if (attachment instanceof File) {
        formData.append('attachments[]', attachment);
      } else {
        formData.append('existing_attachments[]', attachment.hashed_id);
      }
    });
  }
  if (Array.isArray(InvoiceForm.items)) {
    InvoiceForm.items.forEach(item => {
      const apiItem = {
        item_hashed_id: item.id,
        item: item.title,
        description: item.description || "",
        discountAmount: item.discount?.value || 0,
        discountType: item.discount?.type === "%" ? 0 : 1,
        qte: item.quantity,
        price: item.unitPrice,
        taxes: item.taxes?.map(tax => ({
          hashed_tax_id: tax.hashed_id,  
          rate: tax.rate
        })) || []
      };
      formData.append('items[]', JSON.stringify(apiItem));
    });
  } else {
    const item = InvoiceForm.items as any;
    if (item && typeof item === 'object') {
      const apiItem = {
        item_hashed_id: item.id || "",
        item: item.title || "",
        description: item.description || "",
        discountAmount: (item.discount?.value !== undefined) ? item.discount.value : 0,
        discountType: (item.discount?.type === "%") ? 0 : 1,
        qte: item.quantity || 1,
        price: item.unitPrice || 0,
        taxes: item.taxes?.map((tax: ItemTax) => ({
          tax_hashed_id: tax.hashed_id,
          rate: tax.rate
        })) || []
      };
      formData.append('items[]', JSON.stringify(apiItem));
    } else {
      console.error("Invalid items format:", InvoiceForm.items);
    }
  }
  formData.append('invoice_category_id', InvoiceForm.category);
  formData.append('invoice_deadline_id', InvoiceForm.deadline);
  formData.append('conditions', InvoiceForm.generalTerms);
  formData.append('notes', InvoiceForm.remarks);
  formData.append('bank_id', InvoiceForm.selected_bank);
  formData.append('withholding_type_id', InvoiceForm.withholding_type_id);

  formData.append('totals', JSON.stringify(InvoiceForm.totals));
  formData.append('additionalEntries', JSON.stringify(InvoiceForm.additionalEntries));
  formData.append('recurrence', JSON.stringify(InvoiceForm.recurrence));
  for (const pair of (formData as any).entries()) {
    console.log(`${pair[0]}: ${pair[1]}`);
  }
  try {
    const response = await axios.post(
      `${API_URL}/company/${companyId}/sales/invoice/${invoiceId}/edit`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
    console.log("Response data:", response.data);
    return response.data.data;
  } catch (error: any) {
    console.error("Error updating invoice:", error.response?.data || error.message);
    throw error;
  }
};

export const sendInvoice = async (invoiceId: string, emailData: SendInvoiceRequest) => {
  try {
    const { token, companyId } = await fetchTokenAndCompanyid();
    
    const response = await fetch(
      `${API_URL}/company/${companyId}/sales/invoice/${invoiceId}/send`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(emailData),
      }
    );
    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(
        errorData?.status?.message || 
        `Failed to send invoice: ${response.status} ${response.statusText}`
      );
    }
    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error sending invoice:', error);
    throw error;
  }
};


export const uploadToDropbox = async (invoiceId: string) => {
  try {
    const { token, companyId } = await fetchTokenAndCompanyid();
    const response = await fetch(
      `${API_URL}/company/${companyId}/integrations/dropbox/upload`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          document_type: 'invoice',
          document_id: invoiceId
        }),
      }
    );
    if (!response.ok) {
      throw new Error(`Failed to upload to Dropbox: ${response.status}`);
    }
    const result = await response.json();
    return result.data.url;
  } catch (error) {
    console.error('Error uploading to Dropbox:', error);
    throw error;
  }
};

export const sendWhatsAppMessage = async (phoneNumber: string, message: string, attachmentUrl?: string) => {
  try {
    let cleanNumber = phoneNumber.replace(/[^\d+]/g, '');
    
    if (!cleanNumber.startsWith('+')) {
      if (cleanNumber.startsWith('216')) {
        cleanNumber = '+' + cleanNumber;
      } else {
        cleanNumber = '+216' + cleanNumber;
      }
    }

    let fullMessage = message;
    if (attachmentUrl) {
      fullMessage += `\n\nDocument: ${attachmentUrl}`;
    }
    const encodedMessage = encodeURIComponent(fullMessage);

    // For mobile (Ionic/Capacitor), use the native WhatsApp URL scheme
    const whatsappUrl = `whatsapp://send?phone=${cleanNumber}&text=${encodedMessage}`;

    // For web fallback
    const webWhatsappUrl = `https://api.whatsapp.com/send?phone=${cleanNumber}&text=${encodedMessage}`;
    
    // Try to open native WhatsApp first, fallback to web
    try {
      // Use Capacitor's App plugin to open native WhatsApp
      window.open(whatsappUrl, '_system');
    } catch (nativeError) {
      window.open(webWhatsappUrl, '_blank');
    }

    return true;
  } catch (error) {
    console.error('Error sending WhatsApp message:', error);
    throw error;
  }
};
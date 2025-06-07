import { Preferences } from '@capacitor/preferences';
import axios from 'axios';
import { PaymentForm } from '@/models/PaymentModel'

export const API_URL = 'https://preprod-api.iberis.io/en/api/private'; 


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


export const getSalesPayments = async () => {
  const { token, companyId } = await fetchTokenAndCompanyid();  

  const response = await axios.get(`${API_URL}/company/${companyId}/sales/payments`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data.data; 
};

export const getSalesPayment = async (paymentId: string) => {
  const { token, companyId } = await fetchTokenAndCompanyid();  
  const response = await axios.get(`${API_URL}/company/${companyId}/sales/payment/${paymentId}/synthesis`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data.data.payment;
};

export const getPaymentMethods = async () => {
  const { token, companyId } = await fetchTokenAndCompanyid();  
  const response = await axios.get(`${API_URL}/company/${companyId}/methods`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data.data.paymentMethods; 
};

export const getLastPaymentNumber = async (): Promise<number> => {
  const response = await getSalesPayments();
  const payments = response.payments?.data || [];
  if (!payments || payments.length === 0) return 1;
  
  const numbers = payments.map((payment: any) => {
    const parts = payment.payment_number?.split('-');
    const lastPart = parts?.[parts.length - 1]; 
    return lastPart ? Number(lastPart) : 0;
  });
  
  return Math.max(...numbers) + 1;
};

export const getClientDocuments = async (clientId: string) => {
  const { token, companyId } = await fetchTokenAndCompanyid();  
  const response = await axios.get(`${API_URL}/company/${companyId}/sales/payment/client/${clientId}/documents`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data.data; 
};


export const deletesSalesPayments = async (paymentId: string) => {
  const { token, companyId } = await fetchTokenAndCompanyid();  
  const response = await axios.get(`${API_URL}/company/${companyId}/sales/payment/${paymentId}/delete`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data.data; 
};

export const addSalesPayments = async (paymentData: PaymentForm) => {
  const { token, companyId } = await fetchTokenAndCompanyid();  
  const formData = new FormData();
  formData.append('date', paymentData.date);
  formData.append('payment_number', paymentData.payment_number);
  formData.append('payment_method', paymentData.payment_method);
  formData.append('bank_id', paymentData.bank_id || '-1');
  formData.append('client_id', paymentData.client_id);
  formData.append('currency_rate', paymentData.currency_rate?.toString() || '1');
  formData.append('language', paymentData.language);
  formData.append('total', paymentData.paid?.toString() || '0');
  if (paymentData.reference) {
    formData.append('reference_number', paymentData.reference); 
  }
  if (paymentData.notes) {
    formData.append('notes', paymentData.notes);
  }
  if (paymentData.bank_fee) {
    formData.append('bank_fee', paymentData.bank_fee.toString());
  }
  if (paymentData.bankTaxId) {
    formData.append('hashed_bank_tax_id', paymentData.bankTaxId); 
  }
  formData.append('display', JSON.stringify({
    stamp: paymentData.use_stamp,
    notes: 1
  }));
  if (paymentData.pay && paymentData.pay.length > 0) {
    paymentData.pay.forEach(pay => {
      const apiPay: any = {
        amount: pay.amount,
      };
  
      if (pay.invoice_hashed_id) {
        apiPay.invoice_hashed_id = pay.invoice_hashed_id;
      } else if (pay.disbursement_hashed_id) {
        apiPay.disbursement_hashed_id = pay.disbursement_hashed_id;
      }
  
      formData.append('pay[]', JSON.stringify(apiPay));
    });
  }
  if (paymentData.attachments && paymentData.attachments.length > 0) {
    paymentData.attachments.forEach((file, index) => {
      if (file instanceof File) {
        formData.append(`attachments[${index}]`, file);
      }
    });
  }
  const response = await axios.post(
    `${API_URL}/company/${companyId}/sales/payment/new`, 
    formData,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data'
      },
    }
  );
  console.log("Full API Response:", response);
  return response.data.data;
};

export const fetchSalesPaymentPdfUrl = async (paymentId: string) => {
  const { token, companyId } = await fetchTokenAndCompanyid();  
  const response = await axios.get(`${API_URL}/company/${companyId}/sales/payment/${paymentId}/synthesis`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  const documentName = response.data.data.payment.payment_number;
  console.log('lena : ',documentName );
  const pdfUrl = `https://preprod-api.iberis.io/storage/sales/payments/${companyId}/${documentName}.pdf`;
  return pdfUrl; 
};

export const downloadPayment = async (paymentId: string) => {
  const { token, companyId } = await fetchTokenAndCompanyid();  
  try {
    const response = await axios.get(
      `${API_URL}/company/${companyId}/sales/payment/${paymentId}/download`,
      {
        responseType: 'blob',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );
    let filename = `payment_${paymentId}.pdf`;
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
    console.error('Payment download failed:', error);
    throw error;
  }
};


export const updateSalesPayment = async (paymentId: string, paymentData: PaymentForm) => {
  const { token, companyId } = await fetchTokenAndCompanyid();  
  
  const formData = new FormData();
  
  formData.append('date', paymentData.date);
  formData.append('payment_number', paymentData.payment_number);
  formData.append('payment_method', paymentData.payment_method);
  formData.append('bank_id', paymentData.bank_id || '-1');
  formData.append('client_id', paymentData.client_id);
  formData.append('currency_rate', (paymentData.currency_rate || 1).toString());
  formData.append('language', paymentData.language);
  formData.append('total', (paymentData.paid || 0).toString());
  if (paymentData.reference) {
      formData.append('reference', paymentData.reference);
  }
  
  if (paymentData.notes) {
    formData.append('notes', paymentData.notes);
  }
  
  if (paymentData.bank_fee) {
    formData.append('bank_fee', paymentData.bank_fee.toString());
  }
  
  if (paymentData.bankTaxId) {
    formData.append('bank_tax_id', paymentData.bankTaxId); 
  }

  formData.append('display', JSON.stringify({
    stamp: paymentData.use_stamp,
    notes: 1
  }));

  if (paymentData.pay && paymentData.pay.length > 0) {
    paymentData.pay.forEach(pay => {
      const apiPay: any = {
        amount: pay.amount,
      };
  
      if (pay.invoice_hashed_id) {
        apiPay.invoice_hashed_id = pay.invoice_hashed_id;
      } else if (pay.disbursement_hashed_id) {
        apiPay.disbursement_hashed_id = pay.disbursement_hashed_id;
      }
  
      formData.append('pay[]', JSON.stringify(apiPay));
    });
  }
  if (paymentData.attachments && paymentData.attachments.length > 0) {
    paymentData.attachments.forEach((file, index) => {
      if (file instanceof File) {
        formData.append(`attachments[${index}]`, file);
      }
    });
  }

  
  console.log("=== COMPLETE FORM DATA DEBUG ===");
  console.log("Payment ID:", paymentId);
  console.log("Original paymentData:", paymentData);
  
  console.log("\n--- FormData entries ---");
  for (let [key, value] of formData.entries()) {
    console.log(`${key}: ${value}`);
  }
  
  console.log("\n--- Specific field checks ---");
  console.log("reference_number in FormData:", formData.get('reference_number'));
  console.log("language in FormData:", formData.get('language'));
  console.log("display in FormData:", formData.get('display'));
  console.log("=== END FORM DATA DEBUG ===");


  const response = await axios.post(
    `${API_URL}/company/${companyId}/sales/payment/${paymentId}/edit`, 
    formData,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data'
      },
    }
  );
  
  console.log("Full Update API Response:", response);
  return response.data;
};














export const getEmittedPayments = async (companyId: string) => {
  const token = await Preferences.get({ key: 'auth_token' });

  return axios.get(`${API_URL}/company/${companyId}/purchases/payments`, {
    headers: {
      Authorization: `Bearer ${token.value}`,
    },
  });
};


export const getPaymentsReceived = (token: string, companyId: string) => {
    return axios.get(`/api/companies/${companyId}/payments/received`, {
      headers: { Authorization: `Bearer ${token}` }
    });
  };

  export const getPaymentsEmitted = (token: string, companyId: string) => {
    return axios.get(`/api/companies/${companyId}/payments/emitted`, {
      headers: { Authorization: `Bearer ${token}` }
    });
  };
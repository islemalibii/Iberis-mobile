import axios from 'axios';
import { Preferences } from '@capacitor/preferences';

const BASE_URL = 'https://preprod-api.iberis.io';

export interface Payment {
  id: string;
  date: string;
  amount: string;
  reference: string;
  client?: {
    name: string;
  };
  provider?: {
    name: string;
  };
}

export interface PaymentsResponse {
  data: {
    data: Payment[];
    total: number;
  };
}

export const getPaymentsReceived = async (
  token: string,
  companyId: string,
  startDate?: string,
  endDate?: string
): Promise<PaymentsResponse> => {
  try {
    let url = `${BASE_URL}/fr/api/private/company/${companyId}/sales/payments`;
    
    const params = new URLSearchParams();
    if (startDate) params.append('start_date', startDate);
    if (endDate) params.append('end_date', endDate);
    
    if (params.toString()) {
      url += `?${params.toString()}`;
    }

    const response = await axios.get(url, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });

    return response.data;
  } catch (error) {
    console.error('Error fetching received payments:', error);
    throw error;
  }
};

export const getPaymentsEmitted = async (
  token: string,
  companyId: string,
  startDate?: string,
  endDate?: string
): Promise<PaymentsResponse> => {
  try {
    let url = `${BASE_URL}/fr/api/private/company/${companyId}/purchases/payments`;
    
    const params = new URLSearchParams();
    if (startDate) params.append('start_date', startDate);
    if (endDate) params.append('end_date', endDate);
    
    if (params.toString()) {
      url += `?${params.toString()}`;
    }

    const response = await axios.get(url, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });

    return response.data;
  } catch (error) {
    console.error('Error fetching emitted payments:', error);
    throw error;
  }
};

export const getTotalPayments = async (
  companyId: string,
  startDate?: string,
  endDate?: string
): Promise<{
  totalReceived: number;
  totalEmitted: number;
}> => {
  try {
    const token = (await Preferences.get({ key: 'auth_token' })).value;
    if (!token) throw new Error('No auth token found');

    const [receivedResponse, emittedResponse] = await Promise.all([
      getPaymentsReceived(token, companyId, startDate, endDate),
      getPaymentsEmitted(token, companyId, startDate, endDate)
    ]);

    // Safely calculate totals with better error handling
    const totalReceived = receivedResponse?.data?.data?.reduce(
      (sum: number, payment: Payment) => {
        const amount = parseFloat(payment.amount);
        return sum + (isNaN(amount) ? 0 : amount);
      }, 0
    ) || 0;

    const totalEmitted = emittedResponse?.data?.data?.reduce(
      (sum: number, payment: Payment) => {
        const amount = parseFloat(payment.amount);
        return sum + (isNaN(amount) ? 0 : amount);
      }, 0
    ) || 0;

    return {
      totalReceived,
      totalEmitted
    };
  } catch (error) {
    console.error('Error calculating total payments:', error);
    return {
      totalReceived: 0,
      totalEmitted: 0
    };
  }
};
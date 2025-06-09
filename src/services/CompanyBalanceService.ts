import axios from 'axios';
import { Preferences } from '@capacitor/preferences';
import moment from 'moment';

const BASE_URL = 'https://preprod-api.iberis.io/fr/api/private/company';

export interface CompanyBalanceData {
  integer: string;
  strings: string;
  extraData: {
    currencySymbol: string;
  };
}

export function defineCompanyAccountingDates(company: { accounting_period_id: number }): {
  start: string;
  end: string;
} {
  console.log('[DATES] Calculating accounting dates for period:', company.accounting_period_id);
  
  const now = moment();
  const currentMonth = now.month() + 1;
  const currentYear = now.year();

  const accountingStartMonth = company.accounting_period_id;
  
  let startYear = currentYear;
  let endYear = currentYear;
  
  if (currentMonth < accountingStartMonth) {
    startYear = currentYear - 1;
  } else {
    endYear = currentYear + 1;
  }
  
  const startingDate = moment()
    .year(startYear)
    .month(accountingStartMonth - 1)
    .date(1)
    .startOf('day');
  
  const endDate = moment()
    .year(endYear)
    .month(accountingStartMonth - 1)
    .subtract(1, 'day')
    .endOf('day');
  
  return {
    start: startingDate.format('YYYY-MM-DD'),
    end: endDate.format('YYYY-MM-DD'),
  };
}

export function getCurrentYearDates() {
  return {
    start: moment().startOf('year').format('YYYY-MM-DD'),
    end: moment().endOf('year').format('YYYY-MM-DD')
  };
}

async function getCompanyInfo() {
  const companyId = (await Preferences.get({ key: 'current_company_id' })).value;
  const token = (await Preferences.get({ key: 'auth_token' })).value;
  
  if (!token || !companyId) {
    throw new Error('Authentication required. Please log in again.');
  }

  try {
    const response = await axios.get(`${BASE_URL}/${companyId}`, {
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });

    return response.data.data;
  } catch (error) {
    console.warn('Failed to fetch company info, using current date as fallback');
    return null;
  }
}

// Fonction pour créer des données vides par défaut
function createEmptyBalanceData(currencySymbol: string = ''): CompanyBalanceData {
  return {
    integer: '0',
    strings: '0.000',
    extraData: {
      currencySymbol
    }
  };
}

export const getCompanyBalance = async (
  fromDate?: string,
  toDate?: string
): Promise<CompanyBalanceData> => {
  const token = (await Preferences.get({ key: 'auth_token' })).value;
  const companyId = (await Preferences.get({ key: 'current_company_id' })).value;

  if (!token || !companyId) {
    console.error('Missing authentication token or company ID');
    throw new Error('Authentication required. Please log in again.');
  }

  let url = `${BASE_URL}/${companyId}/statistics/balance`;
  let finalToDate = toDate;

  // Si aucune date n'est fournie, utiliser les dates comptables de l'entreprise
  if (!fromDate && !toDate) {
    try {
      const companyInfo = await getCompanyInfo();
      if (companyInfo && companyInfo.accounting_period_id) {
        const { end } = defineCompanyAccountingDates(companyInfo);
        finalToDate = end;
        console.log('Using company accounting period end date as default:', finalToDate);
      } else {
        // Fallback vers la date courante
        finalToDate = moment().format('YYYY-MM-DD');
        console.log('Using current date as fallback:', finalToDate);
      }
    } catch (error) {
      finalToDate = moment().format('YYYY-MM-DD');
      console.log('Error fetching company info, using current date:', finalToDate);
    }
  }

  // Si on a fromDate et toDate, utiliser toDate
  // Si on a seulement toDate, l'utiliser
  // Sinon utiliser la date calculée
  const dateToUse = toDate || finalToDate;

  // Valider la date si fournie
  if (dateToUse) {
    if (!moment(dateToUse, 'YYYY-MM-DD', true).isValid()) {
      throw new Error('Invalid date format. Please use YYYY-MM-DD');
    }
    url += `/${dateToUse}`;
  }

  try {
    console.log('Fetching balance data from:', url);
    const response = await axios.get(url, {
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      timeout: 15000
    });

    if (!response.data?.data) {
      throw new Error('Invalid response format from server');
    }

    return response.data.data;
  } catch (error: any) {
    console.error('API request failed:', {
      url,
      error: error.message,
      status: error.response?.status
    });

    // En cas d'erreur 404 ou si pas de données, retourner une structure vide
    if (error.response?.status === 404) {
      console.log('No balance data found, returning empty structure');
      return createEmptyBalanceData();
    }

    if (error.response) {
      switch (error.response.status) {
        case 400: throw new Error('Invalid request parameters');
        case 401: throw new Error('Session expired. Please log in again');
        case 403: throw new Error('You do not have permission to access this data');
        case 500: throw new Error('Server error. Please try again later');
        default: throw new Error(`Request failed with status ${error.response.status}`);
      }
    } else if (error.request) {
      throw new Error('No response from server. Please check your connection');
    } else {
      throw new Error(error.message || 'An unknown error occurred');
    }
  }
};

export const getCompanyBalanceWithCompanyDates = async (
  company: { accounting_period_id: number }
): Promise<CompanyBalanceData> => {
  try {
    const { end } = defineCompanyAccountingDates(company);
    return await getCompanyBalance(undefined, end);
  } catch (error) {
    console.warn('Falling back to default behavior');
    return await getCompanyBalance();
  }
};

export const getCurrentDateBalance = async (): Promise<CompanyBalanceData> => {
  const currentDate = moment().format('YYYY-MM-DD');
  return getCompanyBalance(undefined, currentDate);
};

// Test exports
export const __test__ = {
  defineCompanyAccountingDates,
  getCurrentYearDates,
  getCompanyInfo,
  createEmptyBalanceData
};
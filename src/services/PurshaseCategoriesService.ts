import axios from 'axios';
import { Preferences } from '@capacitor/preferences';
import moment from 'moment';

const BASE_URL = 'https://preprod-api.iberis.io/fr/api/private/company';

export interface PurchaseCategoriesData {
  topFiveExpenseCategories: {
    [key: string]: number;
  };
  extraData: {
    currencySymbol: string;
    strings: string;
    integer: string;
    notFormatted: number;
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

// Fonction pour récupérer les informations de l'entreprise
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
    console.warn('Failed to fetch company info, using current year as fallback');
    return null;
  }
}

export const getPurchaseCategories = async (
  fromDate?: string,
  toDate?: string
): Promise<PurchaseCategoriesData> => {
  const token = (await Preferences.get({ key: 'auth_token' })).value;
  const companyId = (await Preferences.get({ key: 'current_company_id' })).value;

  if (!token || !companyId) {
    console.error('Missing authentication token or company ID');
    throw new Error('Authentication required. Please log in again.');
  }

  let url = `${BASE_URL}/${companyId}/statistics/purchasesCategories`;

  // Si aucune date n'est fournie, utiliser les dates comptables de l'entreprise
  if (!fromDate && !toDate) {
    try {
      const companyInfo = await getCompanyInfo();
      if (companyInfo && companyInfo.accounting_period_id) {
        const { start, end } = defineCompanyAccountingDates(companyInfo);
        fromDate = start;
        toDate = end;
        console.log('Using company accounting period as default date range:', fromDate, 'to', toDate);
      } else {
        // Fallback vers l'année courante si impossible de récupérer les infos de l'entreprise
        const { start, end } = getCurrentYearDates();
        fromDate = start;
        toDate = end;
        console.log('Using current year as fallback date range:', fromDate, 'to', toDate);
      }
    } catch (error) {
      // En cas d'erreur, utiliser l'année courante
      const { start, end } = getCurrentYearDates();
      fromDate = start;
      toDate = end;
      console.log('Error fetching company info, using current year:', fromDate, 'to', toDate);
    }
  }

  // Valider et utiliser les dates si fournies
  if (fromDate && toDate) {
    if (!moment(fromDate, 'YYYY-MM-DD', true).isValid() || 
        !moment(toDate, 'YYYY-MM-DD', true).isValid()) {
      throw new Error('Invalid date format. Please use YYYY-MM-DD');
    }
    
    if (moment(fromDate).isAfter(moment(toDate))) {
      throw new Error('Start date must be before end date');
    }
    
    url += `/${fromDate}/${toDate}`;
  }

  try {
    console.log('Fetching purchase categories from:', url);
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

    if (error.response) {
      switch (error.response.status) {
        case 400: throw new Error('Invalid request parameters');
        case 401: throw new Error('Session expired. Please log in again');
        case 403: throw new Error('You do not have permission to access this data');
        case 404: throw new Error('Company data not found');
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

export const getPurchaseCategoriesWithCompanyDates = async (
  company: { accounting_period_id: number }
): Promise<PurchaseCategoriesData> => {
  try {
    // Utiliser les dates comptables de l'entreprise
    const { start, end } = defineCompanyAccountingDates(company);
    return await getPurchaseCategories(start, end);
  } catch (error) {
    console.warn('Falling back to default behavior (company accounting dates or current year)');
    // Fallback vers le comportement par défaut (qui utilise maintenant les dates comptables)
    return await getPurchaseCategories();
  }
};

// Fonction utilitaire pour la plage du mois courant
export const getCurrentMonthPurchases = async (): Promise<PurchaseCategoriesData> => {
  const start = moment().startOf('month').format('YYYY-MM-DD');
  const end = moment().endOf('month').format('YYYY-MM-DD');
  return getPurchaseCategories(start, end);
};

// Test exports
export const __test__ = {
  defineCompanyAccountingDates,
  getCurrentYearDates,
  getCompanyInfo
};
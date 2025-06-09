import axios from 'axios';
import { Preferences } from '@capacitor/preferences';
import moment from 'moment';

const BASE_URL = 'https://preprod-api.iberis.io/fr/api/private/company';

export interface ResultsData {
  currentExerciseYear: string;
  organisedMonths: string[];
  expensesConvertedSum: number[];
  invoicesConvertedSum: number[];
  extraData: {
    notFormatted: number;
    strings: string;
    integer: string;
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
function createEmptyResultsData(currencySymbol: string = 'TND'): ResultsData {
  const currentYear = new Date().getFullYear().toString();
  return {
    currentExerciseYear: currentYear,
    organisedMonths: [],
    expensesConvertedSum: [],
    invoicesConvertedSum: [],
    extraData: {
      notFormatted: 0,
      strings: '0.000',
      integer: '0',
      currencySymbol
    }
  };
}

export const getCompanyResults = async (
  fromDate?: string, 
  toDate?: string
): Promise<ResultsData> => {
  const token = (await Preferences.get({ key: 'auth_token' })).value;
  const companyId = (await Preferences.get({ key: 'current_company_id' })).value;

  if (!token || !companyId) {
    console.error('Missing authentication token or company ID');
    throw new Error('Authentication required. Please log in again.');
  }

  let url = `${BASE_URL}/${companyId}/statistics/result`;
  let finalFromDate = fromDate;
  let finalToDate = toDate;

  // Si aucune date n'est fournie, utiliser les dates comptables de l'entreprise
  if (!fromDate && !toDate) {
    try {
      const companyInfo = await getCompanyInfo();
      if (companyInfo && companyInfo.accounting_period_id) {
        const { start, end } = defineCompanyAccountingDates(companyInfo);
        finalFromDate = start;
        finalToDate = end;
        console.log('Using company accounting period:', finalFromDate, 'to', finalToDate);
      } else {
        // Fallback vers l'année courante
        const { start, end } = getCurrentYearDates();
        finalFromDate = start;
        finalToDate = end;
        console.log('Using current year as fallback:', finalFromDate, 'to', finalToDate);
      }
    } catch (error) {
      const { start, end } = getCurrentYearDates();
      finalFromDate = start;
      finalToDate = end;
      console.log('Error fetching company info, using current year:', finalFromDate, 'to', finalToDate);
    }
  }

  // Construire l'URL avec les dates
  if (finalFromDate && finalToDate) {
    // Valider les dates
    if (!moment(finalFromDate, 'YYYY-MM-DD', true).isValid()) {
      throw new Error('Invalid fromDate format. Please use YYYY-MM-DD');
    }
    if (!moment(finalToDate, 'YYYY-MM-DD', true).isValid()) {
      throw new Error('Invalid toDate format. Please use YYYY-MM-DD');
    }
    
    url += `/${finalFromDate}/${finalToDate}`;
  } else if (finalFromDate) {
    if (!moment(finalFromDate, 'YYYY-MM-DD', true).isValid()) {
      throw new Error('Invalid fromDate format. Please use YYYY-MM-DD');
    }
    url += `/${finalFromDate}`;
  }

  try {
    console.log('Fetching results data from:', url);
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

    // Vérifier que la structure des données est cohérente
    const data = response.data.data;
    if (!data.organisedMonths || !data.expensesConvertedSum || !data.invoicesConvertedSum) {
      console.warn('Incomplete data structure, using empty arrays');
      return createEmptyResultsData(data.extraData?.currencySymbol);
    }

    return data;
  } catch (error: any) {
    console.error('API request failed:', {
      url,
      error: error.message,
      status: error.response?.status
    });

    // En cas d'erreur 404 ou si pas de données, retourner une structure vide
    if (error.response?.status === 404) {
      console.log('No results data found, returning empty structure');
      return createEmptyResultsData();
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

export const getCompanyResultsWithCompanyDates = async (
  company: { accounting_period_id: number }
): Promise<ResultsData> => {
  try {
    const { start, end } = defineCompanyAccountingDates(company);
    return await getCompanyResults(start, end);
  } catch (error) {
    console.warn('Falling back to default behavior');
    return await getCompanyResults();
  }
};

export const getCurrentYearResults = async (): Promise<ResultsData> => {
  const { start, end } = getCurrentYearDates();
  return getCompanyResults(start, end);
};

// Test exports
export const __test__ = {
  defineCompanyAccountingDates,
  getCurrentYearDates,
  getCompanyInfo,
  createEmptyResultsData
};
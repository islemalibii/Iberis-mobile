import axios from 'axios';
import { Preferences } from '@capacitor/preferences';
import moment from 'moment';

const BASE_URL = 'https://preprod-api.iberis.io/fr/api/private/company';

export interface SalesData {
  currentExerciseYear: string;
  organisedMonths: string[];
  estimatesConvertedSum: number[];
  deliveriesConvertedSum: number[];
  incomesConvertedSum: number[];
  invoicesConvertedSum: number[];
  extraData: {
    currencySymbol: string;
    estimates: {
      strings: string;
      integer: string;
    };
    incomes: {
      strings: string;
      integer: string;
    };
    invoices: {
      strings: string;
      integer: string;
    };
    deliveries: {
      strings: string;
      integer: string;
    };
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
    console.warn('Failed to fetch company info, using current year as fallback');
    return null;
  }
}

// Fonction pour créer des données vides par défaut
function createEmptyData(fromDate: string, toDate: string, currencySymbol: string = 'TND'): SalesData {
  const start = moment(fromDate);
  const end = moment(toDate);
  const months: string[] = [];
  
  // Générer tous les mois entre les deux dates
  const current = start.clone();
  while (current.isSameOrBefore(end, 'month')) {
    months.push(current.format('MMMM'));
    current.add(1, 'month');
  }
  
  // Si aucun mois n'est généré, au moins mettre le mois courant
  if (months.length === 0) {
    months.push(moment().format('MMMM'));
  }
  
  const emptyArray = new Array(months.length).fill(0);
  
  return {
    currentExerciseYear: moment().year().toString(),
    organisedMonths: months,
    estimatesConvertedSum: emptyArray,
    deliveriesConvertedSum: emptyArray,
    incomesConvertedSum: emptyArray,
    invoicesConvertedSum: emptyArray,
    extraData: {
      currencySymbol,
      estimates: { strings: '0.000', integer: '0' },
      incomes: { strings: '0.000', integer: '0' },
      invoices: { strings: '0.000', integer: '0' },
      deliveries: { strings: '0.000', integer: '0' }
    }
  };
}

export const getCompanySales = async (
  fromDate?: string,
  toDate?: string
): Promise<SalesData> => {
  const token = (await Preferences.get({ key: 'auth_token' })).value;
  const companyId = (await Preferences.get({ key: 'current_company_id' })).value;

  if (!token || !companyId) {
    console.error('Missing authentication token or company ID');
    throw new Error('Authentication required. Please log in again.');
  }

  let url = `${BASE_URL}/${companyId}/statistics/sales`;
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
        console.log('Using company accounting period as default date range:', finalFromDate, 'to', finalToDate);
      } else {
        // Fallback vers l'année courante
        const { start, end } = getCurrentYearDates();
        finalFromDate = start;
        finalToDate = end;
        console.log('Using current year as fallback date range:', finalFromDate, 'to', finalToDate);
      }
    } catch (error) {
      const { start, end } = getCurrentYearDates();
      finalFromDate = start;
      finalToDate = end;
      console.log('Error fetching company info, using current year:', finalFromDate, 'to', finalToDate);
    }
  }

  // Valider et utiliser les dates si fournies
  if (finalFromDate && finalToDate) {
    if (!moment(finalFromDate, 'YYYY-MM-DD', true).isValid() || 
        !moment(finalToDate, 'YYYY-MM-DD', true).isValid()) {
      throw new Error('Invalid date format. Please use YYYY-MM-DD');
    }
    
    if (moment(finalFromDate).isAfter(moment(finalToDate))) {
      throw new Error('Start date must be before end date');
    }
    
    url += `/${finalFromDate}/${finalToDate}`;
  }

  try {
    console.log('Fetching sales data from:', url);
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

    const data = response.data.data;
    
    // Vérifier si on a des données valides
    if (!data.organisedMonths || data.organisedMonths.length === 0 ||
        (!data.estimatesConvertedSum?.some((v: number) => v > 0) &&
         !data.deliveriesConvertedSum?.some((v: number) => v > 0) &&
         !data.invoicesConvertedSum?.some((v: number) => v > 0) &&
         !data.incomesConvertedSum?.some((v: number) => v > 0))) {
      
      console.log('No valid data found for period, returning empty structure');
      return createEmptyData(finalFromDate!, finalToDate!, data.extraData?.currencySymbol || 'TND');
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
      console.log('No data found for period, returning empty structure');
      return createEmptyData(finalFromDate!, finalToDate!);
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

export const getCompanySalesWithCompanyDates = async (
  company: { accounting_period_id: number }
): Promise<SalesData> => {
  try {
    const { start, end } = defineCompanyAccountingDates(company);
    return await getCompanySales(start, end);
  } catch (error) {
    console.warn('Falling back to default behavior');
    return await getCompanySales();
  }
};

export const getCurrentMonthSales = async (): Promise<SalesData> => {
  const start = moment().startOf('month').format('YYYY-MM-DD');
  const end = moment().endOf('month').format('YYYY-MM-DD');
  return getCompanySales(start, end);
};

// Test exports
export const __test__ = {
  defineCompanyAccountingDates,
  getCurrentYearDates,
  getCompanyInfo,
  createEmptyData
};
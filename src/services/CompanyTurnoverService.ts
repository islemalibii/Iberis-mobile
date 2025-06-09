import axios from 'axios';
import { Preferences } from '@capacitor/preferences';
import moment from 'moment';

const BASE_URL = 'https://preprod-api.iberis.io/fr/api/private/company';

export interface TurnoverData {
  currentExerciseYear: string;
  lastExerciseYear: string;
  organisedMonths: string[];
  currentExerciseInvoices: number[];
  lastExerciseInvoices: number[];
  extraData: {
    notFormatted: number;
    currencySymbol: string;
  };
}

export function defineCompanyAccountingDates(company: { accounting_period_id: number }): {
  start: string;
  end: string;
} {
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

export const getCompanyTurnover = async (
  fromDate?: string,
  toDate?: string
): Promise<TurnoverData> => {
  const token = (await Preferences.get({ key: 'auth_token' })).value;
  const companyId = (await Preferences.get({ key: 'current_company_id' })).value;

  if (!token || !companyId) {
    throw new Error('Authentification requise');
  }

  let url = `${BASE_URL}/${companyId}/statistics/turnover`;

  // Utiliser l'année courante si aucune date n'est fournie
  if (!fromDate && !toDate) {
    const { start, end } = getCurrentYearDates();
    fromDate = start;
    toDate = end;
    console.log('Utilisation des dates par défaut (année courante):', fromDate, toDate);
  }

  // Valider et utiliser les dates si fournies
  if (fromDate && toDate) {
    if (!moment(fromDate, 'YYYY-MM-DD', true).isValid() || 
        !moment(toDate, 'YYYY-MM-DD', true).isValid()) {
      throw new Error('Format de date invalide (YYYY-MM-DD requis)');
    }
    
    if (moment(fromDate).isAfter(moment(toDate))) {
      throw new Error('La date de début doit être antérieure à la date de fin');
    }
    
    url += `/${fromDate}/${toDate}`;
  }

  try {
    const response = await axios.get(url, {
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      timeout: 15000
    });

    if (!response.data?.data) {
      throw new Error('Format de réponse invalide');
    }

    return response.data.data;
  } catch (error: any) {
    console.error('Erreur API:', {
      url,
      status: error.response?.status,
      message: error.message
    });

    if (error.response) {
      switch (error.response.status) {
        case 400: throw new Error('Requête invalide');
        case 401: throw new Error('Session expirée');
        case 403: throw new Error('Permissions insuffisantes');
        case 404: throw new Error('Données non trouvées');
        case 500: throw new Error('Erreur serveur');
        default: throw new Error(`Erreur HTTP: ${error.response.status}`);
      }
    }
    throw error;
  }
};
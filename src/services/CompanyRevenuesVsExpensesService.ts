import axios from 'axios';
import { Preferences } from '@capacitor/preferences';

const BASE_URL = 'https://preprod-api.iberis.io/fr/api/private/company';

export interface RevenuesVsExpensesData {
  currentExerciseYear: string;
  organisedMonths: string[];
  incomesConvertedSum: number[];
  outcomesConvertedSum: number[];
  extraData: {
    currencySymbol: string;
    outcomes: {
      strings: string;
      integer: string | number;
    };
    incomes: {
      strings: string;
      integer: string | number;
    };
  };
}

export const getCompanyRevenuesVsExpenses = async (
  fromDate?: string,
  toDate?: string
): Promise<RevenuesVsExpensesData> => {
  try {
    const token = (await Preferences.get({ key: 'auth_token' })).value;
    const companyId = (await Preferences.get({ key: 'current_company_id' })).value;

    if (!token || !companyId) {
      throw new Error('Session expirée. Veuillez vous reconnecter.');
    }

    let url = `${BASE_URL}/${companyId}/statistics/revenuesVsExpenses`;

    if (fromDate && toDate) {
      url += `/${fromDate}/${toDate}`;
    } else if (fromDate) {
      url += `/${fromDate}`;
    }

    const response = await axios.get(url, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (response.data.status.code !== 200) {
      throw new Error(response.data.status.message || 'Erreur inconnue');
    }

    return response.data.data;
  } catch (error: any) {
    if (error.response?.status === 403) {
      throw new Error("Vous n'avez pas les permissions nécessaires");
    }

    if (error.response?.status === 404) {
      throw new Error("Entreprise non trouvée");
    }

    throw new Error(
      error.response?.data?.status?.message || error.message || "Erreur de chargement des données"
    );
  }
};

import axios from 'axios';
import { Preferences } from '@capacitor/preferences';

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

export const getPurchaseCategories = async (
  fromDate?: string,
  toDate?: string
): Promise<PurchaseCategoriesData> => {
  const token = (await Preferences.get({ key: 'auth_token' })).value;
  const companyId = (await Preferences.get({ key: 'current_company_id' })).value;

  if (!token || !companyId) {
    throw new Error('Session expirée. Veuillez vous reconnecter.');
  }

  // Construire l'URL avec les paramètres de date optionnels
  let url = `${BASE_URL}/${companyId}/statistics/purchasesCategories`;

  if (fromDate && toDate) {
    url += `/${fromDate}/${toDate}`;
  } else if (fromDate) {
    url += `/${fromDate}`;
  }

  console.log('URL de requête:', url); // Pour debug

  const response = await axios.get(url, {
    headers: { Authorization: `Bearer ${token}` }
  });

  return response.data.data;
};

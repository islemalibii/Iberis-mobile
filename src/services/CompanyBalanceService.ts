import axios from 'axios';
import { Preferences } from '@capacitor/preferences';

const BASE_URL = 'https://preprod-api.iberis.io/fr/api/private/company';

export interface CompanyBalanceData {
  integer: string;
  strings: string;
  extraData: {
    currencySymbol: string;
  };
}

export const getCompanyBalance = async (toDate?: string): Promise<CompanyBalanceData> => {
  try {
    const token = (await Preferences.get({ key: 'auth_token' })).value;
    const companyId = (await Preferences.get({ key: 'current_company_id' })).value;

    if (!token || !companyId) {
      throw new Error('Session expirée. Veuillez vous reconnecter.');
    }

    let url = `${BASE_URL}/${companyId}/statistics/balance`;
    if (toDate) {
      url += `/${toDate}`;
    }

    const response = await axios.get(url, {
      headers: { Authorization: `Bearer ${token}` }
    });

    return response.data.data;
  } catch (error: any) {
    if (error.response?.status === 403) {
      throw new Error("Vous n'avez pas les permissions nécessaires pour accéder à ce tableau de bord");
    }

    if (error.response?.status === 404) {
      throw new Error("Entreprise non trouvée");
    }

    throw new Error(error.response?.data?.status?.message || error.message || "Erreur inconnue");
  }
};

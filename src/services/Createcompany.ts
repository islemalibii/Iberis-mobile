import axios, { AxiosResponse } from 'axios';
import type { Activity, Country, Currency, AccountingPeriod, CompanyFormData } from '@/models/CreatCompanyModel';
import { Preferences } from '@capacitor/preferences';


const API_BASE_URL = 'https://preprod-api.iberis.io/fr/api/private';

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});
export interface ActivitiesResponse {
    data: {
      activities: Activity[];
    };
    status?: {
      code?: number;
      message?: string;
    };
}
export interface CountriesResponse {
    data: {
        countries: Country[];
    };
    status?: {
      code?: number;
      message?: string;
    };
}
export interface CurrenciesResponse {
    data: {
        currencies: Currency[];
    };
    status?: {
      code?: number;
      message?: string;
    };
}
export interface AccountingsResponse {
    data: {
        accountingPeriods: AccountingPeriod[];
    };
    status?: {
      code?: number;
      message?: string;
    };
}
export interface CompanyResponse  {
    data: any;
    status?: {
      code?: number;
      message?: string;
    };
}
const getAuthToken = async (): Promise<string> => {
    const { value: token } = await Preferences.get({ key: 'auth_token' });
    if (!token) throw new Error('No authentication token found');
    return token;
};

export const fetchActivities = async (): Promise<AxiosResponse<ActivitiesResponse>> => {
    const token = await getAuthToken();
    return api.get('/general/activities', {
        headers: {
            Authorization: `Bearer ${token}` 
          }
    });
};
export const fetchCountries = async (): Promise<AxiosResponse<CountriesResponse>> => {
    const token = await getAuthToken();
    return api.get('/general/countries', {
        headers: {
            Authorization: `Bearer ${token}` 
          }
    });
};
export const fetchCurrencies = async (): Promise<AxiosResponse<CurrenciesResponse>> => {
    const token = await getAuthToken();
    return api.get('/general/currencies', {
        headers: {
            Authorization: `Bearer ${token}` 
          }
    });
};
export const fetchAccountingPeriods = async (): Promise<AxiosResponse<AccountingsResponse>> => {
    const token = await getAuthToken();
    return api.get('/general/accounting', {
        headers: {
            Authorization: `Bearer ${token}` 
          }
    });
};
export const createCompany = async (formData: CompanyFormData): Promise<AxiosResponse<CompanyResponse>> => {
    const token = await getAuthToken();
    if (formData.logo instanceof File) {
      const formPayload = new FormData();
      
      Object.entries(formData).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
              formPayload.append(key, value instanceof File ? value : String(value));
          }
      });
      return api.post('/company/new', formPayload, {
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
        }
      });
    }
    return api.post('/company/new', formData, {
        headers: {
            Authorization: `Bearer ${token}` 
          }
    });
};
import axios from 'axios';
import { Preferences } from '@capacitor/preferences';

const API_URL = 'https://preprod-api.iberis.io/en/api/private';

export const fetchTokenAndCompanyid = async () => {
  const Savedtoken = await Preferences.get({ key: 'auth_token' });
  const SavedCompanyId = await Preferences.get({ key: 'current_company_id' });

  const token = Savedtoken.value;
  const companyId = SavedCompanyId.value;

  if (!token || !companyId) {
    throw new Error('Missing token or company ID');
  }

  return { token, companyId };
};

export const fetchCategories = async () => {
  const { token, companyId } = await fetchTokenAndCompanyid();

  const response = await axios.get(
    `${API_URL}/company/${companyId}/sales/invoice/categories/list`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  console.log(response.data.data);
  return response.data.data;
};

export const fetchCategoriesList = async () => {
  const { token, companyId } = await fetchTokenAndCompanyid();

  const response = await axios.get(
    `${API_URL}/company/${companyId}/purchases/expense/categories/list`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  console.log(response.data.data);
  return response.data.data;
};

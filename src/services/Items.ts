import axios from 'axios';
import { Preferences } from '@capacitor/preferences';
import { NewItem } from '@/models/ItemModel';


const API_URL = 'https://preprod-api.iberis.io/en/api/private';
export const fetchTokenAndCompanyid = async () =>{
    const Savedtoken = await Preferences.get({ key: 'auth_token' });
    const SavedCompanyId = await Preferences.get({ key: 'current_company_id' });
    const token = Savedtoken.value;
    const companyId = SavedCompanyId.value;
    if (!token || !companyId) {
      throw new Error('Missing token or company ID');
    }
    return { token, companyId };
};
export const fetchItems = async () => {
    const { token, companyId } = await fetchTokenAndCompanyid();  
    const response = await axios.get(`${API_URL}/company/${companyId}/items`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    console.log(response.data.data);
    return response.data.data; 
};
export const getPriceList = async () => {
  const { token, companyId } = await fetchTokenAndCompanyid();  
  const response = await axios.get(`${API_URL}/company/${companyId}/items/prices/list`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  console.log(response.data.data);
  return response.data.data; 
};
export const getUnitiesList = async () => {
  const { token, companyId } = await fetchTokenAndCompanyid();  
  const response = await axios.get(`${API_URL}/company/${companyId}/items/unities/list`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  console.log(response.data.data);
  return response.data.data; 
};
export const getCategoriesList = async () => {
  const { token, companyId } = await fetchTokenAndCompanyid();  
  const response = await axios.get(`${API_URL}/company/${companyId}/items/categories/list`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  console.log(response.data.data);
  return response.data.data; 
};
export const getBrandsList = async () => {
  const { token, companyId } = await fetchTokenAndCompanyid();  

    const response = await axios.get(`${API_URL}/company/${companyId}/items/brands/list`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    console.log(response.data.data);
    return response.data.data; 
};

export const AddItem = async (payload: NewItem) => {
  const { token, companyId } = await fetchTokenAndCompanyid();  
  const price = payload.prices?.[0];
  if (!price) throw new Error('Price data is missing');

  const formData = new FormData();
  formData.append('title', payload.title);
  formData.append('reference', payload.reference);
  formData.append('description', payload.description);
  formData.append('taxe', payload.taxe);
  formData.append('type', payload.type.toString());
  formData.append('destination', payload.destination.toString());
  formData.append('unity_id', payload.unity_id);
  formData.append('category', payload.category);
  formData.append('brand', payload.brand);
  formData.append(
    'prices[]',
    JSON.stringify({
      item_price_list_hashed_id: price.item_price_list_hashed_id,
      selling_rate: parseFloat(price.default_selling_rate),
      buying_rate: parseFloat(price.default_buying_rate),
    })
  );

  console.log('Sending payload:', JSON.stringify(formData, null, 2));
  try {
    const response = await axios.post(
      `${API_URL}/company/${companyId}/item/new`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data.data.item;
  } catch (error) {
    console.error('Error creating item:', error);
    throw error;
  }
};
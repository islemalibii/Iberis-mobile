import axios from 'axios';

export const fetchLiveCurrencyRate = async (fromCurrency: string, toCurrency: string) => {
    try {
      const response = await axios.get(`https://api.exchangerate-api.com/v4/latest/${fromCurrency}`);
      return response.data.rates[toCurrency];
    } catch (error) {
      console.error('Failed to fetch currency rate:', error);
      return 3.315;
    }
  };
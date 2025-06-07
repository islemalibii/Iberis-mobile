import axios from 'axios';
import { Preferences } from '@capacitor/preferences';
import { TimelineResponse } from '@/models/TimelineModel';

const API_BASE = 'https://preprod-api.iberis.io';

export const TimelineService = {
  async getClientTimeline(clientId: string): Promise<TimelineResponse> {
    const [token, companyId] = await Promise.all([
      Preferences.get({ key: 'auth_token' }),
      Preferences.get({ key: 'current_company_id' })
    ]);

    if (!token.value || !companyId.value) {
      throw new Error('Authentification requise');
    }

    try {
      const response = await axios.get<TimelineResponse>(
        `${API_BASE}/fr/api/private/company/${companyId.value}/client/${clientId}/timeline`,
        {
          headers: {
            Authorization: `Bearer ${token.value}`,
          }
        }
      );

      return response.data;
    } catch (error: any) {
      console.error('Timeline Error:', error.response?.data || error.message);
      throw new Error(error.response?.data?.status?.message || 'Erreur de chargement');
    }
  }
};

import axios from 'axios';
import { Preferences } from '@capacitor/preferences';



const API_URL = 'https://preprod-api.iberis.io/en/api/private';
export const fetchTokenAndCompanyid = async () => {
  const Savedtoken = await Preferences.get({ key: 'auth_token' });
  const SavedCompanyId = await Preferences.get({ key: 'current_company_id' });
  const SavedParentId = await Preferences.get({ key: 'sales_parent_journal' });
  const SavedDefaultSalesJournalId = await Preferences.get({ key: 'default_sales_parent_journal' });
  
  console.log('Stored journal ID:', SavedParentId); 
  console.log('Stored default sales journal ID:', SavedDefaultSalesJournalId);

  const token = Savedtoken.value;
  const companyId = SavedCompanyId.value;
  const parentId = SavedParentId.value;
  const defaultSalesJournalId = SavedDefaultSalesJournalId.value;
  
  if (!token || !companyId || !parentId) {
    throw new Error('Missing token or company ID or parent ID');
  }
  return { token, companyId, parentId, defaultSalesJournalId };
};
export const fetchJournals = async () => {
    const { token, companyId , parentId } = await fetchTokenAndCompanyid();  
    const response = await axios.get(`${API_URL}/company/${companyId}/journals/${parentId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    console.log(response.data.data);
    return response.data.data; 
};

export const fetchDefaultSalesJournal = async () => {
  try {
    const { token, companyId, parentId, defaultSalesJournalId } = await fetchTokenAndCompanyid();
    if (!defaultSalesJournalId) {
      console.log('No default sales journal ID found');
      return null;
    }
    const response = await axios.get(`${API_URL}/company/${companyId}/journals/${parentId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    let journals = [];
    console.log('Journal response type:', typeof response.data.data);
    if (response.data && response.data.data) {
      if (Array.isArray(response.data.data)) {
        journals = response.data.data;
      } else if (response.data.data.journals && Array.isArray(response.data.data.journals)) {
        journals = response.data.data.journals;
      } else if (typeof response.data.data === 'object') {
        journals = [response.data.data];
      } else {
        console.log('Unexpected journal data format:', response.data.data);
        return null;
      }
    }
    if (!journals || journals.length === 0) {
      console.log('No journals found in response');
      return null;
    }
    const findJournal = (journalList, targetId) => {
      if (!Array.isArray(journalList)) {
        return null;
      }
      for (const journal of journalList) {
        if (journal && journal.id && journal.id.toString() === targetId) {
          return journal;
        }
        if (journal && journal.children && Array.isArray(journal.children) && journal.children.length > 0) {
          const found = findJournal(journal.children, targetId);
          if (found) return found;
        }
      }
      return null;
    };
    const defaultJournal = findJournal(journals, defaultSalesJournalId);
    if (defaultJournal) {
      console.log('Found default journal:', defaultJournal.title || defaultJournal.id);
    } else {
      console.log('Default journal not found in results');
    }
    return defaultJournal;
  } catch (error) {
    console.error('Error fetching default journal:', error);
    return null;
  }
};
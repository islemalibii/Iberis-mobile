// src/services/clients.ts
import axios from 'axios';
import { Client } from '@/models/ClientModel';

const API_BASE_URL = 'https://preprod-api.iberis.io';
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});
export default {
  async getClientsList(lang: string, companyId: number, token: string) {
    try {
      const response = await apiClient.get(`/${lang}/api/private/company/${companyId}/clients/list`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data.data.map((client: any) => new Client(
        client.id,
        client.displayName || client.fullname,
        client.email,
        client.phone,
        client.reference,
        client.status
      ));
    } catch (error) {
      console.error('Error fetching clients list:', error);
      throw error;
    }
  },

  async checkClientReference(lang: string, companyId: number, reference: string, token: string) {
    try {
      const response = await apiClient.get(
        `/${lang}/api/public/company/${companyId}/client/check/reference/${reference}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data;
    } catch (error) {
      console.error('Error checking client reference:', error);
      throw error;
    }
  },

  async getClientSynthesis(lang: string, companyId: number, clientId: number, token: string) {
    try {
      const response = await apiClient.get(
        `/${lang}/api/public/company/${companyId}/client/${clientId}/synthesis`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data;
    } catch (error) {
      console.error('Error getting client synthesis:', error);
      throw error;
    }
  },

  async createClient(lang: string, companyId: number, clientData: any, token: string) {
    try {
      const response = await apiClient.post(
        `/${lang}/api/public/company/${companyId}/client/new`,
        clientData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data;
    } catch (error) {
      console.error('Error creating client:', error);
      throw error;
    }
  },

  async updateClient(lang: string, companyId: number, clientId: number, clientData: any, token: string) {
    try {
      const response = await apiClient.post(
        `/${lang}/api/public/company/${companyId}/client/${clientId}/edit`,
        clientData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data;
    } catch (error) {
      console.error('Error updating client:', error);
      throw error;
    }
  },

  async deleteClient(lang: string, companyId: number, clientId: number, token: string) {
    try {
      const response = await apiClient.get(
        `/${lang}/api/public/company/${companyId}/client/${clientId}/delete`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data;
    } catch (error) {
      console.error('Error deleting client:', error);
      throw error;
    }
  },

  async getClientAdditionals(lang: string, companyId: number, clientId: number, token: string) {
    try {
      const response = await apiClient.get(
        `/${lang}/api/public/company/${companyId}/client/${clientId}/additionals`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data;
    } catch (error) {
      console.error('Error getting client additionals:', error);
      throw error;
    }
  }
};
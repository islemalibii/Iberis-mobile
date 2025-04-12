// src/controllers/ClientController.ts
import { ref, computed } from 'vue';
import apiClient from '@/services/Clients';
import { Client } from '@/models/ClientModel';

export function useClientController() {
  const clients = ref<Client[]>([]);
  const searchQuery = ref('');
  const isLoading = ref(false);
  const error = ref<string | null>(null);
  const currentPage = ref(1);
  const itemsPerPage = ref(5);

  const filteredClients = computed(() => {
    return clients.value.filter(client =>
      client.displayName.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      client.email.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      client.phone.toLowerCase().includes(searchQuery.value.toLowerCase())
    );
  });

  const paginatedClients = computed(() => {
    const start = (currentPage.value - 1) * itemsPerPage.value;
    const end = start + itemsPerPage.value;
    return filteredClients.value.slice(start, end);
  });

  const totalPages = computed(() => {
    return Math.ceil(filteredClients.value.length / itemsPerPage.value);
  });

  const loadClients = async (lang: string, companyId: number, token: string) => {
    isLoading.value = true;
    error.value = null;
    try {
      clients.value = await apiClient.getClientsList(lang, companyId, token);
    } catch (err) {
      error.value = 'Failed to load clients';
      console.error(err);
    } finally {
      isLoading.value = false;
    }
  };

  const deleteClient = async (lang: string, companyId: number, clientId: number, token: string) => {
    isLoading.value = true;
    try {
      await apiClient.deleteClient(lang, companyId, clientId, token);
      clients.value = clients.value.filter(c => c.id !== clientId);
    } catch (err) {
      error.value = 'Failed to delete client';
      console.error(err);
    } finally {
      isLoading.value = false;
    }
  };

  const nextPage = () => {
    if (currentPage.value < totalPages.value) currentPage.value++;
  };

  const prevPage = () => {
    if (currentPage.value > 1) currentPage.value--;
  };

  return {
    clients,
    searchQuery,
    isLoading,
    error,
    currentPage,
    itemsPerPage,
    filteredClients,
    paginatedClients,
    totalPages,
    loadClients,
    deleteClient,
    nextPage,
    prevPage
  };
}
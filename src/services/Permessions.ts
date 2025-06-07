import axios from 'axios';
import { Preferences } from '@capacitor/preferences';
import {
  CompanyRole,
  roleFromJson,
  UserWithRole,
  mapUsersWithRoles,
  CreateRoleData,
  FormattedPermission,
  extractAllPermissions
} from './../models/PermessionModel';

const BASE_URL = 'https://preprod-api.iberis.io/fr';

export const fetchTokenAndCompanyId = async () => {
  const { value: token } = await Preferences.get({ key: 'auth_token' });
  const { value: companyId } = await Preferences.get({ key: 'current_company_id' });

  if (!token || !companyId) {
    throw new Error('Session expired. Please log in again.');
  }

  return { token, companyId };
};

export async function fetchCompanyRoles(companyId: string): Promise<CompanyRole[]> {
  const { token } = await fetchTokenAndCompanyId();
  const response = await axios.get(`${BASE_URL}/api/private/company/${companyId}/roles`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data.data.roles.map(roleFromJson);
}

export async function deleteCompanyUser(userId: string): Promise<void> {
  const { token, companyId } = await fetchTokenAndCompanyId();
  await axios.post(`${BASE_URL}/api/private/company/${companyId}/users/${userId}`, null, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export async function getUsersWithRoles(companyId: string): Promise<UserWithRole[]> {
  const roles = await fetchCompanyRoles(companyId);
  return mapUsersWithRoles(roles);
}

export async function fetchCompanyRoleDetails(companyId: string, roleId: string): Promise<CompanyRole> {
  const { token } = await fetchTokenAndCompanyId();
  
  try {
    const response = await axios.get(`${BASE_URL}/api/private/company/${companyId}/role/${roleId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    // Log pour débugger la structure de la réponse
    console.log('Réponse API complète:', response.data);
    
    // Vérifier la structure de la réponse
    if (!response.data) {
      throw new Error('Réponse API vide');
    }

    // Essayer différentes structures possibles
    let roleData = null;
    if (response.data.data && response.data.data.role) {
      roleData = response.data.data.role;
    } else if (response.data.role) {
      roleData = response.data.role;
    } else if (response.data.data) {
      roleData = response.data.data;
    } else {
      roleData = response.data;
    }

    if (!roleData) {
      throw new Error('Structure de réponse API inattendue');
    }

    console.log('Données du rôle extraites:', roleData);
    return roleFromJson(roleData);
    
  } catch (error) {
    console.error('Erreur lors de la récupération des détails du rôle:', error);
    throw error;
  }
}
export async function createCompanyRole(
  companyId: string,
  roleData: CreateRoleData
): Promise<CompanyRole> {
  const { token } = await fetchTokenAndCompanyId();

  const formData = new FormData();
  formData.append('token', token);
  formData.append('title', roleData.title);
  formData.append('description', roleData.description || '');

  // Liste complète de toutes les permissions disponibles
  const allPermissions = [
    // Accessibility permissions
    'canAccessDashboard', 'canAccessLogs', 'canAccessFile', 'canAccessReports', 'canAccessCalendar',
    // Company permissions
    'canUpdateCompanySettings', 'canReadCompanySettings', 'canReadCompanyTaxes', 'canCreateCompanyTaxes',
    'canUpdateCompanyTaxes', 'canDeleteCompanyTaxes', 'canReadCustomization', 'canUpdateCustomization',
    'canDeleteCustomization', 'canCreateCustomization', 'canReadCompanyBanks', 'canCreateCompanyBanks',
    'canUpdateCompanyBanks', 'canDeleteCompanyBanks', 'canReadAdditionalInputs', 'canCreateAdditionalInputs',
    'canUpdateAdditionalInputs', 'canDeleteAdditionalInputs', 'canReadCompanyUsers', 'canCreateCompanyUsers',
    'canUpdateCompanyUsers', 'canDeleteCompanyUsers', 'canCreateCompanyRoles', 'canReadCompanyRoles',
    'canUpdateCompanyRoles', 'canDeleteCompanyRoles', 'canReadIntegrations', 'canCreateIntegrations',
    'canUpdateIntegrations', 'canDeleteIntegrations', 'canReadWorkflows', 'canCreateWorkflows',
    'canUpdateWorkflows', 'canDeleteWorkflows', 'canReadWebhooks', 'canCreateWebhooks',
    'canUpdateWebhooks', 'canDeleteWebhooks', 'canManageEmployees',
    // Stock permissions
    'canReadArticles', 'canCreateArticles', 'canUpdateArticles', 'canDeleteArticles',
    'canReadArticleBrands', 'canCreateArticleBrands', 'canUpdateArticleBrands', 'canDeleteArticleBrands',
    'canReadArticleUnities', 'canCreateArticleUnities', 'canUpdateArticleUnities', 'canDeleteArticleUnities',
    'canReadArticleCategories', 'canCreateArticleCategories', 'canUpdateArticleCategories', 'canDeleteArticleCategories',
    'canReadArticlePrices', 'canCreateArticlePrices', 'canUpdateArticlePrices', 'canDeleteArticlePrices',
    'canReadArticleSerials', 'canCreateArticleSerials', 'canUpdateArticleSerials', 'canDeleteArticleSerials',
    'canReadMoves', 'canCreateMoves', 'canUpdateMoves', 'canDeleteMoves',
    'canReadInventories', 'canCreateInventories', 'canUpdateInventories', 'canDeleteInventories',
    'canReadWarehouses', 'canCreateWarehouses', 'canUpdateWarehouses', 'canDeleteWarehouses',
    // Sales permissions
    'canReadInvoices', 'canCreateInvoices', 'canUpdateInvoices', 'canDeleteInvoices',
    'canReadDeliveries', 'canCreateDeliveries', 'canUpdateDeliveries', 'canDeleteDeliveries',
    'canReadExitVouchers', 'canCreateExitVouchers', 'canUpdateExitVouchers', 'canDeleteExitVouchers',
    'canReadEstimates', 'canCreateEstimates', 'canUpdateEstimates', 'canDeleteEstimates',
    'canReadCreditNotes', 'canCreateCreditNotes', 'canUpdateCreditNotes', 'canDeleteCreditNotes',
    'canReadDisbursements', 'canCreateDisbursements', 'canUpdateDisbursements', 'canDeleteDisbursements',
    'canReadSPayments', 'canCreateSPayments', 'canUpdateSPayments', 'canDeleteSPayments',
    'canReadReminders', 'canCreateReminders', 'canUpdateReminders', 'canDeleteReminders',
    'canReadPointOfSales', 'canCreatePointOfSales', 'canUpdatePointOfSales', 'canDeletePointOfSales',
    'canReadInvoiceCategories', 'canCreateInvoiceCategories', 'canUpdateInvoiceCategories', 'canDeleteInvoiceCategories',
    // Purchases permissions
    'canReadReceipts', 'canCreateReceipts', 'canUpdateReceipts', 'canDeleteReceipts',
    'canReadOrders', 'canCreateOrders', 'canUpdateOrders', 'canDeleteOrders',
    'canReadExpenses', 'canCreateExpenses', 'canUpdateExpenses', 'canDeleteExpenses',
    'canReadExpenseCategories', 'canCreateExpenseCategories', 'canUpdateExpenseCategories', 'canDeleteExpenseCategories',
    'canReadServices', 'canCreateServices', 'canUpdateServices', 'canDeleteServices',
    'canReadPPayments', 'canCreatePPayments', 'canUpdatePPayments', 'canDeletePPayments',
    'canReadWithholdings', 'canCreateWithholdings', 'canUpdateWithholdings', 'canDeleteWithholdings',
    // Contacts permissions
    'canReadProviders', 'canCreateProviders', 'canUpdateProviders', 'canDeleteProviders',
    'canReadClients', 'canCreateClients', 'canUpdateClients', 'canDeleteClients',
    'canReadContacts', 'canCreateContacts', 'canUpdateContacts', 'canDeleteContacts',
    // Accounting permissions
    'canReadJournalEntries', 'canCreateJournalEntries', 'canUpdateJournalEntries', 'canDeleteJournalEntries',
    'canReadJournals', 'canCreateJournals', 'canUpdateJournals', 'canDeleteJournals',
    // Projects permissions
    'canReadProjects', 'canCreateProjects', 'canUpdateProjects', 'canDeleteProjects',
    'canCreateTasks', 'canUpdateTasks', 'canDeleteTasks', 'canCreateProjectFinance'
  ];

  // Initialiser toutes les permissions à "0" par défaut
  allPermissions.forEach(perm => {
    formData.append(perm, "0");
  });

  // Mettre les permissions sélectionnées à "1"
  if (roleData.permissions && Array.isArray(roleData.permissions)) {
    roleData.permissions.forEach(permId => {
      if (allPermissions.includes(permId)) {
        // Utiliser set() pour remplacer la valeur existante
        formData.set(permId, "1");
      }
    });
  }

  const response = await axios.post(
    `${BASE_URL}/api/private/company/${companyId}/roles/add`,
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return roleFromJson(response.data.data.role);
}
export async function updateCompanyRole(
  companyId: string,
  roleId: string,
  roleData: CreateRoleData
): Promise<CompanyRole> {
  const { token } = await fetchTokenAndCompanyId();

  const formData = new FormData();
  formData.append('title', roleData.title);
  if (roleData.description) {
    formData.append('description', roleData.description);
  }

  // Ajouter les permissions
  if (roleData.permissions && Array.isArray(roleData.permissions)) {
    roleData.permissions.forEach(permId => {
      formData.append(permId, "1"); // Comme dans l'exemple du cahier des charges
    });
  }

  const response = await axios.post(
    `${BASE_URL}/api/private/company/${companyId}/role/${roleId}/edit`,
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return roleFromJson(response.data.data.role);
}

export async function fetchAvailablePermissions(companyId: string): Promise<FormattedPermission[]> {
  const roles = await fetchCompanyRoles(companyId);
  return extractAllPermissions(roles);
}

export async function deleteCompanyRole(companyId: string, roleId: string): Promise<void> {
  const { token } = await fetchTokenAndCompanyId();
  
  try {
    const response = await axios.get(`${BASE_URL}/api/private/company/${companyId}/role/${roleId}/delete`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    // Vérifier le statut de la réponse
    if (response.data.status.code !== 200) {
      throw new Error(response.data.status.message || 'Erreur lors de la suppression du rôle');
    }
    
  } catch (error) {
    // Gérer les erreurs spécifiques de l'API
    if (error.response) {
      const { status, data } = error.response;
      
      if (status === 503) {
        throw new Error(data.status?.message || 'Ce rôle ne peut pas être supprimé (rôle système ou avec des contraintes)');
      } else if (status === 404) {
        throw new Error('Rôle non trouvé');
      } else if (status === 403) {
        throw new Error('Vous n\'avez pas les permissions pour supprimer ce rôle');
      }
    }
    
    // Re-lancer l'erreur si ce n'est pas une erreur axios
    throw error;
  }
}
export interface InviteUserResponse {
  data: any[];
  status: {
    message: string;
    code: number;
  };
  errors?: {
    [key: string]: string[];
  };
}

export async function inviteUser(
  companyId: string,
  userData: {
    name: string;
    email: string;
    role: string;
  }
): Promise<InviteUserResponse> {
  const { token } = await fetchTokenAndCompanyId();

  try {
    const response = await axios.post(
      `${BASE_URL}/api/private/company/${companyId}/users/invite`,
      {
        name: userData.name,
        email: userData.email,
        role: userData.role,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      // Gestion des erreurs spécifiques
      if (error.response.status === 205) {
        // Validation Error
        return {
          data: [],
          status: {
            message: 'Validation Error',
            code: 205,
          },
          errors: error.response.data.errors,
        };
      } else if (error.response.status === 501) {
        // Limit Exceeded
        return {
          data: [],
          status: {
            message: 'Company has reached maximum collaborator limit',
            code: 501,
          },
        };
      }
    }

    // Pour les autres erreurs
    throw error;
  }
}
export async function revokeUserAccess(
  companyId: string,
  userId: string
): Promise<{ data: any[]; status: { message: string; code: number } }> {
  const { token } = await fetchTokenAndCompanyId();
  
  try {
    const response = await axios.get(
      `${BASE_URL}/api/private/company/${companyId}/users/revoke/${userId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 400) {
        throw new Error("Seul le propriétaire peut révoquer l'accès");
      }
      throw new Error(error.response?.data?.status?.message || "Erreur lors de la révocation de l'accès");
    }
    throw error;
  }
}
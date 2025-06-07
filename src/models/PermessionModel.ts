export interface Permission {
    [key: string]: boolean;
  }
  
  export interface CompanyUser {
    name: string;
    email: string;
    phone: string | null;
    hashed_id: string;
    last_activity: string | null;
    status: number;
    photo: string | null;
  }
  
  // New interface for company users list response
  export interface CompanyUserListItem {
    userHashedId: string;
    name: string;
    email: string;
    role: string;
    date: string;
    isOwner: number;
    action: string;
  }
  
  // DataTables response structure
  export interface CompanyUsersResponse {
    draw: number;
    recordsTotal: number;
    recordsFiltered: number;
    data: CompanyUserListItem[];
  }
  
  // Invite user request data
  export interface InviteUserData {
    name: string;
    email: string;
    role: string; // Hashed ID of the role
  }
  
  export interface CompanyRole {
    title: string;
    description: string | null;
    hashed_id: string;
    users_count: number;
    users?: CompanyUser[];
    permissions?: string;
  }
  
  export interface UpdateRoleData {
    title: string;
    description?: string;
    permissions: string[];
  }
  
  export interface CreateRoleData {
    title: string;
    description?: string;
    permissions: string[]; // Array de strings pour les permissions
  }
  
  export interface UserWithRole {
    name: string;
    email: string;
    phone: string | null;
    status: number;
    role: string;
    role_id: string;
    last_activity: string | null;
    hashed_id: string;
  }
  
  export interface FormattedPermission {
    id: string;
    name: string;
    category?: string;
  }
  
  // Convert a serialized PHP array string into a JS array
  function phpUnserialize(serialized: string): any {
    if (!serialized) return null;
  
    if (serialized.startsWith('a:')) {
      const arrayMatch = serialized.match(/^a:(\d+):\{/);
      if (!arrayMatch) return null;
  
      const result: any[] = [];
      let remaining = serialized.slice(arrayMatch[0].length);
      const itemCount = parseInt(arrayMatch[1], 10);
  
      for (let i = 0; i < itemCount; i++) {
        remaining = remaining.replace(/^i:\d+;/, '');
        const stringMatch = remaining.match(/^s:(\d+):"([^"]+)";/);
        if (stringMatch) {
          result.push(stringMatch[2]);
          remaining = remaining.slice(stringMatch[0].length);
        }
      }
  
      return result;
    }
  
    return null;
  }
  
  export const parsePermissions = (permissions: string): Permission => {
    try {
      if (!permissions) return {};
  
      const result = phpUnserialize(permissions);
      const parsed: Permission = {};
  
      if (Array.isArray(result)) {
        result.forEach((perm) => {
          if (typeof perm === 'string') {
            parsed[perm] = true;
          }
        });
      }
  
      return parsed;
    } catch (e) {
      console.error('Error parsing permissions:', e);
      return {};
    }
  };
  
  export const roleFromJson = (json: any): CompanyRole => ({
    title: json.title,
    description: json.description,
    hashed_id: json.hashed_id,
    users_count: json.users_count,
    permissions: json.permissions,
    users: json.users?.map((user: any) => ({
      name: user.name,
      email: user.email,
      phone: user.phone,
      hashed_id: user.hashed_id,
      last_activity: user.last_activity,
      status: user.status,
      photo: user.photo
    })) || []
  });
  
  export const mapUsersWithRoles = (roles: CompanyRole[]): UserWithRole[] => {
    const users: UserWithRole[] = [];
  
    roles.forEach(role => {
      const cleanRoleTitle = role.title.replace('Common::company.', '');
  
      if (role.users && role.users.length > 0) {
        role.users.forEach(user => {
          users.push({
            name: user.name,
            email: user.email,
            phone: user.phone,
            status: user.status,
            role: cleanRoleTitle,
            role_id: role.hashed_id,
            last_activity: user.last_activity,
            hashed_id: user.hashed_id
          });
        });
      }
    });
  
    return users;
  };
  
  export const transformPermissionToReadable = (permission: string): string => {
    return permission
      .replace(/^can/, '')
      .replace(/([A-Z])/g, ' $1')
      .trim()
      .replace(/\b\w/g, c => c.toUpperCase());
  };
  
  export const extractAllPermissions = (roles: CompanyRole[]): FormattedPermission[] => {
    const allPermissions = new Set<string>();
  
    roles.forEach(role => {
      if (role.permissions) {
        try {
          const perms = parsePermissions(role.permissions);
          Object.keys(perms).forEach(perm => allPermissions.add(perm));
        } catch (e) {
          console.error('Error parsing permissions:', e);
        }
      }
    });
  
    const permissionCategories: Record<string, string[]> = {
      'Accessibility': [
        'canAccessDashboard',
        'canAccessLogs',
        'canAccessFile',
        'canAccessReports',
        'canAccessCalendar'
      ],
      'Company': [
        'canUpdateCompanySettings',
        'canReadCompanySettings',
        'canReadCompanyTaxes',
        'canCreateCompanyTaxes',
        'canUpdateCompanyTaxes',
        'canDeleteCompanyTaxes',
        'canReadCustomization',
        'canUpdateCustomization',
        'canDeleteCustomization',
        'canCreateCustomization',
        'canReadCompanyBanks',
        'canCreateCompanyBanks',
        'canUpdateCompanyBanks',
        'canDeleteCompanyBanks',
        'canReadAdditionalInputs',
        'canCreateAdditionalInputs',
        'canUpdateAdditionalInputs',
        'canDeleteAdditionalInputs',
        'canReadCompanyUsers',
        'canCreateCompanyUsers',
        'canUpdateCompanyUsers',
        'canDeleteCompanyUsers',
        'canCreateCompanyRoles',
        'canReadCompanyRoles',
        'canUpdateCompanyRoles',
        'canDeleteCompanyRoles',
        'canReadIntegrations',
        'canCreateIntegrations',
        'canUpdateIntegrations',
        'canDeleteIntegrations',
        'canReadWorkflows',
        'canCreateWorkflows',
        'canUpdateWorkflows',
        'canDeleteWorkflows',
        'canReadWebhooks',
        'canCreateWebhooks',
        'canUpdateWebhooks',
        'canDeleteWebhooks',
        'canManageEmployees'
      ],
      'Stock': [
        'canReadArticles',
        'canCreateArticles',
        'canUpdateArticles',
        'canDeleteArticles',
        'canReadArticleBrands',
        'canCreateArticleBrands',
        'canUpdateArticleBrands',
        'canDeleteArticleBrands',
        'canReadArticleUnities',
        'canCreateArticleUnities',
        'canUpdateArticleUnities',
        'canDeleteArticleUnities',
        'canReadArticleCategories',
        'canCreateArticleCategories',
        'canUpdateArticleCategories',
        'canDeleteArticleCategories',
        'canReadArticlePrices',
        'canCreateArticlePrices',
        'canUpdateArticlePrices',
        'canDeleteArticlePrices',
        'canReadArticleSerials',
        'canCreateArticleSerials',
        'canUpdateArticleSerials',
        'canDeleteArticleSerials',
        'canReadMoves',
        'canCreateMoves',
        'canUpdateMoves',
        'canDeleteMoves',
        'canReadInventories',
        'canCreateInventories',
        'canUpdateInventories',
        'canDeleteInventories',
        'canReadWarehouses',
        'canCreateWarehouses',
        'canUpdateWarehouses',
        'canDeleteWarehouses'
      ],
      'Sales': [
        'canReadInvoices',
        'canCreateInvoices',
        'canUpdateInvoices',
        'canDeleteInvoices',
        'canReadDeliveries',
        'canCreateDeliveries',
        'canUpdateDeliveries',
        'canDeleteDeliveries',
        'canReadExitVouchers',
        'canCreateExitVouchers',
        'canUpdateExitVouchers',
        'canDeleteExitVouchers',
        'canReadEstimates',
        'canCreateEstimates',
        'canUpdateEstimates',
        'canDeleteEstimates',
        'canReadCreditNotes',
        'canCreateCreditNotes',
        'canUpdateCreditNotes',
        'canDeleteCreditNotes',
        'canReadDisbursements',
        'canCreateDisbursements',
        'canUpdateDisbursements',
        'canDeleteDisbursements',
        'canReadSPayments',
        'canCreateSPayments',
        'canUpdateSPayments',
        'canDeleteSPayments',
        'canReadReminders',
        'canCreateReminders',
        'canUpdateReminders',
        'canDeleteReminders',
        'canReadPointOfSales',
        'canCreatePointOfSales',
        'canUpdatePointOfSales',
        'canDeletePointOfSales',
        'canReadInvoiceCategories',
        'canCreateInvoiceCategories',
        'canUpdateInvoiceCategories',
        'canDeleteInvoiceCategories'
      ],
      'Purchases': [
        'canReadReceipts',
        'canCreateReceipts',
        'canUpdateReceipts',
        'canDeleteReceipts',
        'canReadOrders',
        'canCreateOrders',
        'canUpdateOrders',
        'canDeleteOrders',
        'canReadExpenses',
        'canCreateExpenses',
        'canUpdateExpenses',
        'canDeleteExpenses',
        'canReadExpenseCategories',
        'canCreateExpenseCategories',
        'canUpdateExpenseCategories',
        'canDeleteExpenseCategories',
        'canReadServices',
        'canCreateServices',
        'canUpdateServices',
        'canDeleteServices',
        'canReadPPayments',
        'canCreatePPayments',
        'canUpdatePPayments',
        'canDeletePPayments',
        'canReadWithholdings',
        'canCreateWithholdings',
        'canUpdateWithholdings',
        'canDeleteWithholdings'
      ],
      'Contacts': [
        'canReadProviders',
        'canCreateProviders',
        'canUpdateProviders',
        'canDeleteProviders',
        'canReadClients',
        'canCreateClients',
        'canUpdateClients',
        'canDeleteClients',
        'canReadContacts',
        'canCreateContacts',
        'canUpdateContacts',
        'canDeleteContacts'
      ],
      'Accounting': [
        'canReadJournalEntries',
        'canCreateJournalEntries',
        'canUpdateJournalEntries',
        'canDeleteJournalEntries',
        'canReadJournals',
        'canCreateJournals',
        'canUpdateJournals',
        'canDeleteJournals'
      ],
      'Projects': [
        'canReadProjects',
        'canCreateProjects',
        'canUpdateProjects',
        'canDeleteProjects',
        'canCreateTasks',
        'canUpdateTasks',
        'canDeleteTasks',
        'canCreateProjectFinance'
      ]
    };
  
    const result: FormattedPermission[] = [];
  
    for (const [category, perms] of Object.entries(permissionCategories)) {
      perms.forEach(perm => {
        if (allPermissions.has(perm)) {
          result.push({
            id: perm,
            name: transformPermissionToReadable(perm),
            category: category
          });
        }
      });
    }
  
    Array.from(allPermissions).forEach(perm => {
      if (!result.some(p => p.id === perm)) {
        result.push({
          id: perm,
          name: transformPermissionToReadable(perm),
          category: 'Other'
        });
      }
    });
  
    return result;
  };
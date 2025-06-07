import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { toastController } from '@ionic/vue';
import {
  CompanyRole,
  UserWithRole,
  FormattedPermission,
  
  InviteUserData,
    UpdateRoleData, // Ajoutez ceci

} from '@/models/PermessionModel';
import {
  fetchCompanyRoles,
  fetchCompanyRoleDetails,
  getUsersWithRoles,
  createCompanyRole,
  fetchTokenAndCompanyId,
  fetchAvailablePermissions
  ,deleteCompanyRole,
  updateCompanyRole,
  revokeUserAccess,
    inviteUser as inviteUserToCompany // Alias pour éviter le conflit de noms

} from '@/services/Permessions';

export function useRoleController() {
  const router = useRouter();

  // Data
  const roles = ref<CompanyRole[]>([]);
  const currentRole = ref<CompanyRole | null>(null);
  const usersWithRoles = ref<UserWithRole[]>([]);
  const availablePermissions = ref<FormattedPermission[]>([]);
const isEditing = ref(false);
const editError = ref<string | null>(null);
  // UI State
  const isLoading = ref(false);
  const isLoadingDetails = ref(false);
  const isPermissionsLoading = ref(false);
  const error = ref<string | null>(null);
  const searchQuery = ref('');
  const showRoleForm = ref(false);
  const isInvitingUser = ref(false);
  const inviteError = ref<string | null>(null);
  const inviteSuccess = ref<boolean>(false);
  // Computed
  const filteredRoles = computed(() => {
    const query = searchQuery.value.toLowerCase();
    return roles.value.filter(role =>
      role.title.toLowerCase().includes(query) ||
      (role.description?.toLowerCase().includes(query))
    ).map(role => ({
      ...role,
      users: role.users?.filter(user =>
        user.name.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query)
      )
    }));
  });

  const filteredUsers = computed(() => {
    const query = searchQuery.value.toLowerCase();
    return usersWithRoles.value.filter(user =>
      user.name.toLowerCase().includes(query) ||
      user.email.toLowerCase().includes(query) ||
      user.role.toLowerCase().includes(query)
    );
  });

  // Helpers
  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString('fr-FR', options);
  };const inviteUser = async (userData: InviteUserData) => {
  try {
    isInvitingUser.value = true;
    inviteError.value = null;
    inviteSuccess.value = false;

    // Validation basique
    if (!userData.name.trim() || userData.name.length < 3) {
      throw new Error('Le nom doit contenir au moins 3 caractères');
    }

    if (!userData.email.includes('@')) {
      throw new Error('Veuillez entrer une adresse email valide');
    }

    if (!userData.role) {
      throw new Error('Veuillez sélectionner un rôle');
    }

    const { companyId } = await fetchTokenAndCompanyId();
    const response = await inviteUserToCompany(companyId, userData);

    if (response.status.code === 200) {
      inviteSuccess.value = true;
      await showToast('Invitation envoyée avec succès', 'success');
      await loadUsersWithRoles(); // Recharger la liste des utilisateurs
    } else if (response.status.code === 205) {
      // Gestion des erreurs de validation
      const errorMsg = response.errors 
        ? Object.values(response.errors).flat().join(', ')
        : 'Erreur de validation';
      throw new Error(errorMsg);
    } else if (response.status.code === 501) {
      throw new Error('Limite de collaborateurs atteinte pour cette entreprise');
    }

    return response;
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erreur lors de l'envoi de l'invitation";
    inviteError.value = message;
    await showToast(message, 'danger');
    throw err;
  } finally {
    isInvitingUser.value = false;
  }
};
  const getRoleColor = (roleId: string) => {
    const colors = ['warning', 'secondary', 'tertiary', 'success', 'primary'];
    const index = roleId.charCodeAt(0) % colors.length;
    return colors[index];
  };

  const isOwner = (user: UserWithRole) => {
    const role = user.role.toLowerCase();
    return role === 'owner' || role === 'propriétaire' || role.includes('owner');
  };

  const canDeleteUser = (user: UserWithRole) => !isOwner(user);

  // Loaders
  const loadRoles = async () => {
    try {
      isLoading.value = true;
      const { companyId } = await fetchTokenAndCompanyId();
      roles.value = await fetchCompanyRoles(companyId);
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Erreur lors du chargement des rôles';
      console.error(err);
    } finally {
      isLoading.value = false;
    }
  };
  const editRole = async (roleId: string, roleData: UpdateRoleData) => {
  try {
    isLoading.value = true;
    editError.value = null;

    if (!roleData.title.trim()) {
      throw new Error('Le titre du rôle est requis');
    }

    if (roleData.title.length < 3 || roleData.title.length > 100) {
      throw new Error('Le titre doit contenir entre 3 et 100 caractères');
    }

    if (!roleData.permissions || roleData.permissions.length === 0) {
      throw new Error('Au moins une permission doit être sélectionnée');
    }

    const { companyId } = await fetchTokenAndCompanyId();

    console.log('Mise à jour du rôle avec les permissions:', roleData.permissions);

    const result = await updateCompanyRole(companyId, roleId, {
      title: roleData.title,
      description: roleData.description || '',
      permissions: roleData.permissions
    });

    await showToast('Rôle mis à jour avec succès', 'success');
    
    // Recharger les données
    await loadRoles();
    await loadRoleDetails(roleId); // Recharger les détails du rôle actuel
    
    return result;

  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erreur lors de la mise à jour du rôle';
    editError.value = message;
    await showToast(message, 'danger');
    throw err;
  } finally {
    isLoading.value = false;
  }
};

  const loadUsersWithRoles = async () => {
    try {
      const { companyId } = await fetchTokenAndCompanyId();
      usersWithRoles.value = await getUsersWithRoles(companyId);
    } catch (err) {
      console.error('Erreur lors du chargement des utilisateurs:', err);
    }
  };

  const loadPermissions = async () => {
    try {
      isPermissionsLoading.value = true;
      const { companyId } = await fetchTokenAndCompanyId();
      availablePermissions.value = await fetchAvailablePermissions(companyId);
    } catch (err) {
      console.error('Erreur lors du chargement des permissions:', err);
    } finally {
      isPermissionsLoading.value = false;
    }
  };

  const loadRoleDetails = async (roleId: string) => {
    try {
      isLoadingDetails.value = true;
      const { companyId } = await fetchTokenAndCompanyId();
      currentRole.value = await fetchCompanyRoleDetails(companyId, roleId);
    } catch (err) {
      console.error('Erreur lors du chargement du rôle:', err);
    } finally {
      isLoadingDetails.value = false;
    }
  };
  // 1. Dans votre Vue component, modifiez la fonction handleAddRole :


// 2. Dans votre controller (PermessiondController.ts), modifiez createNewRole :

const createNewRole = async (roleData: {
  title: string;
  description?: string;
  permissions: string[]; // S'assurer que c'est bien un Array de strings
}) => {
  try {
    isLoading.value = true;
    error.value = null;

    if (!roleData.title.trim()) {
      throw new Error('Le titre du rôle est requis');
    }

    if (!roleData.permissions || roleData.permissions.length === 0) {
      throw new Error('Au moins une permission doit être sélectionnée');
    }

    const { companyId } = await fetchTokenAndCompanyId();

    console.log('Création du rôle avec les permissions:', roleData.permissions);

    const result = await createCompanyRole(companyId, {
      title: roleData.title,
      description: roleData.description || '',
      permissions: roleData.permissions // Doit être un Array
    });

    await showToast('Rôle créé avec succès', 'success');
    await loadRoles();
    return result;

  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erreur inconnue';
    error.value = message;
    await showToast(message, 'danger');
    throw err;
  } finally {
    isLoading.value = false;
  }
};
const revokeUserAccesss = async (userId: string): Promise<void> => {
  try {
    isLoading.value = true;
    error.value = null;
    
    const { companyId } = await fetchTokenAndCompanyId();
    const response = await revokeUserAccess(companyId, userId);

    if (response.status.code === 200) {
      await showToast(response.status.message, 'success');
      await loadUsersWithRoles(); // Recharger la liste des utilisateurs
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erreur lors de la révocation de l'accès";
    error.value = message;
    await showToast(message, 'danger');
    throw err;
  } finally {
    isLoading.value = false;
  }
};
const deleteRole = async (roleId: string) => {
  try {
    isLoading.value = true;
    error.value = null;
    
    const { companyId } = await fetchTokenAndCompanyId();
    
    await deleteCompanyRole(companyId, roleId);
    
    await showToast('Rôle supprimé avec succès', 'success');
    
    // Recharger les données après suppression
    await loadRoles();
    await loadUsersWithRoles();
    
  } catch (err) {
    console.error('Erreur lors de la suppression du rôle:', err);
    
    const message = err instanceof Error ? err.message : 'Erreur lors de la suppression du rôle';
    error.value = message;
    
    await showToast(message, 'danger');
    throw err;
    
  } finally {
    isLoading.value = false;
  }
};
  const viewRoleDetails = (roleId: string) => {
    router.push(`/roles/${roleId}`);
  };

  const showToast = async (message: string, color = 'success') => {
    const toast = await toastController.create({
      message,
      duration: 2000,
      color,
      position: 'top'
    });
    await toast.present();
  };

  onMounted(async () => {
    await loadRoles();
    await loadUsersWithRoles();
    await loadPermissions();
  });

  return {
    roles,
    currentRole,
    usersWithRoles,
    availablePermissions,
    isLoading,
    isLoadingDetails,
    isPermissionsLoading,
    error,
    searchQuery,
    inviteUser,
    showRoleForm,
    deleteRole,
    filteredRoles,
    filteredUsers,
    formatDate,
    getRoleColor,
    isOwner,
    isEditing, // Ajoutez ceci
    canDeleteUser,
    loadRoles,
    editError,
    isInvitingUser, // Ajoutez ceci
    inviteError,    // Ajoutez ceci
    inviteSuccess,  // Ajoutez ceci
    editRole,
    loadRoleDetails,
    revokeUserAccesss,
    loadPermissions,
    createNewRole,
    viewRoleDetails,
    showToast
  };
}
<template>
  <ion-page>
    <ion-header>
      <!--<ion-toolbar class="header-toolbar">
        <div class="header-content">
          <div class="logo-container">
            <img src="../assets/logo-iberis.png" alt="Iberis Logo" class="logo" />
          </div>
        </div>
      </ion-toolbar>-->
    </ion-header>
    
    <ion-content class="ion-padding">
      <!-- Search and Action Buttons -->
      <div class="action-container">
        <ion-searchbar
          v-model="searchQuery"
          placeholder="Search users or roles..."
          class="custom-searchbar"
          animated
          clear-input
        ></ion-searchbar>
        
        <div class="button-group">
          <ion-button 
            @click="showAddUserModal = true"
            expand="block" 
            class="custom-button add-user-btn"
          >
            <ion-icon :icon="personAddOutline" slot="start"></ion-icon>
            Add User
          </ion-button>
          
          <ion-button 
            @click="openAddRoleModal"
            expand="block"
            class="custom-button add-role-btn"
          >
            <ion-icon :icon="shieldOutline" slot="start"></ion-icon>
            Add Role
          </ion-button>
        </div>
      </div>

      <!-- Tab Navigation -->
      <div class="tab-container">
        <ion-segment v-model="activeTab" class="custom-segment">
          <ion-segment-button value="users" class="custom-segment-button">
            <ion-icon :icon="peopleOutline"></ion-icon>
            <ion-label>Users</ion-label>
          </ion-segment-button>
          <ion-segment-button value="roles" class="custom-segment-button">
            <ion-icon :icon="shieldOutline"></ion-icon>
            <ion-label>Roles</ion-label>
          </ion-segment-button>
        </ion-segment>
      </div>

      <!-- Loading State -->
      <div v-if="isLoading" class="loading-container">
        <ion-spinner name="crescent"></ion-spinner>
        <p>Loading...</p>
      </div>

      <!-- Error State -->
      <ion-alert v-if="error" :message="error" color="danger"></ion-alert>

      <!-- Content -->
      <div v-else class="content-container">
        <div v-if="activeTab === 'users'" class="fade-enter-active user-list-container">
          <ion-list>
            <ion-item-sliding v-for="user in filteredUsers" :key="user.hashed_id">
              <ion-item class="custom-item">
                <ion-button 
                  v-if="!isOwner(user)"
                  fill="clear" 
                  color="danger" 
                  size="small"
                  @click.stop="confirmRevokeAccess(user)"
                  class="revoke-btn"
                  slot="start"
                >
                  <ion-icon :icon="removeCircleOutline"></ion-icon>
                </ion-button>
                
                <ion-label>
                  <h2 class="user-name">{{ user.name }}</h2>
                  <p class="user-email">{{ user.email }}</p>
                  <div class="user-meta">
                    <ion-badge :color="getRoleColor(user.role_id)" class="role-badge">
                      {{ user.role }}
                    </ion-badge>
                    <span v-if="user.status" class="status-indicator active">Active</span>
                    <span v-else class="status-indicator inactive">Inactive</span>
                  </div>
                </ion-label>
                <ion-icon v-if="isOwner(user)" name="star" color="warning" slot="end"></ion-icon>
              </ion-item>

              <ion-item-options>
                <ion-item-option color="primary" @click="editUser(user)">
                  <ion-icon slot="icon-only" :icon="createOutline"></ion-icon>
                  Edit
                </ion-item-option>
                <ion-item-option 
                  v-if="!isOwner(user)" 
                  color="danger"
                  @click="confirmDeleteUser(user)"
                >
                  <ion-icon slot="icon-only" :icon="trashOutline"></ion-icon>
                  Delete
                </ion-item-option>
              </ion-item-options>
            </ion-item-sliding>
          </ion-list>
        </div>

        <!-- Roles List -->
        <div v-else class="fade-enter-active role-list-container">
          <ion-list>
            <ion-accordion-group>
              <ion-accordion v-for="role in filteredRoles" :key="role.hashed_id" class="custom-accordion">
                <ion-item slot="header" class="accordion-header">
                  <ion-label>
                    <h2 class="role-title">{{ role.title }}</h2>
                    <p class="role-description">{{ role.description || 'No description' }}</p>
                  </ion-label>
                  <div class="role-actions">
                    <ion-badge class="members-badge">
                      {{ role.users_count }} member(s)
                    </ion-badge>
                    <ion-button 
                      @click.stop="openEditRoleModal(role)"
                      fill="clear"
                      size="small"
                      color="primary"
                      class="edit-btn"
                    >
                      <ion-icon :icon="createOutline"></ion-icon>
                    </ion-button>
                    <ion-button 
                      @click.stop="confirmDeleteRole(role)"
                      fill="clear"
                      size="small"
                      color="danger"
                      class="delete-btn"
                    >
                      <ion-icon :icon="trashOutline"></ion-icon>
                    </ion-button>
                  </div>
                </ion-item>

                <div slot="content" class="accordion-content">
                  <ion-list v-if="role.users && role.users.length > 0">
                    <ion-item v-for="user in role.users" :key="user.hashed_id" class="member-item">
                      <ion-label>
                        <h3 class="member-name">{{ user.name }}</h3>
                        <p class="member-email">{{ user.email }}</p>
                        <p class="last-activity" v-if="user.last_activity">
                          Last activity: {{ formatDate(user.last_activity) }}
                        </p>
                      </ion-label>
                    </ion-item>
                  </ion-list>
                  
                  <div v-else class="empty-state">
                    <ion-icon :icon="alertCircleOutline" size="large"></ion-icon>
                    <p>No users in this role</p>
                  </div>
                </div>
              </ion-accordion>
            </ion-accordion-group>
          </ion-list>
        </div>
      </div>
    </ion-content>

    <!-- Add User Modal -->
    <ion-modal :is-open="showAddUserModal" @didDismiss="showAddUserModal = false">
      <ion-header>
        <ion-toolbar>
          <ion-title>Add User</ion-title>
          <ion-buttons slot="end">
            <ion-button @click="showAddUserModal = false">
              <ion-icon :icon="closeOutline"></ion-icon>
            </ion-button>
          </ion-buttons>
        </ion-toolbar>
      </ion-header>
      
      <ion-content class="ion-padding">
        <ion-item class="form-item">
          <ion-label position="stacked">Full Name <span class="required">*</span></ion-label>
          <ion-input v-model="newUser.fullName" clear-input></ion-input>
        </ion-item>

        <ion-item class="form-item">
          <ion-label position="stacked">Email <span class="required">*</span></ion-label>
          <ion-input v-model="newUser.email" type="email" clear-input></ion-input>
        </ion-item>

        <ion-item class="form-item">
          <ion-label position="stacked">Role <span class="required">*</span></ion-label>
          <ion-select v-model="newUser.roleId" interface="action-sheet">
            <ion-select-option 
              v-for="role in filteredRoles" 
              :key="role.hashed_id" 
              :value="role.hashed_id"
            >
              {{ role.title }}
            </ion-select-option>
          </ion-select>
        </ion-item>

        <ion-button 
          expand="block" 
          @click="handleAddUser" 
          class="submit-button"
          :disabled="isInvitingUser"
        >
          <ion-spinner v-if="isInvitingUser" name="crescent" size="small"></ion-spinner>
          {{ isInvitingUser ? 'Sending...' : 'Add' }}
        </ion-button>
      </ion-content>
    </ion-modal>

    <!-- Role Modal -->
    <ion-modal :is-open="showRoleModal" @didDismiss="closeRoleModal">
      <ion-header>
        <ion-toolbar>
          <ion-title>{{ isEditMode ? 'Edit Role' : 'Create New Role' }}</ion-title>
          <ion-buttons slot="end">
            <ion-button @click="closeRoleModal">
              <ion-icon :icon="closeOutline"></ion-icon>
            </ion-button>
          </ion-buttons>
        </ion-toolbar>
      </ion-header>
      
      <ion-content class="ion-padding">
        <ion-alert 
          v-if="editError" 
          :message="editError" 
          color="danger"
          class="mb-4"
        ></ion-alert>

        <ion-item class="form-item">
          <ion-label position="stacked">Role Title <span class="required">*</span></ion-label>
          <ion-input v-model="roleForm.title" clear-input></ion-input>
        </ion-item>

        <ion-item class="form-item">
          <ion-label position="stacked">Description</ion-label>
          <ion-textarea v-model="roleForm.description" rows="3"></ion-textarea>
        </ion-item>

        <!-- Permissions Section -->
        <div class="permissions-section">
          <ion-list-header class="section-header">
            <ion-label>
              <h2>Permissions</h2>
              <p class="permissions-count">{{ selectedPermissionsCount }} permission(s) selected</p>
            </ion-label>
          </ion-list-header>
          
          <div class="permission-actions">
            <ion-button 
              fill="outline" 
              size="small" 
              @click="selectAllPermissions"
              :disabled="isPermissionsLoading"
              class="action-btn"
            >
              Select All
            </ion-button>
            <ion-button 
              fill="outline" 
              size="small" 
              @click="clearAllPermissions"
              :disabled="isPermissionsLoading"
              class="action-btn"
            >
              Clear All
            </ion-button>
          </div>
          
          <div v-if="isPermissionsLoading" class="loading-permissions">
            <ion-spinner name="crescent"></ion-spinner>
            <p>Loading permissions...</p>
          </div>
          
          <div v-else-if="availablePermissions.length > 0" class="permissions-list-container">
            <div v-for="(perms, category) in groupedPermissions" :key="category" class="permission-category">
              <div class="category-header" @click="toggleCategory(category)">
                <h3>{{ category }}</h3>
                <ion-icon :icon="expandedCategories[category] ? chevronDownOutline : chevronForwardOutline"></ion-icon>
              </div>
              
              <div v-if="expandedCategories[category]" class="permission-items">
                <div v-for="perm in perms" :key="perm.id" class="permission-item">
                  <div class="permission-info">
                    <h4>{{ getPermissionDisplayName(perm.name) }}</h4>
                    <span class="permission-action" :class="getActionClass(perm.name)">
                      {{ getActionLabel(perm.name) }}
                    </span>
                  </div>
                  <ion-toggle
                    :modelValue="selectedPermissions.has(perm.id)"
                    @update:modelValue="val => togglePermission(perm.id, val)"
                    color="primary"
                  />
                </div>
              </div>
            </div>
          </div>
          
          <div v-else class="no-permissions">
            <ion-icon :icon="alertCircleOutline" size="large"></ion-icon>
            <p>No permissions available</p>
          </div>
        </div>

        <ion-button 
          expand="block" 
          @click="handleSubmitRole" 
          class="submit-button"
          :disabled="isLoading || selectedPermissions.size === 0"
        >
          <ion-spinner v-if="isLoading" name="crescent" size="small"></ion-spinner>
          {{ isLoading ? (isEditMode ? 'Updating...' : 'Creating...') : (isEditMode ? 'Update Role' : 'Create Role') }}
        </ion-button>
      </ion-content>
    </ion-modal>

    <!-- Confirmation Dialogs -->
    <ion-alert
      :is-open="deleteConfirmOpen"
      header="Confirm Deletion"
      message="Are you sure you want to delete this user?"
      :buttons="alertButtons('deleteUser')"
      @did-dismiss="deleteConfirmOpen = false"
    ></ion-alert>

    <ion-alert
      :is-open="deleteRoleConfirmOpen"
      header="Confirm Deletion"
      :message="`Are you sure you want to delete the role ${roleToDelete?.title}?`"
      :buttons="alertButtons('deleteRole')"
      @did-dismiss="deleteRoleConfirmOpen = false"
    ></ion-alert>

    <ion-alert
      :is-open="revokeConfirmOpen"
      header="Confirm Revocation"
      :message="`Are you sure you want to revoke access for ${userToRevoke?.name}?`"
      :buttons="alertButtons('revokeAccess')"
      @did-dismiss="revokeConfirmOpen = false"
    ></ion-alert>
  </ion-page>
</template>

<script setup lang="ts">
import {
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent,
  IonSearchbar, IonButton, IonIcon, IonSegment, IonSegmentButton,
  IonList, IonItem, IonLabel, IonBadge, IonModal, IonInput,
  IonSelect, IonSelectOption, IonTextarea,
  IonButtons, IonAccordion, IonAccordionGroup, IonItemSliding,
  IonItemOption, IonItemOptions, IonSpinner, IonAlert,
  IonListHeader, IonToggle
} from '@ionic/vue';
import {
  peopleOutline, shieldOutline, alertCircleOutline,
  personAddOutline, createOutline, trashOutline,
  closeOutline, chevronDownOutline, chevronForwardOutline, removeCircleOutline
} from 'ionicons/icons';
import { ref, reactive, computed } from 'vue';
import { toastController } from '@ionic/vue';
import { useRoleController } from '@/controllers/PermissionController';
import { parsePermissions } from '@/models/PermessionModel';
import { InviteUserData } from '@/models/PermessionModel';
import { getUsersWithRoles } from '@/services/Permessions';

// State management
const activeTab = ref('users');
const deleteConfirmOpen = ref(false);
const deleteRoleConfirmOpen = ref(false);
const userToDelete = ref<any>(null);
const roleToDelete = ref<any>(null);
const showAddUserModal = ref(false);
const showRoleModal = ref(false);
const isEditMode = ref(false);
const currentEditingRole = ref<any>(null);
const userToRevoke = ref<any>(null);
const revokeConfirmOpen = ref(false);
const selectedPermissions = ref<Set<string>>(new Set());

// Form data
const newUser = reactive({
  fullName: '',
  email: '',
  roleId: ''
});

const roleForm = reactive({
  title: '',
  description: ''
});

// UI state
const expandedCategories = ref<Record<string, boolean>>({
  'Dashboard': true,
  'Logs': false,
  'Files': false,
  'Reports': false,
  'Calendar': false
});

// Controller hooks
const {
  isLoading,
  error,
  searchQuery,
  filteredRoles,
  filteredUsers,
  isOwner,
  createNewRole,
  editRole,
  isEditing,
  inviteUser,
  isInvitingUser,
  inviteError,
  inviteSuccess,
  editError,
  getRoleColor,
  formatDate,
  availablePermissions,
  isPermissionsLoading,
  revokeUserAccesss,
  loadPermissions,
  deleteRole,
  loadRoleDetails,
  currentRole
} = useRoleController();

// Computed properties
const groupedPermissions = computed(() => {
  const groups: Record<string, any[]> = {};
  
  availablePermissions.value.forEach(perm => {
    const category = perm.category || 'Others';
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(perm);
  });
  
  return groups;
});

const selectedPermissionsCount = computed(() => selectedPermissions.value.size);

// Helper functions
const showToast = async (message: string, color: string = 'success') => {
  const toast = await toastController.create({
    message,
    duration: 3000,
    color,
    position: 'top'
  });
  await toast.present();
};

const alertButtons = (action: string) => {
  const baseButtons = [
    {
      text: 'Cancel',
      role: 'cancel',
      cssClass: 'cancel-btn'
    },
    {
      text: 'Confirm',
      role: 'confirm',
      cssClass: 'confirm-btn',
      handler: () => {
        switch(action) {
          case 'deleteUser': return deleteUser();
          case 'deleteRole': return roleToDelete.value && handleDeleteRole(roleToDelete.value.hashed_id);
          case 'revokeAccess': return handleRevokeAccess();
        }
      }
    }
  ];
  return baseButtons;
};

const togglePermission = (permId: string, value: boolean) => {
  if (value) {
    selectedPermissions.value.add(permId);
  } else {
    selectedPermissions.value.delete(permId);
  }
};

const getActionLabel = (permissionName: string): string => {
  const actionMap: Record<string, string> = {
    'create': 'Create',
    'read': 'Access',
    'update': 'Update',
    'delete': 'Delete',
    'access': 'Access',
    'manage': 'Manage'
  };
  
  for (const [key, value] of Object.entries(actionMap)) {
    if (permissionName.toLowerCase().includes(key)) {
      return value;
    }
  }
  return '';
};

const getActionClass = (permissionName: string): string => {
  const action = getActionLabel(permissionName).toLowerCase();
  switch(action) {
    case 'create': return 'action-create';
    case 'access': return 'action-access';
    case 'update': return 'action-update';
    case 'delete': return 'action-delete';
    default: return '';
  }
};

const getPermissionDisplayName = (permissionName: string): string => {
  return permissionName.replace(/^(create|read|update|delete|access|manage)\s*/i, '')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, l => l.toUpperCase());
};

const getCategorySelectedCount = (category: string): number => {
  const categoryPerms = groupedPermissions.value[category] || [];
  return categoryPerms.filter(perm => selectedPermissions.value.has(perm.id)).length;
};

const selectAllPermissions = () => {
  availablePermissions.value.forEach(perm => {
    selectedPermissions.value.add(perm.id);
  });
};

const clearAllPermissions = () => {
  selectedPermissions.value.clear();
};

// User management
const confirmRevokeAccess = (user: any) => {
  userToRevoke.value = user;
  revokeConfirmOpen.value = true;
};

const handleRevokeAccess = async () => {
  try {
    if (userToRevoke.value) {
      await revokeUserAccesss(userToRevoke.value.hashed_id);
      revokeConfirmOpen.value = false;
      userToRevoke.value = null;
      await showToast('Access revoked successfully', 'success');
    }
  } catch (error) {
    console.error('Revocation error:', error);
    await showToast(error?.message || 'Revocation error', 'danger');
  }
};

const handleAddUser = async () => {
  try {
    if (!newUser.fullName || !newUser.email || !newUser.roleId) {
      await showToast('All fields are required', 'danger');
      return;
    }

    const response = await inviteUser({
      name: newUser.fullName,
      email: newUser.email,
      role: newUser.roleId
    });

    if (response) {
      await showToast('User invited successfully', 'success');
      showAddUserModal.value = false;
      newUser.fullName = '';
      newUser.email = '';
      newUser.roleId = '';
    }
  } catch (error) {
    console.error('Invitation error:', error);
    await showToast(error?.message || 'Invitation error', 'danger');
  }
};

// Role management
const openAddRoleModal = async () => {
  isEditMode.value = false;
  currentEditingRole.value = null;
  resetRoleForm();
  showRoleModal.value = true;
  
  if (availablePermissions.value.length === 0 && !isPermissionsLoading.value) {
    await loadPermissions();
  }
};

const openEditRoleModal = async (role: any) => {
  try {
    isEditMode.value = true;
    currentEditingRole.value = role;
    
    await loadRoleDetails(role.hashed_id);
    
    roleForm.title = role.title;
    roleForm.description = role.description || '';
    selectedPermissions.value.clear();
    
    if (currentRole.value && currentRole.value.permissions) {
      try {
        const permissions = parsePermissions(currentRole.value.permissions);
        Object.entries(permissions).forEach(([key, value]) => {
          if (value === true) {
            selectedPermissions.value.add(key);
          }
        });
      } catch (e) {
        console.error('Permission parsing error:', e);
        if (typeof currentRole.value.permissions === 'object') {
          Object.entries(currentRole.value.permissions).forEach(([key, value]) => {
            if (value === "1" || value === 1 || value === true) {
              selectedPermissions.value.add(key);
            }
          });
        }
      }
    }
    
    showRoleModal.value = true;
    
    if (availablePermissions.value.length === 0 && !isPermissionsLoading.value) {
      await loadPermissions();
    }
  } catch (error) {
    console.error('Edit modal error:', error);
    await showToast('Error loading role details', 'danger');
  }
};

const closeRoleModal = () => {
  showRoleModal.value = false;
  resetRoleForm();
};

const resetRoleForm = () => {
  roleForm.title = '';
  roleForm.description = '';
  selectedPermissions.value.clear();
  isEditMode.value = false;
  currentEditingRole.value = null;
};

const toggleCategory = (category: string) => {
  expandedCategories.value[category] = !expandedCategories.value[category];
};

const handleSubmitRole = async () => {
  try {
    if (!roleForm.title.trim()) {
      await showToast('Role title is required', 'danger');
      return;
    }

    if (selectedPermissions.value.size === 0) {
      await showToast('At least one permission must be selected', 'danger');
      return;
    }

    const permissionsArray = Array.from(selectedPermissions.value);
    
    const roleData = {
      title: roleForm.title.trim(),
      description: roleForm.description?.trim() || '',
      permissions: permissionsArray
    };

    if (isEditMode.value && currentEditingRole.value) {
      await editRole(currentEditingRole.value.hashed_id, roleData);
      await showToast('Role updated successfully');
    } else {
      await createNewRole(roleData);
      await showToast('Role created successfully');
    }

    closeRoleModal();
    
  } catch (error) {
    console.error('Role submission error:', error);
    const errorMessage = error?.message || 'Error saving role';
    await showToast(errorMessage, 'danger');
  }
};

const confirmDeleteRole = (role: any) => {
  roleToDelete.value = role;
  deleteRoleConfirmOpen.value = true;
};

const handleDeleteRole = async (roleId: string) => {
  try {
    await deleteRole(roleId);
    deleteRoleConfirmOpen.value = false;
    roleToDelete.value = null;
    await showToast('Role deleted successfully', 'success');
  } catch (error) {
    console.error('Role deletion error:', error);
    await showToast(error?.message || 'Role deletion error', 'danger');
  }
};

// Placeholder functions
const editUser = (user: any) => {
  console.log('Edit user:', user);
};

const confirmDeleteUser = (user: any) => {
  userToDelete.value = user;
  deleteConfirmOpen.value = true;
};

const deleteUser = () => {
  console.log('Delete user:', userToDelete.value);
  deleteConfirmOpen.value = false;
  userToDelete.value = null;
};
</script>


  
  <style scoped>
  /* Base styles */
  ion-content {
    --background: #f5f5f5;
  }
  
  .header-toolbar {
    --background: #ffffff;
    --border-width: 0;
  }
  
  .logo {
    height: 40px;
    margin: 8px 0;
  }
  
  /* Action container */
  .action-container {
    margin-bottom: 20px;
    background: white;
    padding: 16px;
    border-radius: 12px;
  }
  ion-modal {
  --width: 85%;
  --height: 60%;
  --max-width: 100%;
  --max-height: 100%;
}

ion-modal::part(content) {
  border-radius: 16px 16px 0 0;
  box-shadow: 0 -4px 16px rgba(0, 0, 0, 0.12);
}

@media (min-width: 768px) {
  ion-modal {
    --width: 600px;
    --height: 80%;
    --max-width: 80%;
  }
}
  .custom-searchbar {
    --background: #f8f8f8;
    --border-radius: 8px;
    --box-shadow: none;
    --color: #333;
    padding: 0;
  }
  
  .button-group {
    display: flex;
    gap: 12px;
    margin-top: 16px;
  }
  
  .custom-button {
    --border-radius: 8px;
    font-weight: 500;
    --box-shadow: none;
    flex: 1;
    height: 48px;
  }
  
  .add-user-btn, .add-role-btn {
    --background: #dfc925;
    --color: #2c2c2c;
    --background-activated: #c9b320;
  }
  
  /* Tab navigation */
  .tab-container {
    margin-bottom: 20px;
    background: white;
    padding: 8px;
    border-radius: 12px;
  }
  
  .custom-segment {
    --background: #f0f0f0;
    border-radius: 8px;
    padding: 4px;
  }
  
  .custom-segment-button {
    --border-radius: 6px;
    --color: #666;
    --color-checked: #2c2c2c;
    --indicator-color: #dfc925;
    --indicator-height: 100%;
    min-height: 36px;
  }
  
  .custom-segment-button ion-icon {
    margin-right: 6px;
  }
  
  /* Lists */
  .user-list-container, .role-list-container {
    background: white;
    border-radius: 12px;
    padding: 0;
  }
  
  .custom-item {
    --background: white;
    --color: #2c2c2c;
    --padding-start: 16px;
    --padding-end: 16px;
    --inner-padding-end: 0;
    --border-width: 0;
    --min-height: 72px;
    margin-bottom: 0;
    border-bottom: 1px solid #f0f0f0;
  }
  
  .custom-item:last-child {
    border-bottom: none;
  }
  
  .user-name {
    font-weight: 500;
    color: #2c2c2c;
    margin-bottom: 4px;
  }
  
  .user-email {
    color: #555;
    font-size: 14px;
    margin-bottom: 8px;
  }
  
  .user-meta {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  
  .role-badge {
    font-weight: 500;
    text-transform: capitalize;
    font-size: 12px;
    padding: 4px 8px;
  }
  
  .status-indicator {
    font-size: 12px;
    padding: 2px 8px;
    border-radius: 10px;
    background: #f0f0f0;
    color: #666;
  }
  
  .status-indicator.active {
    background: #e8f5e9;
    color: #2e7d32;
  }
  
  .status-indicator.inactive {
    background: #ffebee;
    color: #c62828;
  }
  
  /* Accordion styles */
  .custom-accordion {
    margin-bottom: 0;
    border-bottom: 1px solid #f0f0f0;
  }
  
  .custom-accordion:last-child {
    border-bottom: none;
  }
  
  .accordion-header {
    --background: white;
    --border-width: 0;
    --inner-padding-end: 16px;
    --padding-start: 16px;
  }
  
  .role-title {
    font-weight: 500;
    color: #2c2c2c;
    margin-bottom: 4px;
  }
  
  .role-description {
    color: #555;
    font-size: 14px;
  }
  
  .role-actions {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  
  .members-badge {
    background: #f0f0f0;
    color: #666;
    font-weight: 500;
    padding: 4px 8px;
  }
  
  .edit-btn, .delete-btn {
    --padding-start: 4px;
    --padding-end: 4px;
  }
  
  .accordion-content {
    padding: 0;
    background: #fafafa;
  }
  
  .member-item {
    --background: #fafafa;
    --padding-start: 32px;
    --inner-padding-end: 16px;
    --border-width: 0;
    border-bottom: 1px solid #f0f0f0;
  }
  
  .member-item:last-child {
    border-bottom: none;
  }
  
  .member-name {
    font-weight: 500;
    color: #2c2c2c;
    margin-bottom: 4px;
  }
  
  .member-email {
    color: #555;
    font-size: 14px;
    margin-bottom: 4px;
  }
  
  .last-activity {
    color: #999;
    font-size: 12px;
  }
  
  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 40px;
    color: #999;
    text-align: center;
  }
  
  .empty-state ion-icon {
    color: #dfc925;
    margin-bottom: 8px;
  }
  
  /* Form styles */
  .form-item {
      color: #0e0e0e;
    --background: #f8f8f8;
    --border-radius: 8px;
    --padding-start: 12px;
    --inner-padding-end: 12px;
    margin-bottom: 16px;
  }
  
  .required {
    color: #f44336;
    margin-left: 4px;
  }
  
  .submit-button {
    --background: #dfc925;
    --color: #2c2c2c;
    --background-activated: #c9b320;
    margin-top: 24px;
    height: 48px;
    font-weight: 500;
  }
  
  /* Permissions section */
  .permissions-section {
      color: #0e0e0e;
    margin-top: 24px;
    background: white;
    padding: 16px;
    border-radius: 12px;
  }
  
  .section-header {
      color: #0e0e0e;
    --background: transparent;
    padding-left: 0;
    padding-right: 0;
  }
  
  .section-header h2 {
    font-size: 18px;
    font-weight: 600;
    color: #2c2c2c;
  }
  
  .permissions-count {
    color: #666;
    font-size: 14px;
    margin-top: 4px;
  }
  
  .permission-actions {
      color: #0e0e0e;
    display: flex;
    gap: 8px;
    margin-bottom: 16px;
  }
  
  .action-btn {
    --border-color: #e0e0e0;
    --color: #666;
    --border-radius: 6px;
    --padding-start: 12px;
    --padding-end: 12px;
    height: 32px;
    font-size: 14px;
  }
  
  .permissions-list-container {
      color: #0e0e0e;
    background: white;
    border-radius: 12px;
  }
  
  .permission-category {
    border-bottom: 1px solid #f0f0f0;
  }
  
  .permission-category:last-child {
    border-bottom: none;
  }
  
  .category-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px;
    cursor: pointer;
  }
  
  .category-header h3 {
    margin: 0;
    font-size: 16px;
    font-weight: 500;
    color: #2c2c2c;
  }
  
  .permission-items {
    padding: 0 16px;
  }
  
  .permission-item {
      color: #0e0e0e;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 0;
    border-bottom: 1px solid #f8f8f8;
  }
  
  
  .permission-item:last-child {
      color: #0e0e0e;
    border-bottom: none;
  }
  
  .permission-info {
    flex: 1;
  }
  
  .permission-info h4 {
    margin: 0 0 4px 0;
    font-size: 14px;
    font-weight: 400;
    color: #2c2c2c;
  }
  
  .permission-action {
  
    font-size: 12px;
    padding: 2px 8px;
    border-radius: 10px;
    font-weight: 500;
    text-transform: uppercase;
  }
  
  .action-create {
    background-color: #e8f5e9; /* Vert très clair */
    color: #2e7d32; /* Vert foncé */
  }
  
  .action-access {
    background-color: #e3f2fd; /* Bleu très clair */
    color: #1565c0; /* Bleu foncé */
  }
  
  .action-update {
    background-color: #fff8e1; /* Jaune très clair */
    color: #ff8f00; /* Orange */
  }
  
  .action-delete {
    background-color: #ffebee; /* Rouge très clair */
    color: #c62828; /* Rouge foncé */
  }
  
  .no-permissions {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 40px;
    color: #999;
    text-align: center;
  }
  
  .no-permissions ion-icon {
    color: #dfc925;
    margin-bottom: 8px;
  }
  
  /* Loading states */
  .loading-container, 
  .loading-permissions {
    background: white;
    border-radius: 12px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 40px;
    color: #666;
  }
  
  .loading-container ion-spinner, 
  .loading-permissions ion-spinner {
    --color: #dfc925;
    margin-bottom: 16px;
  }
  
  /* Responsive adjustments */
  @media (max-width: 768px) {
    .button-group {
      flex-direction: column;
    }
    
    .role-actions {
      flex-wrap: wrap;
    }
  }
  </style>

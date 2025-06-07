<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button default-href="/dashboard"></ion-back-button>
        </ion-buttons>
        <ion-title>Fournisseurs</ion-title>
      </ion-toolbar>
    </ion-header>
    
    <ion-content>
      <div class="container">
        <div class="logo-container">
          <img src="../assets/logo-iberis.png" alt="Logo Iberis" class="logo" />
        </div>

        <div class="content-wrapper">
          <ion-searchbar
            v-model="searchQuery"
            placeholder="Rechercher un fournisseur"
            class="search-bar"
            @ionInput="currentPage = 1"
            clear-icon="close-circle"
          ></ion-searchbar>

          <div v-if="isLoading" class="ion-text-center ion-padding">
            <ion-spinner></ion-spinner>
            <p>Chargement des fournisseurs...</p>
          </div>

          <div v-else>
            <ion-list class="list">
              <ion-item
                v-for="provider in paginatedProviders"
                :key="provider.personal_id"
                class="item"
                @click="viewFournisseurDetails(provider.hashed_id)"
              >
                <ion-label class="supplier-info">
                  <h2>{{ provider.display_name }}</h2>
                  <p v-if="provider.email">{{ provider.email }}</p>
                  <p v-if="provider.phone">{{ provider.phone }}</p>
                  <p v-if="provider.reference">Réf: {{ provider.reference }}</p>
                </ion-label>

                <div class="actions">
                  <img
                    src="../assets/icons8-modify-64.png"
                    alt="modify"
                    class="action-icon"
                    @click.stop="editProvider(provider.hashed_id)"
                  />
                  <img
                    src="../assets/delete.png"
                    alt="delete"
                    class="action-icon danger"
                    @click.stop="deleteProvider(provider.hashed_id)"
                    :disabled="isLoading"
                  />
                </div>
              </ion-item>
            </ion-list>

            <ion-footer v-if="filteredProviders.length > 0">
              <ion-toolbar>
                <ion-buttons slot="start">
                  <ion-button 
                    @click="currentPage--" 
                    :disabled="currentPage === 1" 
                    class="pagination-button"
                  >
                    Précédent
                  </ion-button>
                </ion-buttons>
                <ion-title>Page {{ currentPage }} / {{ totalPages }}</ion-title>
                <ion-buttons slot="end">
                  <ion-button 
                    @click="currentPage++" 
                    :disabled="currentPage === totalPages" 
                    class="pagination-button"
                  >
                    Suivant
                  </ion-button>
                </ion-buttons>
              </ion-toolbar>
            </ion-footer>

            <ion-fab vertical="bottom" horizontal="end" slot="fixed">
              <ion-fab-button @click="$router.push('/add-fournisseur')" class="fab-button">
                <ion-label class="fab-label">+</ion-label>
              </ion-fab-button>
            </ion-fab>
          </div>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { 
  IonPage, IonContent, IonSearchbar, IonList, IonItem, 
  IonLabel, IonButton, IonFooter, IonToolbar, IonButtons, 
  IonTitle, IonFab, IonFabButton, IonSpinner, IonHeader,
  IonBackButton
} from '@ionic/vue';
import { useProviderController } from '@/controllers/ProviderController';
import { watch } from 'vue';
import { useRouter } from 'vue-router';

const { 
  providers,
  filteredProviders,
  paginatedProviders,
  isLoading,
  error,
  searchQuery,
  currentPage,
  totalPages,
  loadProviders,
  editProvider,
  deleteProvider
} = useProviderController();
const router = useRouter();

const viewFournisseurDetails = (id: string) => router.push(`/fournisseur/${id}`);

// Watcher pour debug
watch(providers, (newVal) => {
  console.log('Providers changed:', newVal);
}, { deep: true });

// Watcher pour le loading state
watch(isLoading, (newVal) => {
  console.log('Loading state changed:', newVal);
});
</script>
  
<style scoped>
ion-content {
  --background: #f8f9fa;
}

ion-header ion-toolbar {
  --background: #47463d;
  --color: #ffffff;
}

.container {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 24px;
}

.logo-container {
  text-align: center;
  margin-bottom: 32px;
}

.logo {
  height: 160px;
  width: 260px;
}

.content-wrapper {
  max-width: 800px;
  width: 100%;
}

.search-bar {
  margin-bottom: 20px;
  --background: #ffffff;
  font-family: 'Franklin Gothic Medium', 'Arial Narrow', Arial, sans-serif;
  color: #282721;
  --border-radius: 12px;
  --box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.list {
  background: transparent;
  margin-bottom: 1.8rem;
}

.item {
  --background: #ffffff;
  --border-radius: 12px;
  --padding-start: 16px;
  --inner-padding-end: 16px;
  margin-bottom: 16px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.supplier-info {
  flex: 1;
}

.supplier-info h2 {
  color: #47463d;
  font-size: 1.2rem;
  font-weight: 600;
  margin-bottom: 8px;
}

.supplier-info p {
  color: #636e72;
  font-size: 0.9rem;
  margin: 4px 0;
}

.actions {
  display: flex;
  gap: 10px;
  align-items: center;
}

.action-icon {
  width: 24px;
  height: 24px;
  cursor: pointer;
}

.edit-button {
  --color: #47463d;
}

.delete-button {
  --color: #e74c3c;
}

ion-footer ion-toolbar {
  --background: #c2c2ad;
  --color: #000000;
  --border-color: #e0e0e0;
  --border-width: 1px;
  --border-style: solid;
  --padding-top: 8px;
  --padding-bottom: 8px;
  --padding-start: 16px;
  --padding-end: 16px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

ion-toolbar ion-button {
  --color: #000000;
  --border-radius: 20px;
  --padding-start: 12px;
  --padding-end: 12px;
  font-weight: 550;
  transition: background-color 0.2s ease;
}

ion-toolbar ion-button:hover {
  --background: #e0c764;
}

ion-toolbar ion-title {
  font-size: 1.1rem;
  font-weight: 600;
  font-family: sans-serif;
  color: #000000;
}

.pagination-button {
  --background: #47463d;
  --color: #ffffff;
  font-weight: 550;
  border-radius: 20px;
}

.fab-button {
  --background: #ecd737;
  --color: #1e1e1d;
  text-align: center;
}

.fab-button:hover {
  --background: #c3b12b;
}

.fab-label {
  font-size: 25px;
  font-weight: 600;
  color: #1e1e1d;
  text-align: center;
  display: block;
  padding: 4px;
}

.error-container {
  background-color: rgba(231, 76, 60, 0.1);
  border-radius: 12px;
  padding: 20px;
  margin: 20px 0;
}

.error-icon {
  font-size: 48px;
  color: #e74c3c;
  margin-bottom: 12px;
}

.empty-state {
  padding: 40px 20px;
}

.empty-icon {
  font-size: 64px;
  color: #c2c2ad;
  margin-bottom: 16px;
}

.empty-state h3 {
  font-size: 1.4rem;
  color: #47463d;
  margin-bottom: 12px;
}

.empty-state p {
  color: #636e72;
  margin-bottom: 20px;
}
</style>

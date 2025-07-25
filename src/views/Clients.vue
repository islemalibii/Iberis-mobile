<template>
  <ion-page>
    <ion-content>
      <div class="container">
        <div class="logo-container">
          <router-link to="/clients">
            <img src="../assets/logo-iberis.png" alt="Logo Iberis" class="logo" />
          </router-link>
        </div>

        <div class="content-wrapper">
          <ion-searchbar
            v-model="searchQuery"
            placeholder="Rechercher un client"
            class="search-bar"
          ></ion-searchbar>

          <div v-if="isLoading" class="loading">Chargement en cours...</div>

          <div v-else>
            <ion-list class="list">
              <ion-item
                v-for="client in paginatedClients"
                :key="client.personal_id"
                class="item"
                @click="viewClientDetails(client.hashed_id)"
              >
                <ion-label class="client-info">
                  <h2>{{ client.display_name}}</h2>
                  <p>{{ client.email }}</p>
                  <p>{{ client.phone }}</p>
                </ion-label>

                <div class="actions">
                  <img
                    src="../assets/icons8-modify-64.png"
                    alt="modify"
                    class="action-icon"
                    @click.stop="editClient(client.hashed_id)"
                  />
                  <img
                    src="../assets/delete.png"
                    alt="delete"
                    class="action-icon danger"
                    @click.stop="confirmDelete(client.hashed_id)" 
                    />
                </div>
              </ion-item>
            </ion-list>

            <ion-footer>
              <ion-toolbar>
                <ion-buttons slot="start">
                  <ion-button @click="prevPage" :disabled="currentPage === 1" class="pagination-button">
                    Précédent
                  </ion-button>
                </ion-buttons>
                <ion-title>Page {{ currentPage }} / {{ totalPages }}</ion-title>
                <ion-buttons slot="end">
                  <ion-button @click="nextPage" :disabled="currentPage === totalPages" class="pagination-button">
                    Suivant
                  </ion-button>
                </ion-buttons>
              </ion-toolbar>
            </ion-footer>
          </div>

          <ion-fab vertical="bottom" horizontal="end" slot="fixed">
            <ion-fab-button @click="openAddClientModal" class="fab-button">
              <ion-label class="fab-label">+</ion-label>
            </ion-fab-button>
          </ion-fab>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>
<script setup lang="ts">
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';
import {
  IonPage, IonContent, IonList, IonItem, IonLabel,
  IonButton, IonSearchbar, IonFooter, IonToolbar,
  IonTitle, IonButtons, IonFab, IonFabButton,
  IonSpinner, toastController, alertController
} from '@ionic/vue';
import { useClientController } from '@/controllers/ClientController';

const router = useRouter();

const {
  clients,
  searchQuery,
  isLoading,
  currentPage,
  paginatedClients,
  getDisplayNameType,
  totalPages,
  loadClients,
  deleteClient,
  nextPage,
  prevPage
} = useClientController();

// Chargement initial
onMounted(async () => {
  await loadClients();
  
});

// Confirmation de suppression
const confirmDelete = async (personal_id: string) => {
  const alert = await alertController.create({
    header: 'Confirmer la suppression',
    message: 'Cette action est irréversible. Continuer ?',
    buttons: [
      {
        text: 'Annuler',
        role: 'cancel',
        cssClass: 'secondary'
      },
      {
        text: 'Supprimer',
        handler: async () => {
          try {
            await performDelete(personal_id);
          } catch (error) {
            console.error('Erreur dans le handler:', error);
          }
        }
      }
    ]
  });
  await alert.present();
};

// Fonction de suppression
const performDelete = async (personal_id: string) => {
  const loadingToast = await toastController.create({
    message: 'Suppression en cours...',
    duration: 0, // Toast persistant
    position: 'top'
  });
  await loadingToast.present();

  try {
    const success = await deleteClient(personal_id);
    await loadingToast.dismiss();

    if (success) {
      const toast = await toastController.create({
        message: 'Client supprimé avec succès',
        duration: 2000,
        color: 'success',
        position: 'top'
      });
      await toast.present();
      await loadClients(); // Recharger les données
    } else {
      throw new Error('La suppression a échoué');
    }
  } catch (error) {
    await loadingToast.dismiss();
    console.error('Erreur complète:', error);

    const toast = await toastController.create({
      message: error instanceof Error ? error.message : 'Erreur inconnue',
      duration: 3000,
      color: 'danger',
      position: 'top'
    });
    await toast.present();
  }
};

// Navigation
const openAddClientModal = () => router.push('/add-client');
const editClient = (id: string) => router.push(`/edit-client/${id}`);
const viewClientDetails = (id: string) => router.push(`/client/${id}`);
</script>
<style scoped>
/* Vos styles restent inchangés */
ion-content {
  --background: #f8f9fa;
}

.container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 24px;
}

.actions {
  display: flex;
  gap: 8px;
  align-items: center;
}

.action-button {
  --background: #d9c94f;
  --color: #47463d;
  font-weight: 550;
  border-radius: 20px;
  transition: background-color 0.2s ease;
}

.action-button:hover {
  --background: #cab40f;
}

.action-icon {
  width: 24px;
  height: 24px;
  cursor: pointer;
}

.action-icon.danger {
  filter: brightness(0.8);
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
  text-align: center;
}

.search-bar {
  margin-bottom: 20px;
  --background: #ffffff;
  font-family: 'Franklin Gothic Medium', 'Arial Narrow', Arial, sans-serif;
  color: #282721;
  --border-radius: 12px;
  --box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

ion-toolbar {
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

.client-info {
  flex: 1;
}

.client-info h2 {
  color: #47463d;
  font-size: 1.2rem;
  font-weight: 600;
}

.client-info p {
  color: #636e72;
  font-size: 0.9rem;
  margin: 4px 0;
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
</style>
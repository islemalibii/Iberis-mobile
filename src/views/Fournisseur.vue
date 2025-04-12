<template>
    <ion-page>
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
            ></ion-searchbar>
  
            <ion-list class="list">
              <ion-item v-for="supplier in paginatedSuppliers" :key="supplier.id" class="item">
                <ion-label class="supplier-info">
                  <h2>{{ supplier.displayName }}</h2>
                  <p>{{ supplier.email }}</p>
                  <p>{{ supplier.phone }}</p>
                </ion-label>
  
                <div class="actions">
                  <img
                    src="../assets/icons8-modify-64.png"
                    alt="modify"
                    class="action-icon"
                    @click="editSupplier(supplier.id)"
                  />
                  <img
                    src="../assets/delete.png"
                    alt="delete"
                    class="action-icon danger"
                    @click="deleteSupplier(supplier.id)"
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
  
            <ion-fab vertical="bottom" horizontal="end" slot="fixed">
              <ion-fab-button @click="openAddSupplierModal" class="fab-button">
                <ion-label class="fab-label">+</ion-label>
              </ion-fab-button>
            </ion-fab>
          </div>
        </div>
      </ion-content>
    </ion-page>
  </template>
  
  <script>
  import {
    IonPage,
    IonContent,
    IonSearchbar,
    IonList,
    IonItem,
    IonLabel,
    IonButton,
    IonFooter,
    IonToolbar,
    IonButtons,
    IonTitle,
    IonFab,
    IonFabButton,
  } from "@ionic/vue";
  
  export default {
    components: {
      IonPage,
      IonContent,
      IonSearchbar,
      IonList,
      IonItem,
      IonLabel,
      IonButton,
      IonFooter,
      IonToolbar,
      IonButtons,
      IonTitle,
      IonFab,
      IonFabButton,
    },
    data() {
      return {
        suppliers: [
          { id: 1, displayName: "Fournisseur 1", email: "fournisseur1@example.com", phone: "123456789" },
          { id: 2, displayName: "Fournisseur 2", email: "fournisseur2@example.com", phone: "987654321" },
        ],
        searchQuery: "",
        currentPage: 1,
        itemsPerPage: 5,
      };
    },
    computed: {
      filteredSuppliers() {
        return this.suppliers.filter(
          (supplier) =>
            supplier.displayName.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
            supplier.email.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
            supplier.phone.toLowerCase().includes(this.searchQuery.toLowerCase())
        );
      },
      paginatedSuppliers() {
        const start = (this.currentPage - 1) * this.itemsPerPage;
        const end = start + this.itemsPerPage;
        return this.filteredSuppliers.slice(start, end);
      },
      totalPages() {
        return Math.ceil(this.filteredSuppliers.length / this.itemsPerPage);
      },
    },
    methods: {
      openAddSupplierModal() {
        this.$router.push("/add-fournisseur");
      },
      editSupplier(supplierId) {
        this.$router.push(`/edit-fournisseur/${supplierId}`);
      },
      deleteSupplier(supplierId) {
        this.suppliers = this.suppliers.filter((supplier) => supplier.id !== supplierId);
        this.currentPage = Math.min(this.currentPage, this.totalPages) || 1;
      },
      nextPage() {
        if (this.currentPage < this.totalPages) this.currentPage++;
      },
      prevPage() {
        if (this.currentPage > 1) this.currentPage--;
      },
    },
  };
  </script>
  
  <style scoped>
ion-content {
  --background: #f8f9fa; /* Fond légèrement gris */
}

.container {
  display: flex;
  flex-direction: column;
  justify-content: center;
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
  text-align: center;
}

.search-bar {
  margin-bottom: 20px;
  --background: #ffffff; /* Fond blanc */
  font-family: 'Franklin Gothic Medium', 'Arial Narrow', Arial, sans-serif;
  color: #282721;
  --border-radius: 12px;
  --box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); /* Ombre légère */
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



ion-toolbar {
  --background: #c2c2ad; /* Fond blanc */
  --color: #000000; /* Texte noir */
  --border-color: #e0e0e0; /* Bordure légère */
  --border-width: 1px; /* Épaisseur de la bordure */
  --border-style: solid; /* Style de la bordure */
  --padding-top: 8px; /* Espacement en haut */
  --padding-bottom: 8px; /* Espacement en bas */
  --padding-start: 16px; /* Espacement à gauche */
  --padding-end: 16px; /* Espacement à droite */
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); /* Ombre légère */
}

/* Style pour les boutons de pagination dans le toolbar */
ion-toolbar ion-button {
  --color: #000000; /* Texte noir */
  --border-radius: 20px; /* Coins arrondis */
  --padding-start: 12px; /* Espacement à gauche */
  --padding-end: 12px; /* Espacement à droite */
  font-weight: 550; /* Poids de la police */
  transition: background-color 0.2s ease; /* Transition fluide */
}

/* Effet de survol pour les boutons de pagination */
ion-toolbar ion-button:hover {
  --background: #e0c764; /* Jaune plus foncé au survol */
}

/* Style pour le titre dans le toolbar */
ion-toolbar ion-title {
  font-size: 1.1rem; /* Taille de la police */
  font-weight: 600; /* Poids de la police */
  font-family:sans-serif;
  color: #000000; /* Texte noir */
}

.list {
  background: transparent;
  margin-bottom: 1.8rem;
}

.item {
  --background: #ffffff; /* Fond blanc */
  --border-radius: 12px;
  --padding-start: 16px;
  --inner-padding-end: 16px;
  margin-bottom: 16px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); /* Ombre légère */
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.item:hover {
  transform: translateY(-2px); /* Effet de levée au survol */
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15); /* Ombre plus prononcée */
}

.client-info {
  flex: 1;
}

.client-info h2 {
  color: #47463d; /* Couleur sombre */
  font-size: 1.2rem;
  font-weight: 600;
}

.client-info p {
  color: #636e72; /* Couleur grise */
  font-size: 0.9rem;
  margin: 4px 0;
}

.actions {
  display: flex;
  gap: 8px;
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

.pagination-button {
  --background: #47463d; /* Couleur sombre */
  --color: #ffffff; /* Texte blanc */
  font-weight: 550;
  border-radius: 20px;
}
.fab-button {
  --background: #ecd737; /* Couleur jaune */
  --color: #1e1e1d; /* Texte sombre */
  text-align: center;
}

.fab-button:hover {
  --background: #c3b12b; /* Jaune plus foncé au survol */
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
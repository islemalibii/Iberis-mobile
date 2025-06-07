<template>
    <ion-page>
      <ion-content :fullscreen="true">
        <router-link to="/clients">
          <img src="../assets/logo-iberis.png" alt="Logo Iberis" class="logo" />
        </router-link>
        
        <div class="deliveries-header">
          <div class="title-container">
            <ion-label class="title">Modifier Bon de Sortie</ion-label>
            <p class="company">{{ companyName }}</p>
          </div>
        </div>  
  
        <div class="content-wrapper">
          <ion-accordion-group class="all">         
            <ion-accordion value="voucherDetails">
              <ion-item class="aTitle" slot="header">
                <ion-icon :icon="createOutline"></ion-icon>
                <ion-label>Détails du Bon</ion-label>
              </ion-item>
              <div slot="content" class="accordion-content">
                <ion-item>
                  <ion-label>Date</ion-label>
                  <ion-input 
            class="date-input" 
            type="date" 
            v-model="voucherForm.date"
            :disabled="!voucherForm.date" 
          ></ion-input>              </ion-item>
               <ion-item>
    <ion-label position="stacked">Catégorie</ion-label>
    <ion-select 
      v-model="voucherForm.category" 
      interface="action-sheet"
      placeholder="Sélectionner une catégorie"
      class="select-input"
    >
      <ion-select-option 
        v-for="category in categories" 
        :key="category.hashed_id" 
        :value="category.hashed_id"
      >
        {{ category.title }}
      </ion-select-option>
    </ion-select>
  </ion-item>
                <ion-item>
                  <ion-label>Objet</ion-label>
                  <ion-input v-model="voucherForm.object" class="in-cadre" placeholder="Entrer l'objet"></ion-input>
                </ion-item>             
                <ion-item>
    <ion-label>Bon de Sortie N°</ion-label>
    <div class="in-cadre">
      <ion-input 
        class="side" 
        v-model="voucherForm.ExitVoucher_number"
        @ionChange="validateExitVoucherNumber"
      ></ion-input>
    </div>
  </ion-item>            
                <ion-item>
                  <ion-label>Client</ion-label>
                  <div class="clients">
                    <ion-select v-model="voucherForm.client_id" class="select-input" @ionChange="onClientSelected">
                      <ion-select-option v-for="client in clients" :key="client.hashed_id" :value="client.hashed_id">
                        {{ client.display_name }}
                      </ion-select-option>
                    </ion-select>
                  </div>
                </ion-item>
                <ion-item>
    <ion-label>Référence N°</ion-label>
    <ion-input v-model="voucherForm.referenceNumber" class="in-cadre" :value="currentYear"></ion-input>
  </ion-item>
  <ion-item>
    <ion-label position="stacked">Adresse de facturation</ion-label>
    <ion-textarea
      v-model="voucherForm.coun"
      placeholder=""
      
      auto-grow
    ></ion-textarea>
    <ion-grid>
      <ion-row>
        <ion-col >
          <ion-input v-model="voucherForm.show_delivery" placeholder="Code postal"></ion-input>
        </ion-col>
  
      </ion-row>
  
    </ion-grid>
  </ion-item>
                <ion-button class="add-article-masse" @click="openArticleModal">Ajout en masse</ion-button>
                <ion-button class="add-article" @click="addArticleForm">Ajouter un article</ion-button>
                <div v-for="article in voucherForm.items" :key="article.hashed_id" class="article-list-item">
                  <ion-item @click="openArticleDetailsModal(article)" button detail="false">
                    <div class="article-container">
                      <div class="article-item">
                        <ion-label class="article-label">Article:</ion-label>
                        <span class="article_title">{{ article.title || 'Nouvel article' }}</span>
                      </div>
                      <ion-button @click.stop="removeArticle(article.hashed_id)" class="delete-articale-btn">
                        <ion-icon :icon="trashOutline"></ion-icon>
                      </ion-button>
                    </div>
                  </ion-item>
                </div>
                <p>Items prices are :</p>
                <ion-radio-group class="radio-group" v-model="voucherForm.tax_type">
                  <ion-item lines="none">
                    <div class="taxe">
                      <ion-radio :value="1" checked></ion-radio>
                      <ion-label >Without taxes</ion-label>
                    </div>
                  </ion-item>
                  <ion-item lines="none">
                    <div class="taxe">
                      <ion-radio :value="2"></ion-radio>
                      <ion-label class="taxe">Tax included</ion-label>
                    </div>
                  </ion-item>
                </ion-radio-group>
              
               
                <ion-item>
                  <ion-label>Conditions générales</ion-label>
                  <ion-textarea class="in-cadre" placeholder="À payer à réception" v-model="voucherForm.generalTerms"></ion-textarea>
                </ion-item>
                <ion-item>
                  <div class="add-files">
                    <ion-label class="attachments-label">Attachments</ion-label>
                    <div class="file-selection-container">
                      <ion-button class="add-file" @click="triggerFileInput">Choose Files</ion-button>
                      <span class="file-status">
                        {{ getFileDisplayText() }}
                      </span>
                    </div>
                    <input
                      type="file"
                      ref="fileInputRef"
                      multiple
                      style="display: none"
                      @change="handleFileChange"
                    />
                  </div>
                </ion-item>
                <div class="totals">
    <ion-item class="custom-item">
      <div class="row">
        <ion-label class="custom-label">Sous-total</ion-label>
        <ion-text class="custom-content">{{ formatPrice(voucherForm.totals.subtotal) }}</ion-text>
      </div>
    </ion-item>
    
  <ion-item class="custom-item">
    <div class="row">
      <ion-label class="custom-label">Remise</ion-label>
      <div class="discount-controls">
        <ion-input
          v-model="voucherForm.totals.discount"
          type="number"
    @ionInput="calculateTotal"
          placeholder="0.00"
          class="discount-input"
        ></ion-input>
     
      </div>
    </div>
  </ion-item>
    
    <ion-item class="custom-item" v-for="item in voucherForm.items" :key="item.id">
      <ion-list v-if="item.taxes && item.taxes.length">
        <ion-item v-for="tax in item.taxes" :key="tax.hashed_id" lines="none">
          <ion-label class="custom-label">
            <strong>{{ tax.title }}</strong> ({{ tax.rate }}%)
          </ion-label>
          <ion-note slot="end" class="custom-content">
            {{ formatPrice((item.unitPrice * item.quantity * tax.rate / 100).toFixed(2)) }}
          </ion-note>
        </ion-item>
      </ion-list>
    </ion-item>
    
    <ion-item class="custom-item" v-if="voucherForm.AdditionalEntries?.tva === 1">
      <div class="row">
        <ion-label class="custom-label">TVA (19%)</ion-label>
        <ion-text class="custom-content">{{ formatPrice(taxValues.tva) }}</ion-text>
      </div>
    </ion-item>
    
    <ion-item class="custom-item">
      <div class="row">
        <ion-label class="custom-label">Total</ion-label>
        <ion-text class="custom-content">{{ formatPrice(voucherForm.totals.total) }}</ion-text>
      </div>
   
    </ion-item>
  </div>
  </div>
            </ion-accordion>
            <!-- entrees sup Section -->
            <ion-accordion value="entrees-suo">
              <ion-item class="aTitle" slot="header">
                <ion-icon :icon="chatbubbleOutline"></ion-icon>
                <ion-label>Entrees supplementaires</ion-label>
              </ion-item>
              <div slot="content" class="accordion-content">
                <ion-item lines="none" class="toggle-row">
                  <div class="a-toggle">
                    <ion-label class="toggle-label">TVA (19%)</ion-label>
                    <ion-toggle
                      v-model="voucherForm.AdditionalEntries.tva"
                      @update:modelValue="voucherForm.AdditionalEntries.tva = $event ? 1 : 0; calculateTotal()"
                      />                    
                  </div>
                </ion-item>
              </div>
            </ion-accordion>
  
            <!-- Section Contenu -->
            <ion-accordion value="content">
              <ion-item class="aTitle" slot="header">
                <ion-icon :icon="calendarOutline"></ion-icon>
                <ion-label>Content</ion-label>
              </ion-item>
              <div slot="content" class="accordion-content">
                <ion-item>
                  <ion-label>Watermark</ion-label>
                  <ion-input class="in-cadre" v-model="voucherForm.watermark"></ion-input>
                </ion-item>
          <ion-item>
    <ion-label>PDF language (actuel: {{ voucherForm.language }})</ion-label>
    <ion-select class="select-input" v-model="voucherForm.language">
      <ion-select-option value="fr">Français</ion-select-option>
      <ion-select-option value="ar">العربية</ion-select-option>
      <ion-select-option value="en">English</ion-select-option>
    </ion-select>
  </ion-item>
                <ion-item lines="none" class="toggle-row">
                  <div class="a-toggle">
                    <ion-label class="toggle-label">Items description</ion-label>
                    <ion-toggle v-model="voucherForm.show_description"
                    @ionChange="voucherForm.show_description = $event.detail.checked ? 1 : 0"></ion-toggle>
                  </div>
                </ion-item>
                <ion-item lines="none" class="toggle-row">
                  <div class="a-toggle">
                    <ion-label class="toggle-label">Items unity</ion-label>
                    <ion-toggle v-model="voucherForm.showArticleUnit"
                    @ionChange="voucherForm.showArticleUnit = $event.detail.checked ? 1 : 0"></ion-toggle>
                  </div>
                </ion-item>
                <ion-item lines="none" class="toggle-row">
                  <div class="a-toggle">
                    <ion-label class="toggle-label">Items TTC prices</ion-label>
                    <ion-toggle v-model="voucherForm.showArticleTTCPrices"
                    @ionChange="voucherForm.showArticleTTCPrices = $event.detail.checked ? 1 : 0"></ion-toggle>
                  </div>
                </ion-item>
                <ion-item lines="none" class="toggle-row">
                  <div class="a-toggle">
                    <ion-label class="toggle-label">Items pictures</ion-label>
                    <ion-toggle v-model="voucherForm.show_pictures"
                    @ionChange="voucherForm.show_pictures = $event.detail.checked ? 1 : 0"></ion-toggle>
                  </div>
                </ion-item>
                <ion-item lines="none" class="toggle-row">
                  <div class="a-toggle">
                    <ion-label class="toggle-label">Billing address</ion-label>
                    <ion-toggle v-model="voucherForm.show_billing"
                    @ionChange="voucherForm.show_billing = $event.detail.checked ? 1 : 0"></ion-toggle>
                  </div>
                </ion-item>
                <ion-item lines="none" class="toggle-row">
                  <div class="a-toggle">
                    <ion-label class="toggle-label">Delivery address</ion-label>
                    <ion-toggle v-model="voucherForm.show_delivery"
                    @ionChange="voucherForm.show_delivery = $event.detail.checked ? 1 : 0"></ion-toggle>
                  </div>
                </ion-item>
                <ion-item lines="none" class="toggle-row">
                  <div class="a-toggle">
                    <ion-label class="toggle-label">General conditions</ion-label>
                    <ion-toggle v-model="voucherForm.show_conditions"
                    @ionChange="voucherForm.show_conditions = $event.detail.checked ? 1 : 0"></ion-toggle>
                  </div>
                </ion-item>
                <ion-item lines="none" class="toggle-row">               
                  <div class="a-toggle">
                    <ion-label class="toggle-label">Stamp & Signature</ion-label>
                    <ion-toggle v-model="voucherForm.show_stamp"
                    @ionChange="voucherForm.show_stamp = $event.detail.checked ? 1 : 0"></ion-toggle>
                  </div>
                </ion-item>
                <ion-item lines="none" class="toggle-row">
                    <div class="a-toggle">
                      <ion-label class="toggle-label">Bank details</ion-label>
                      <ion-toggle v-model="voucherForm.show_bank"
                      @update:modelValue="voucherForm.show_bank = $event ? 1 : 0"></ion-toggle>
                    </div>
                  </ion-item>
                  <ion-item v-if="voucherForm.show_bank === 1">
                    <ion-select v-model="voucherForm.selected_bank" class="select-input">
                      <ion-select-option
                        v-for="b in banks"
                        :key="b.hashed_id"
                        :value="b.hashed_id">
                        {{ b.bank }}
                      </ion-select-option>
                    </ion-select>
                  </ion-item>
              </div>
            </ion-accordion>
  
            <!-- Section Devise -->
            <ion-accordion value="currency">
              <ion-item class="aTitle" slot="header">
                <ion-icon :icon="chatbubbleOutline"></ion-icon>
                <ion-label>Currency</ion-label>
              </ion-item>
              <div slot="content" class="accordion-content">
                <ion-item>
                  <ion-label>Currency rate (EUR to TND)</ion-label>
                  <div class="input-button-container">
                    <ion-input class="in-cadre" v-model="currencyRate"></ion-input>
                    <ion-button class="reload-btn" @click="refreshCurrencyRate">
                      <ion-icon :icon="refreshOutline"></ion-icon>
                    </ion-button>
                  </div>
                </ion-item>
              </div>
            </ion-accordion>
            
            <!-- Section Remarques -->
            <ion-accordion value="remarque">
              <ion-item class="aTitle" slot="header">
                <ion-icon :icon="chatbubbleOutline"></ion-icon>
                <ion-label>Remarques</ion-label>
              </ion-item>
              <div slot="content" class="accordion-content">
                <ion-textarea placeholder="Entrer des remarques" v-model="voucherForm.notes"></ion-textarea>
              </div>
            </ion-accordion>
          </ion-accordion-group>
          <div class="add-invoice-container">
            <ion-button @click="validateAndSubmit" class="add-invoice">Mettre à jour</ion-button>
          </div>
        </div>
  
        <!-- Modal Détails de l'Article -->
        <ion-modal :is-open="isArticleDetailsModalOpen" @didDismiss="closeArticleDetailsModal" class="article-model">
          <ion-header>
            <ion-toolbar>
              <ion-title>{{ isNewItem ? 'New Item' : 'Item Details' }}</ion-title>
              <ion-buttons slot="end">
                <ion-button @click="closeArticleDetailsModal">
                  <ion-icon :icon="closeOutline"></ion-icon>
                </ion-button>
              </ion-buttons>
            </ion-toolbar>
          </ion-header>
          <ion-content class="ion-padding" v-if="selectedArticle">
            <ion-item class="open-newItemModel">
              <div class="input-with-button">
                <ion-input
                  class="in-cadre-in-modal-title"
                  v-model="selectedArticle.title"
                  placeholder="Enter title"/>
                <ion-button
                  class="add-anItem"
                  v-if="isNewItem"
                  @click="openNewItemModal">
                  <ion-icon :icon="addOutline"></ion-icon>
                </ion-button>
              </div>
            </ion-item>
            <ion-item>
              <ion-label>Description</ion-label>
              <ion-textarea class="in-cadre-in-modal" v-model="selectedArticle.description" placeholder="Description"></ion-textarea>
            </ion-item>
            <ion-item>
              <ion-label>Quantité</ion-label>
              <ion-input class="in-cadre-in-modal" type="number" v-model.number="selectedArticle.quantity"></ion-input>
            </ion-item>
            <ion-item>
              <ion-label>Prix unitaire</ion-label>
              <ion-input class="in-cadre-in-modal" type="number" v-model.number="selectedArticle.rate"></ion-input>
            </ion-item>
            <ion-item>
              <ion-label>Remise</ion-label>
              <div class="discount-container">
                <ion-input type="number" v-model.number="selectedArticle.discount.value"></ion-input>
                <ion-select class="discount-select" v-model="selectedArticle.discount.type">
                  <ion-select-option value="%">%</ion-select-option>
                  <ion-select-option value="0.0">0.0</ion-select-option>
                </ion-select>
              </div>
            </ion-item>
            <ion-item class="tax-item">
              <ion-label>Taxes</ion-label>
              <div class="tax-container" v-for="(tax, index) in selectedArticle.taxes" :key="index">
                <ion-select class="tax-select" :value="tax.id" @update:modelValue="onTaxChange($event, selectedArticle.id, index)">
                  <ion-select-option 
                    v-for="t in taxes" 
                    :key="t.hashed_id" 
                    :value="t.hashed_id">
                    {{ t.title }} ({{ t.rate }}%)
                  </ion-select-option>
                </ion-select>
                <ion-button class="delete-tax-btn" @click="removeTax(selectedArticle.id, tax.hashed_id)">
                  <ion-icon :icon="trashOutline"></ion-icon>
                </ion-button>
                <ion-button class="add-tax-btn" @click="addTax(selectedArticle.id)">+</ion-button>
              </div>
            </ion-item>          <ion-item>
              <ion-label>Prix</ion-label>
              <ion-input class="in-cadre-in-modal" type="number" :value="calculateArticlePrice(selectedArticle)" readonly></ion-input>
            </ion-item>
            <div class="add-article-modal-actions">
              <ion-button color="danger" @click="closeArticleDetailsModal">Fermer</ion-button>
              <ion-button color="primary" @click="saveArticle">{{ isNewItem ? 'Créer' : 'Enregistrer' }}</ion-button>
            </div>
          </ion-content>
        </ion-modal>
  
        <!-- Modal Ajout en Masse -->
        <ion-modal :is-open="isArticleModalOpen" @didDismiss="closeArticleModal" class="add-article-model">
          <ion-header>
            <ion-toolbar>
              <ion-title>Ajout d'articles en masse</ion-title>
              <ion-buttons slot="end">
                <ion-button @click="closeArticleModal">
                  <ion-icon :icon="closeOutline"></ion-icon>
                </ion-button>
              </ion-buttons>
            </ion-toolbar>
          </ion-header>
          <ion-content class="ion-padding">
            <ion-item class="add-article-model-search" lines="none">
              <div class="search-container">
                <span class="search-label">Recherche:</span>
                <ion-input v-model="searchQuery" placeholder="Rechercher..." class="search-input"></ion-input>
              </div>
            </ion-item>
            <ion-grid>
              <ion-row class="table-header">
                <ion-col>Article</ion-col>
                <ion-col>Prix</ion-col>
                <ion-col>Quantité</ion-col>
                <ion-col class="action-title">Action</ion-col>
              </ion-row>
              <ion-row v-for="article in paginatedArticles" :key="article.hashed_id" class="table-row">
                <ion-col class="articles">{{ article.title }}</ion-col>
                <ion-col class="prices">{{ article.rate }} TND</ion-col>
                <ion-col class="quantity-col">
                  <div class="quantity-box">{{ article.quantity }}</div>
                </ion-col>              
                <ion-col>
                  <ion-button class="add-article-model-action-button" @click="itemSelection(article.hashed_id)">
                    <ion-icon :icon="Items.includes(article.hashed_id) ? checkmarkCircleOutline : addOutline"></ion-icon>
                  </ion-button>
                </ion-col>
              </ion-row>
            </ion-grid>
            <div class="pagination-controls">
              <ion-button fill="clear" @click="prevPage" :disabled="currentPage === 1">
                <ion-icon :icon="chevronBackOutline"></ion-icon>
              </ion-button>
              <span>Page {{ currentPage }} / {{ totalPages }}</span>
              <ion-button fill="clear" @click="nextPage" :disabled="currentPage === totalPages">
                <ion-icon :icon="chevronForwardOutline"></ion-icon>
              </ion-button>
            </div>
            <div class="add-article-modal-actions">
              <ion-button color="danger" @click="closeArticleModal">Fermer</ion-button>
              <ion-button color="primary" @click="addSelectedItems">Ajouter</ion-button>
            </div>
          </ion-content>
        </ion-modal>
  
        <!-- Modal Nouvel Article -->
        <ion-modal :is-open="isNewItemModalOpen" @didDismiss="closeNewItemModal" class="newitem-modal">
          <ion-header>
            <ion-toolbar>
              <ion-title>Nouvel article</ion-title>
              <ion-buttons slot="end">
                <ion-button @click="closeNewItemModal">
                  <ion-icon :icon="closeOutline"></ion-icon>
                </ion-button>
              </ion-buttons>
            </ion-toolbar>
          </ion-header>
          <ion-content class="ion-padding">
            <div class="content-wrapper2">
              <ion-accordion-group class="general-information-section">
                <ion-accordion value="generalInformation">
                  <ion-item slot="header" class="accordion-header-newitem">
                    <ion-icon :icon="location" slot="start"></ion-icon>
                    <ion-label>Informations générales</ion-label>
                  </ion-item>
                  <div slot="content" class="accordion-content">
                    <ion-list>
                      <ion-item class="item">
                        <ion-label position="stacked">Titre</ion-label>
                        <ion-input v-model="newItemForm.title" class="in-cadre-in-modal"></ion-input>
                      </ion-item>
                      <ion-item class="item">
                        <ion-label position="stacked">Référence</ion-label>
                        <ion-input v-model="newItemForm.reference" class="in-cadre-in-modal"></ion-input>
                      </ion-item>
                      <ion-item class="item">
                        <ion-label position="stacked">Description</ion-label>
                        <ion-textarea v-model="newItemForm.description" class="in-cadre-in-modal"></ion-textarea>
                      </ion-item>
                   
            <ion-item class="tax-item">
              <ion-label>Taxes</ion-label>
              <div class="tax-container" v-for="tax in selectedArticle.taxes" :key="tax.id">
                <ion-select class="tax-select" v-model="tax.id">
                  <ion-select-option 
                    v-for="t in taxes" 
                    :key="t.id" 
                    :value="t.id">
                    {{ t.title }}
                  </ion-select-option>
                </ion-select>
                <ion-button class="delete-tax-btn" @click="removeTax(selectedArticle.hashed_id, tax.id)">
                  <ion-icon :icon="trashOutline"></ion-icon>
                </ion-button>
              </div>
              <ion-button class="add-tax-btn" @click="addTax(selectedArticle.hashed_id)">+</ion-button>
            </ion-item>
                      <ion-item class="item">
                        <ion-label position="stacked">Unité</ion-label>
                        <ion-select v-model="newItemForm.unity" class="select-input-modal">
                          <ion-select-option v-for="unity in itemUnities" :key="unity.hashed_id" :value="unity.hashed_id">
                            {{ unity.title }}
                          </ion-select-option>
                        </ion-select>
                      </ion-item>
                      <ion-item class="item">
                        <ion-label position="stacked">Catégorie</ion-label>
                        <ion-select class="select-input-modal" v-model="newItemForm.category">
                          <ion-select-option v-for="category in itemCategories" :key="category.hashed_id" :value="category.hashed_id">
                            {{ category.title }}
                          </ion-select-option>
                        </ion-select>
                      </ion-item>
                      <ion-item class="item">
                        <ion-label position="stacked">Marque</ion-label>
                        <ion-select class="select-input-modal" v-model="newItemForm.brand">
                          <ion-select-option v-for="brand in itemBrands" :key="brand.hashed_id" :value="brand.hashed_id">
                            {{ brand.title }}
                          </ion-select-option>
                        </ion-select>
                      </ion-item>
                    </ion-list>
                    <ion-list>
                      <ion-radio-group class="radio-buttons-new-item-modal" v-model="itemDestination">
                        <ion-label>Cet article est destiné à</ion-label>
                        <ion-item v-for="option in destinationOptions" :key="option.value">
                          <div class="radio-items-newitem-model">
                            <ion-radio slot="start" :value="option.value"></ion-radio>
                            <ion-label>{{ option.label }}</ion-label>
                          </div>
                        </ion-item>
                      </ion-radio-group>
                      <ion-radio-group class="radio-buttons-new-item-modal" v-model="itemType">
                        <ion-label>Type d'article</ion-label>
                        <ion-item v-for="option in typeOptions" :key="option.value">
                          <div class="radio-items-newitem-model">
                            <ion-radio slot="start" :value="option.value"></ion-radio>
                            <ion-label>{{ option.label }}</ion-label>
                          </div>
                        </ion-item>
                      </ion-radio-group>
                    </ion-list>
                  </div>
                </ion-accordion>
                <ion-accordion value="pricesLists">
                  <ion-item slot="header" class="accordion-header-newitem">
                    <ion-icon :icon="location" slot="start"></ion-icon>
                    <ion-label>Listes de prix</ion-label>
                  </ion-item>
                  <div slot="content" class="accordion-content">
                    <ion-list>
                      <ion-item class="item">
                        <ion-label position="stacked">Prix de vente par défaut</ion-label>
                        <ion-input v-model="sellingRate" class="in-cadre-in-modal" type="number" value="0"></ion-input>
                      </ion-item>
                      <ion-item class="item">
                        <ion-label position="stacked">Prix d'achat par défaut</ion-label>
                        <ion-input v-model="buyingRate" class="in-cadre-in-modal" type="number" value="0"></ion-input>
                      </ion-item>
                    </ion-list>
                  </div>
                </ion-accordion>
              </ion-accordion-group>
              <div class="add-article-modal-actions">
                <ion-button color="danger" @click="closeNewItemModal">Fermer</ion-button>
                <ion-button color="primary" @click="addNewItem">Ajouter</ion-button>
              </div>
            </div>
          </ion-content>
        </ion-modal>
      </ion-content>
    </ion-page>
  </template>
  
  <script setup>
  import { 
    IonPage, IonHeader, IonToolbar, IonTitle, IonContent, 
    IonList, IonItem, IonLabel, IonAccordion, IonAccordionGroup, 
    IonButton, IonPopover, IonButtons, IonIcon, IonModal, IonInput, IonSelectOption, IonSelect,
    IonTextarea, IonRadioGroup, IonRadio, IonText, IonToggle, IonCol, IonRow, IonGrid
  } from '@ionic/vue';
  import { 
    trashOutline, closeOutline, location, addOutline, checkmarkCircleOutline, 
    chevronBackOutline, chevronForwardOutline, createOutline, calendarOutline, cashOutline, chatbubbleOutline,
    refreshOutline
  } from 'ionicons/icons';
  
  import { useUpdateExitVoucherController } from '@/controllers/UpdateExitVoucher';
  
  const {
    voucherForm,
   // parsedVoucher,
    isArticleModalOpen,
    isArticleDetailsModalOpen,
    isNewItemModalOpen,
    isNewItemPopoverOpen,
    selectedArticle,
    currentPage,
    searchQuery,
    Items,
    paginatedArticles,
    totalPages,
    typeOptions,
    destinationOptions,
    clients,
    isNewItem,
    newItemForm,
    sellingRate,
    buyingRate,
    fileInputRef,
    categories,
    selectedCurrency,
    selectedClient,
    billingAddress,
    deliveryAddress,
    itemCategories,
    itemBrands,
    itemUnities,
    banks,
    companyName,
    taxValues,
    currencyRate,
    onClientSelected,
    calculateSubtotal,
    calculateTotal,
    formatPrice,
    updateTotals,
    getFileDisplayText,
    triggerFileInput,
    handleFileChange,
    getTaxRateFromType,
    addArticleForm,
    removeArticle,
    openArticleDetailsModal,
    closeArticleDetailsModal,
    addTax,
    removeTax,
    saveArticle,
    itemSelection,
    addSelectedItems,
    nextPage,
    prevPage,
    openArticleModal,
    closeArticleModal,
    openNewItemModal,
    closeNewItemModal,
    addNewItem,
    validateAndSubmit,
    calculateArticlePrice,
    handleTvaChange,
    onTaxChange ,
    refreshCurrencyRate,
    handleUpdate,
    bank,
    taxes,
  } = useUpdateExitVoucherController();
  
  </script>
  
  
    <style scoped>
    :root {
      --ion-background-color: #F8FAFC !important;
    }
    ion-page {
      --background: #ffffff !important;
      background: #ffffff !important;
    }
    ion-content {
      --background: #ffffff !important;
      background: #ffffff !important;
      --ion-background-color: #ffffff !important;
      min-height: 100vh;
      --padding-start: 10px;
      --padding-end: 10px;
    }
    .content-wrapper {
      overflow-y: auto;
      padding-bottom: 80px;
    }
    ion-item {
      width: 100%;
      --inner-padding-end: 0;
      --padding-start: 0;
      --background: #ffffff !important;
      --color : #000 !important;
    }
    ion-item::part(native) {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
    }
    ion-label {
      display: block !important;
      width: 100% !important;
      margin-bottom: 5px;
      font-weight: bold;
      margin-left: 15px;
    }
    ion-toggle {
      color: #000;
      background: #e0e0e0 !important;
      width: 50px !important;
      height: 30px !important;
      border-radius: 35%;
      --background-unchecked: #345fbb !important; 
      --background-checked: #345fbb !important; 
      --handle-background: #fff !important;
      --handle-background-checked: #fff !important; 
      --handle-border: 2px solid #d1d1d6 !important; 
      --handle-border-radius: 50% !important; 
      --track-border-radius: 15px !important;
      --track-border: 1px solid #d1d1d6 !important;
      --track-border-checked: 1px solid transparent !important;
    }
    .toggle-row::part(native) {
      display: flex;
      justify-content: space-between;
      --padding-start: 0;
      --inner-padding-end: 0;
    }
    .toggle-label{
      font-weight: normal;
    }
    .a-toggle {
      margin-top: 10px;
      display: flex;
      flex-direction: row;
      justify-content: space-between;
      align-items: center;
      width: 100%; 
    }
    ion-input,
    ion-select,
    ion-textarea,
    ion-text,
    ion-toggle,
    ion-button,
    ion-radio,
    p {
      display: block;
      width: 90%;
      margin-left: 15px;
      --color : #000 !important;
    }
    .factures-header {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      padding: 15px;
      margin-top: 30px;
    }
    .header-row {
      display: flex;
      justify-content: space-between; 
      align-items: center; 
      width: 100%; 
    }
    .action {
      --background: #27A2DB !important;
      --color: #ffffff !important; 
      font-size: 16px; 
      width: 100px; 
      height: 40px; 
      --border-radius: 8px !important; 
      margin-top: 20px;
    }
    .action:hover {
      --background: #2a6acc !important; 
    }
    ion-popover {
      --background: #ffffff;
      --box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15); 
      --border-radius: 10px; 
      --width: 130px;
      --padding-top: 8px; 
      --padding-bottom: 8px;
      --height: 100px;
    }
    ion-popover ion-item {
      --background: #ffffff;
      --color: #000000;
      font-size: 18px; 
      --min-height: 48px; 
    }
    .title {
      margin-top: 30px;
      color: #000; 
      font-size: 30px;
      font-weight: bold;
    }
    .company {
      color: #746868 !important; 
      font-size: 14px;
      margin-top: 5px; 
      margin-left: 15px; 
    }
    .all{
      margin-top: 90px;
      background: transparent !important; 
      --background: transparent !important;
    }
    .all ion-accordion {
      margin-bottom: 20px; 
    }
    .all ion-accordion-group::part(container) {
      border-radius: 15px;
      box-shadow: none !important;
      overflow: hidden;
    }
    .aTitle::part(native) {
      display: flex !important;
      flex-direction: row !important;
      align-items: center !important;
      justify-content: space-between !important; 
      border-radius: 10px;
      margin-bottom: 5px;
      --background: #e7e3d5;
      --color: #000000;
      border-bottom: 2px solid #000000 !important;
    }
    .aTitle::part(native):hover {
      --background: #edc84e; 
    }
    .aTitle::part(native)[aria-expanded="true"] {
      --background: #edc84e !important;
    }
    .clients{
      display: flex !important;
      flex-direction: row !important;
      align-items: center !important;
      justify-content: space-between !important;
      width: 97% !important;
    }
    .add-client{
      --background: #27A2DB !important; 
      --color: #ffffff !important; 
      width: 35px !important; 
      height: 30px !important;
      font-size: 20px !important; 
      --border-radius: 30% !important; 
      --padding-start: 0 !important; 
      --padding-end: 0 !important; 
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
    }
    .categories{
      display: flex !important;
      flex-direction: row !important;
      align-items: center !important;
      justify-content: space-between !important;
      width: 97% !important;
    }
    .add-article-masse{
      --background: #27A2DB !important; 
      --color: #ffffff !important; 
      margin-top: 20px;
      margin-bottom: 20px;
    
    }
    .add-client:hover,
    .add-article-masse:hover,
    .delete-articale-btn,
    .delete-tax-btn,
    .barcode-qr,
    .add-file{
      --background: #1e5e7b !important;
    }
    p{
      color: #000;
      font-weight: bold;
      margin-bottom: 25px;
    }
    .radio-group {
      display: flex;
      flex-direction: row;
      align-items: center;
      gap: 10px; 
    }
    .radio-group ion-label {
      font-weight: normal;
    }
    ion-radio {
      --color: #ffffff !important; 
      --color-checked: #ffffff !important;
      border-radius: 50%;
    }
    ion-radio::part(container) {
      width: 25px !important; 
      height: 25px !important; 
      background-color: #000000 !important; 
      border-radius: 50% !important; 
    }
    .article-item{
      display: flex;
      align-items: center;
    }
    .article-label{
      font-size: 20px;
      margin-right: 10px;  
      color: #000000;
    }
    .article_title{
      font-size: 20px;
      font-weight: bold;
      color: #000000;
    }
    .delete-articale-btn {
      --background: #27A2DB !important;
      --color: #ffffff !important; 
      width: 60px !important; 
      height: 40px !important;
      font-size: 20px;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
    }
    .article-title {
      display: flex !important;
      flex-direction: row !important;
      align-items: center !important;
      width: 70% !important; 
      gap: 10px !important; 
    }
    .article-container{
      display: flex !important;
      align-items: center !important;
      justify-content: space-between;
      gap:4px;
      border: 2px solid #1e5e7b;
      padding: 8px; 
      border-radius: 8px;
      margin-left: 15px;
      margin-top: 20px;
      width: 92%; 
      box-sizing: border-box;
      margin-bottom: 10px;
    }
    .add-files{
      display: flex !important;
      flex-direction: column !important;
      align-items: center !important;
    }
    .attachments-label{
      margin-top: 17px;
    }
    .taxe{
      display: flex !important;
      flex-direction: row !important;
      align-items: center !important;
    }
    .tax-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      width: 100%;
    }
    .tax-container {
      display: flex;
      align-items: center;
      width: 95%;
      gap: 10px; 
    }
    .tax-select {
      flex: 1; 
      border: 1px solid #ccc; 
      border-radius: 8px; 
      padding-left: 10px;
      background: white;
      width: 290px;
      margin-left: 15px;
    }
    .delete-tax-btn{
      --background: #27A2DB !important; 
      --color: #ffffff !important; 
      width: 35px !important; 
      height: 30px !important;
      font-size: 20px !important; 
      --border-radius: 30% !important; 
      --padding-start: 0 !important; 
      --padding-end: 0 !important; 
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
    }
    .add-tax-btn{
      --background: #27A2DB !important; 
      --color: #ffffff !important; 
      width: 35px !important; 
      height: 40px !important;
      font-size: 20px !important; 
      --border-radius: 30% !important; 
      --padding-start: 0 !important; 
      --padding-end: 0 !important; 
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
    }
    .discount-container {
      display: flex;
      align-items: center;
      width: 100%;
      border: 1px solid #ccc; 
      border-radius: 8px; 
      padding-left: 10px;
      background: white;
      width: 290px;
      margin-left: 15px;
    }
    .discount-container ion-input {
      flex: 1; 
    }
    .discount-select {
      width: 60px; 
      margin-left: 8px;
    
    }
    .add-article{
      --background: #27A2DB !important; 
      --color: #ffffff !important; 
      margin-top: 10px;
      margin-bottom: 10px;
    
    }
    .barcode-qr {
      --background: #27A2DB !important;
      --color: #ffffff !important;
    }
    .add-file {
      --background: #27A2DB !important;
      --color: #ffffff !important;
      width: 100px;
    }
    .file-selection-container {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-top: 7px;
    }
    .file-status {
      color: #666;
      font-size: 0.9em;
      border: 1px solid #666;
      border-radius: 5px;
      padding-top: 8px;
      padding-bottom: 8px;
      padding-left: 20px;
      padding-right: 20px;
    }
    .accordion-content {
      border-radius: 13px;
      box-shadow: 15px 15px 15px 15px rgba(0, 0, 0, 0.1);
      border: 1px solid #000000; 
      padding-top: 8px;
      padding-bottom: 8px;
    }
    .add-invoice {
      --background: #edc84e !important;
      --color: #000 !important;
      font-weight: bold;
      font-size: 20px;
      width: 150px !important;
      --border-width: 2px !important;
      --border-style: solid !important;
      --border-color: #000000 !important;
      --border-radius: 15px !important;
    }
    .add-invoice-container {
      display: flex;
      justify-content: center;
      margin-top: 80px; 
      padding-bottom: 20px;
    }
    .accordion-header::part(native) {
      display: flex !important;
      flex-direction: row !important;
      align-items: center !important;
      justify-content: space-between !important; 
      border-radius: 10px;
      margin-bottom: 5px;
      --background: #e7e3d5;
      --color: #000000;
      border-bottom: 2px solid #000000 !important;
      gap: 8px !important; 
    }
    .actions{
      --background: transparent !important;
      background: transparent !important;
    }
    .accordion-header::part(native):hover {
      --background: #edc84e; 
    }
    .accordion-header::part(native)[aria-expanded="true"] {
      --background: #edc84e !important;
    }
    
    .type{
      display: flex !important;
      flex-direction: row !important;
      align-items: center !important;
    }
    .add-article-model {
      --width: 90%;
      --max-width: 400px;
      --height: 85%;
      --border-radius: 10px;
      --background: #ffffff;
      --box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }
    .add-article-model ion-header {
      --background: #ffffff;
      --color: #000000;
    }
    .add-article-model-search{
      --background: transparent; 
      --padding-start: 0; 
      --padding-end: 0;
      --inner-padding-end: 0; 
      --inner-padding-start: 0;
      margin-bottom: 20px;
    }
    .search-container {
      display: flex;
      align-items: center; 
      justify-content: flex-start; 
      gap: 10px; 
      width: 100%; 
      flex-wrap: nowrap; 
    }
    .search-label {
      flex-shrink: 0; 
      font-weight: bold;
      margin: 0; 
      color: #000;
    }
    .search-input{
      margin: 0; 
      min-width: 0; 
      border: 1px solid #ccc; 
      padding: 5px;
      border-radius: 5px;
    }
    .action-title{
      margin-right: -20px;
    }
    .add-article-model ion-content{
      --color: #000 !important;
    }
    .table-header{
      color: #838080 !important;
      font-weight: bold;
      margin-bottom: 15px;
    }
    .add-article-model ion-content {
      --padding-start: 16px;
      --padding-end: 16px;
      --padding-top: 16px;
      --padding-bottom: 16px;
    }
    .add-article-model ion-item {
      --background: #ffffff;
      --padding-start: 0;
      --padding-end: 0;
    }
    .add-article-model ion-input {
      flex-grow: 1; 
      border: 1px solid #ccc; 
      padding: 5px;
      border-radius: 5px;
    }
    .pagination-controls {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 10px;
    }
    .pagination-controls ion-button {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      visibility: visible;
      opacity: 1;
    }
    .add-article-modal-actions {
      position: fixed;
      align-items: center;
      bottom: 0;
      left: 0;
      width: 100%;
      display: flex;
      padding: 16px;
      background-color: white;
    }
    .add-article-modal-actions ion-button {
      --border-radius: 8px;
      --padding-start: 20px;
      --padding-end: 20px;
      font-size: 16px;
      font-weight: bold;
    }
    .add-article-model ion-buttons ion-button {
      --color: #000000;
    }
    .quantity, .articles, .prices{
      margin-top: 12px;
    }
    .add-article-model-action-button{
      --background: #edecda;
    }
    .quantity-box {
      border: 1px solid #ccc;
      padding: 10px;
      border-radius: 4px;
      text-align: center;
      display: inline-block;
      min-width: 40px;
      background-color: #f9f9f9;
      margin-left: 15px;
    }
      ion-popover.newitemPopover {
        --width: 180px !important;
        --height: 51px !important;
        --background: transparent !important;
        background: transparent !important;
    
      }
      .radio-buttons-new-item-modal{
        display: flex;
        flex-direction: column;
        background: white;
        
      }
      .radio-buttons-new-item-modal ion-item{
        --background: transparent;
        border: none; 
        --inner-padding-end: 10px;
        margin-bottom: 10px;
      }
      .radio-buttons-new-item-modal ion-item.ion-activated {
       border: 2px solid #2196f3;
      }
      .radio-buttons-new-item-modal ion-label {
        color: black !important; 
        padding: 8px; 
      }
      .general-information-section{
        margin-bottom: 380px;
      }
      .radio-items-newitem-model{
        display: flex;
        flex-direction: row;
        align-items: center;
        border: none; 
      }
      .newitem-modal {
        --width: 90%;
        --max-width: 400px;
        --height: 70%;
        --border-radius: 10px;
        --background: #ffffff;
        --box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      }
      .content-wrapper2{
        padding-top: 100px;
        
      }
      .accordion-header-newitem::part(native) {
        display: flex !important;
        flex-direction: row !important;
        align-items: center !important;
        justify-content: space-between !important; 
        border-radius: 10px;
        margin-bottom: 15px;
        --background: #e7e3d5;
        --color: #000000;
        border-bottom: 2px solid #000000 !important;
        gap: 8px !important; 
        height: 80px;
        
      }
      .accordion-header-newitem::part(native):hover {
        --background: #edc84e; 
      }
      .accordion-header-newitem::part(native)[aria-expanded="true"] {
        --background: #edc84e !important;
      }
      ion-item {
      --border-color: transparent; 
      }
      .in-cadre {
        display: flex;
        align-items: center;
        border: 1px solid #ccc;
        border-radius: 8px;
        width: 330px;
        background: #fff;
        overflow: hidden;
        box-sizing: border-box;
        margin-left: 15px;
    
      }
      .in-cadre-input {
        font-size: 16px;
        color: #333;
        border: none;
        outline: none;
        background: transparent;
      }
      .side {
        flex: 200%;
        font-size: 16px;
        color: #666;
        background: #f5f5f5;
        border-left: 1px solid #ccc;
        border-radius: 0 8px 8px 0;
      }
      .date-input{
        border: 1px solid #ccc; 
        border-radius: 8px; 
        padding-left: 15px;
        background: white;
        width: 330px;
        margin-left: 15px;
      }
      .select-input{
        border: 1px solid #ccc; 
        border-radius: 8px; 
        padding-left: 10px;
        background: white;
        width: 330px;
        margin-left: 15px;
      }
    .totals{
      margin-top: 30px;
    }
    .row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      width: 100%;
    }
    .custom-item {
      --padding-start: 5px;
      --padding-end: 20px;
      margin-bottom: 10px;
    }
    .custom-label {
      font-weight: 700;
      flex: 1;
    }
    .custom-content {
      text-align: right;
      min-width: 100px;
    }
    ion-input.custom-content {
      width: 100%;
      font-size: 14px;
      border: 1px solid gray;
      border-radius: 6px;
      text-align: right;
      outline: none;
      --padding-end: 10px;
    }
    .custom-input-wrapper{
      display: flex;
      justify-content: flex-end;
      width: 100px;
    }
    .input-wrapper{
      display: flex;
      justify-content: flex-end;
      width: 100px;
      height: 45px;
    }
    .in-cadre-in-modal {
      display: flex;
      align-items: center;
      border: 1px solid #ccc;
      border-radius: 8px;
      width: 290px;
      background: #fff;
      overflow: hidden;
      box-sizing: border-box;
    }
      .date-input-modal{
        border: 1px solid #ccc; 
        border-radius: 8px; 
        padding-left: 15px;
        background: white;
        width: 290px;
        margin-left: 15px;
      }
      .select-input-modal{
        border: 1px solid #ccc; 
        border-radius: 8px; 
        padding-left: 10px;
        background: white;
        width: 290px;
        margin-left: 15px;
      }
      .article-list-item{
        margin-top: 10px;
        margin-bottom: 15px;
      }
      .article-model {
        --width: 90%;
        --max-width: 400px;
        --height: auto;
        --max-height: 90vh;
        --border-radius: 10px;
        --background: #ffffff;
        --box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        flex-direction: column;
      }
      .article-model ion-header {
        --background: #ffffff;
        --color: #000000;
      }
      .article-model ion-content {
        --padding-start: 16px;
        --padding-end: 16px;
        --padding-top: 16px;
        --padding-bottom: 16px;
      }
      .article-model ion-item {
        --background: #ffffff;
        --padding-start: 0;
        --padding-end: 0;
      }
      .article-modal-actions {
        display: flex;
        justify-content: flex-end;
        gap: 10px;
        margin-top: 20px;
      }
      .article-modal-actions ion-button {
        --border-radius: 8px;
        --padding-start: 20px;
        --padding-end: 20px;
        font-size: 16px;
        font-weight: bold;
      }
      .article-model ion-buttons ion-button {
        --color: #000000;
      }
    
    </style>
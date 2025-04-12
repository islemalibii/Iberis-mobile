<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Iberis</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content :fullscreen="true">
      <div class="factures-header">
        <div class="header-row">
          <ion-label class="title">Add invoices</ion-label>
          <ion-button class="action" id="action-trigger">Action</ion-button>
        </div>
        <p class="company">company name</p>
        <ion-popover ref="actionPopover" trigger="action-trigger" trigger-action="click">
          <ion-content>
            <ion-list class="actions">
              <ion-item button detail="false" @click="handleAction('brouillon')">Brouillon</ion-item>
              <ion-item button detail="false" @click="handleAction('valider')">Valider</ion-item>
            </ion-list>
          </ion-content>
        </ion-popover>
      </div>     
      <div class="content-wrapper">
        <ion-accordion-group class="all">         
          <!-- Invoice Details Section -->
          <ion-accordion value="invoiceDetails">
            <ion-item class="aTitle" slot="header">
              <ion-icon :icon="createOutline"></ion-icon>
              <ion-label>Invoice Details</ion-label>
            </ion-item>
            <div slot="content" class="accordion-content">
              <ion-item>
                <ion-label>Categorie</ion-label>
                <div class="categories">
                  <ion-select class=select-input>
                    <ion-select-option value="client1">Activité principale</ion-select-option>
                    <ion-select-option value="client2">Activité secondaire</ion-select-option>
                  </ion-select>
                  <ion-button class="add-categorie" @click="openCategoryModal">+</ion-button>
                </div>
              </ion-item>
              <ion-item>
                <ion-label>Date</ion-label>
                <ion-input class="date-input" type="date" value=""></ion-input>
              </ion-item>
              <ion-item>
                <ion-label>Condition</ion-label>
                <ion-select class="select-input">
                  <ion-select-option value="payable">Payable à réception</ion-select-option>
                  <ion-select-option value="end_month">Échéance à la fin du mois</ion-select-option>
                  <ion-select-option value="end_next_month">Échéance à la fin du mois prochain</ion-select-option>
                  <ion-select-option value="custom">Personnalisé</ion-select-option>
                </ion-select>
              </ion-item>
              <ion-item>
                <ion-label>Due Date</ion-label>
                <ion-input class="select-input" type="date" value=""></ion-input>
              </ion-item>
              <ion-item>
                <ion-label>Object</ion-label>
                <ion-input class="in-cadre" placeholder="Enter object"></ion-input>
              </ion-item>              
              <ion-item>
                <ion-label>Invoice N°</ion-label>
                <div class="in-cadre">
                  <ion-input class="in-cadre-input" placeholder="Year"></ion-input>
                  <ion-input class="side" placeholder="Sequence Number"></ion-input>
                </div>
              </ion-item>             
              <ion-item>
                <ion-label>Client</ion-label>
                <div class="clients">
                    <ion-select class="select-input">
                    <ion-select-option value="client1">Client 1</ion-select-option>
                    <ion-select-option value="client2">Client 2</ion-select-option>
                  </ion-select>
                  <ion-button class="add-client" @click="openClientModal">+</ion-button>
                </div>
              </ion-item>
              <ion-item>
                <ion-label>Reference N°</ion-label>
                <ion-input class="in-cadre" placeholder="Enter reference number"></ion-input>
              </ion-item>
              <ion-button  class="add-article-masse" @click="openArticleModal">Ajouter des articles en masse</ion-button>
              <p>Les prix des articles sont en :</p>
              <ion-radio-group class="radio-group">
                <ion-item lines="none">
                  <div class="taxe">
                    <ion-radio value="ht" checked></ion-radio>
                    <ion-label >Hors taxes</ion-label>
                  </div>
                </ion-item>
                <ion-item lines="none">
                  <div class="taxe">
                    <ion-radio value="ti"></ion-radio>
                    <ion-label class="taxe">Taxe incluse</ion-label>
                  </div>
                </ion-item>
              </ion-radio-group>
              <div v-for="article in articles" :key="article.id" class="article-list-item">
                <ion-item @click="openModal(article)" button detail="false">
                  <div class="article-container">
                      <ion-label class="article-item">Article</ion-label>
                      <ion-button @click.stop="removeArticle(article.id)" class="delete-articale-btn"><ion-icon :icon="trashOutline"></ion-icon></ion-button>
                  </div>
                </ion-item>
              </div>
              <ion-modal :is-open="isModalOpen" @didDismiss="closeModal" class="article-model">
                <ion-header>
                  <ion-toolbar>
                    <ion-title>Article</ion-title>
                    <ion-buttons slot="end">
                      <ion-button @click="closeModal"><ion-icon :icon="closeOutline"></ion-icon></ion-button>
                    </ion-buttons>
                  </ion-toolbar>
                </ion-header>
                <ion-content class="ion-padding">
                  <div v-if="selectedArticle">
                    <div class="article-title">
                      <ion-item id="inputTrigger" @click="openNewItemPopover">
                        <ion-input class="in-cadre-in-modal" v-model="inputValue" placeholder="title"></ion-input>
                      </ion-item>
                      <ion-popover :is-open="isNewItemPopoverOpen" @didDismiss="isNewItemPopoverOpen = false" trigger="inputTrigger" trigger-action="click" side="bottom" alignment="start" class="newitemPopover">
                        <ion-content>
                          <ion-list>
                            <ion-item detail="false" button @click="openNewItemModal">
                              <ion-label>New Item +</ion-label>
                            </ion-item>
                          </ion-list>
                        </ion-content>
                      </ion-popover>
                    </div>
                    <ion-item>
                      <ion-label>Description</ion-label>
                      <ion-textarea class="in-cadre-in-modal" placeholder="Enter description"></ion-textarea>
                    </ion-item>
                    <ion-item>
                      <ion-label>Quantity</ion-label>
                      <ion-input class="in-cadre-in-modal" type="number" value="1"></ion-input>
                    </ion-item>
                    <ion-item>
                      <ion-label>P.U.</ion-label>
                      <ion-input class="in-cadre-in-modal" type="number" value="0"></ion-input>
                    </ion-item>
                    <ion-item>
                      <ion-label>Discount</ion-label>
                      <div class="discount-container">
                        <ion-input type="number" value="0"></ion-input>
                        <ion-select class="discount-select" value="%">
                          <ion-select-option value="%">%</ion-select-option>
                          <ion-select-option value="0.0">0.0</ion-select-option>
                        </ion-select>
                      </div>
                    </ion-item>
                    <ion-item class="tax-item">
                      <ion-label>Taxes</ion-label>
                      <div class="tax-container" v-for="tax in selectedArticle.taxes" :key="tax.id">
                        <ion-select class="tax-select" v-model="tax.value">
                          <ion-select-option value="0%">0%</ion-select-option>
                          <ion-select-option value="FODEC(1%)">FODEC (1%)</ion-select-option>
                          <ion-select-option value="TVA(19%)">TVA (19%)</ion-select-option>
                        </ion-select>
                        <ion-button class="delete-tax-btn" @click="removeTax(selectedArticle.id, tax.id)">
                          <ion-icon :icon="trashOutline"></ion-icon>
                        </ion-button>
                        <ion-button class="add-tax-btn" @click="addTax(selectedArticle.id)">+</ion-button>
                      </div>
                    </ion-item>
                    <ion-item>
                      <ion-label>Prix</ion-label>
                      <ion-input class="in-cadre-in-modal" type="number" value="0.0"></ion-input>
                    </ion-item>
                  </div>
                  <div class="add-article-modal-actions">
                    <ion-button color="danger" @click="closeModal">Close</ion-button>
                    <ion-button color="primary" @click="addTheArticle">Add</ion-button>
                  </div>
                </ion-content>
              </ion-modal>
              <ion-item>
                <ion-label>Relié au journal comptable</ion-label>
                <ion-select class="select-input">
                  <ion-select-option value="701">ventes de produits finis</ion-select-option>
                  <ion-select-option value="7011">ventes de produits finis</ion-select-option>
                  <ion-select-option value="7012">ventes de produits finis</ion-select-option>
                </ion-select>
              </ion-item>
              <div class="actions">
                <ion-button class="add-article" @click="addArticle">Ajouter un article</ion-button>
                <ion-button class="barcode-qr">Barcode & QR Code Scanner</ion-button>
              </div>
              <ion-item>
                <ion-label>Conditions générales</ion-label>
                <ion-textarea class="in-cadre" placeholder="Enter terms"></ion-textarea>
              </ion-item>
              <ion-item>
                <div class="add-files">
                  <ion-label>Pièces jointes</ion-label>
                  <ion-button class="add-file">Choose Files</ion-button>
                </div>
              </ion-item>
              <ion-item class="custom-item">
                <ion-label class="custom-label">Sous total</ion-label>
                <ion-text class="custom-content">0.000 TND</ion-text>
              </ion-item>
              <ion-item class="custom-item">
                <ion-label class="custom-label">Remise</ion-label>
                <ion-input class="custom-content" type="number" value="0"></ion-input>
              </ion-item>
              <ion-item class="custom-item">
                <ion-label class="custom-label">Total</ion-label>
                <ion-text class="custom-content">0.000 TND</ion-text>
              </ion-item>
            </div>
          </ion-accordion>
          <!-- contenu Section -->
          <ion-accordion value="content">
            <ion-item class="aTitle" slot="header">
              <ion-icon :icon="calendarOutline"></ion-icon>
              <ion-label>Content</ion-label>
            </ion-item>
            <div slot="content" class="accordion-content">
              <ion-item>
                <ion-label>Object</ion-label>
                <ion-input class="in-cadre" placeholder="Enter object"></ion-input>
              </ion-item>
              <ion-item>
                  <ion-label>Language de PDF</ion-label>
                    <ion-select class="select-input" value="%">
                      <ion-select-option value="frensh">frensh</ion-select-option>
                      <ion-select-option value="arabic">arabic</ion-select-option>
                      <ion-select-option value="english">english</ion-select-option>
                    </ion-select>
                </ion-item>
                <ion-item lines="none" class="toggle-row">
                  <div class="a-toggle">
                    <ion-label class="toggle-label">Description des articles</ion-label>
                    <ion-toggle></ion-toggle>
                  </div>
                </ion-item>
                <ion-item lines="none" class="toggle-row">
                  <div class="a-toggle">
                    <ion-label class="toggle-label">Unité des articles</ion-label>
                    <ion-toggle></ion-toggle>
                  </div>
                </ion-item>
                <ion-item lines="none" class="toggle-row">
                  <div class="a-toggle">
                    <ion-label class="toggle-label">Prix TTC des articles</ion-label>
                    <ion-toggle></ion-toggle>
                  </div>
                </ion-item>
                <ion-item lines="none" class="toggle-row">
                  <div class="a-toggle">
                    <ion-label class="toggle-label">Photos des articles</ion-label>
                    <ion-toggle></ion-toggle>
                  </div>
                </ion-item>
                <ion-item lines="none" class="toggle-row">
                  <div class="a-toggle">
                    <ion-label class="toggle-label">Adresse de facturation</ion-label>
                    <ion-toggle></ion-toggle>
                  </div>
                </ion-item>
                <ion-item lines="none" class="toggle-row">
                  <div class="a-toggle">
                    <ion-label class="toggle-label">Adresse de livraison</ion-label>
                    <ion-toggle></ion-toggle>
                  </div>
                </ion-item>
                <ion-item lines="none" class="toggle-row">
                  <div class="a-toggle">
                    <ion-label class="toggle-label">Conditions générales</ion-label>
                    <ion-toggle></ion-toggle>
                  </div>
                </ion-item>
                <ion-item lines="none" class="toggle-row">               
                  <div class="a-toggle">
                    <ion-label class="toggle-label">Cachet & Signature</ion-label>
                    <ion-toggle></ion-toggle>
                  </div>
                </ion-item>
                <ion-item lines="none" class="toggle-row">
                  <div class="a-toggle">
                    <ion-label class="toggle-label">Détails bancaires</ion-label>
                    <ion-toggle></ion-toggle>
                  </div>
                </ion-item>
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
                  <ion-toggle></ion-toggle>
                </div>
              </ion-item>
              <ion-item lines="none" class="toggle-row">
                <div class="a-toggle">
                  <ion-label class="toggle-label">Timbre Fiscal</ion-label>
                  <ion-toggle></ion-toggle>
                </div>
              </ion-item>
            </div>
          </ion-accordion>
          <!-- recurrence Section -->
          <ion-accordion value="recurrence">
            <ion-item class="aTitle" slot="header">
              <ion-icon :icon="chatbubbleOutline"></ion-icon>
              <ion-label>Recurrence de la facture</ion-label>
            </ion-item>
            <div slot="content" class="accordion-content">
              <ion-item lines="none" class="toggle-row">
                <div class="a-toggle">
                  <ion-label class="toggle-label">Cette facture est récurrente</ion-label>
                  <ion-toggle v-model="isRecurrent" @ionChange="toggleRecurrent"></ion-toggle>
                </div>
              </ion-item>
              <div v-if="isRecurrent" class="recurrence-inputs">
                <ion-item>
                  <ion-label>Start Date</ion-label>
                  <ion-input class="date-input" type="date"></ion-input>
                </ion-item>
                <ion-item>
                  <ion-label>End Date</ion-label>
                  <ion-input class="date-input" type="date"></ion-input>
                </ion-item>
                <ion-item>
                  <ion-label>Every</ion-label>
                  <ion-input class="in-cadre" type="text" value="1"></ion-input>
                </ion-item>
                <ion-item>
                  <ion-label>Frequency</ion-label>
                  <ion-select class="select-input" v-model="frequency">
                    <ion-select-option value="daily">Daily</ion-select-option>
                    <ion-select-option value="weekly">Weekly</ion-select-option>
                    <ion-select-option value="monthly">Monthly</ion-select-option>
                    <ion-select-option value="yearly">Yearly</ion-select-option>
                  </ion-select>
                </ion-item>
              </div>
            </div>
          </ion-accordion>
          <!-- remarques Section -->
          <ion-accordion value="remarque">
            <ion-item class="aTitle" slot="header">
              <ion-icon :icon="chatbubbleOutline"></ion-icon>
              <ion-label>Remarques</ion-label>
            </ion-item>
            <div slot="content" class="accordion-content">
              <ion-textarea placeholder="Enter any remarks"></ion-textarea>
            </div>
          </ion-accordion>
        </ion-accordion-group>
        <div class="add-invoice-container">
          <ion-button class="add-invoice">Add</ion-button>
        </div>
      </div>
      <!-- Add the Modal for New Category -->
      <ion-modal :is-open="isCategoryModalOpen" @didDismiss="closeCategoryModal" class="add-category-model">
        <ion-header>
          <ion-toolbar>
            <ion-title>New category</ion-title>
            <ion-buttons slot="end">
              <ion-button @click="closeCategoryModal">
                <ion-icon :icon="closeOutline"></ion-icon>
              </ion-button>
            </ion-buttons>
          </ion-toolbar>
        </ion-header>
        <ion-content class="ion-padding">
          <ion-item>
            <ion-input v-model="newCategory" placeholder="Service" class="in-cadre-in-modal"></ion-input>
          </ion-item>
          <div class="add-category-modal-actions">
            <ion-button color="danger" @click="closeCategoryModal">Fermer</ion-button>
            <ion-button color="primary" @click="addCategory">Ajouter</ion-button>
          </div>
        </ion-content>
      </ion-modal>
      <!-- Add the Modal for New Client -->
      <ion-modal :is-open="isClientModalOpen" @didDismiss="closeClientModal" class="add-client-model">
        <ion-header>
          <ion-toolbar>
            <ion-title>New client</ion-title>
            <ion-buttons slot="end">
              <ion-button @click="closeClientModal">
                <ion-icon :icon="closeOutline"></ion-icon>
              </ion-button>
            </ion-buttons>
          </ion-toolbar>
        </ion-header>
        <ion-content class="ion-padding">
          <div class="content-wrapper1">
            <form @submit.prevent="submitSupplier">
              <!-- Informations générales -->
              <ion-accordion-group class="add-client-sections">
                <ion-accordion value="generalInfo">
                  <ion-item slot="header" class="accordion-header">
                    <ion-icon :icon="person" slot="start"></ion-icon>
                    <ion-label>Informations générales</ion-label>
                  </ion-item>
                  <div slot="content" class="accordion-content">
                    <ion-list>
                      <ion-item class="item">
                        <ion-label position="stacked">Titre</ion-label>
                        <ion-select class="select-input-modal" v-model="supplier.title" placeholder="Sélectionnez un titre">
                          <ion-select-option value="Mr.">Mr.</ion-select-option>
                          <ion-select-option value="Mme.">Mme.</ion-select-option>
                        </ion-select>
                      </ion-item>
                      <ion-item class="item">
                        <ion-label position="stacked">Prénom (*)</ion-label>
                        <ion-input class="in-cadre-in-modal" v-model="supplier.firstName" required></ion-input>
                      </ion-item>
                      <ion-item class="item">
                        <ion-label position="stacked">Nom de famille</ion-label>
                        <ion-input class="in-cadre-in-modal" v-model="supplier.lastName"></ion-input>
                      </ion-item>
                      <ion-item class="item">
                        <ion-label position="stacked">Entreprise</ion-label>
                        <ion-input class="in-cadre-in-modal" v-model="supplier.company"></ion-input>
                      </ion-item>
                      <ion-item class="item">
                        <ion-label position="stacked">Nom affiché (*)</ion-label>
                        <ion-input class="in-cadre-in-modal" v-model="supplier.displayName" required></ion-input>
                      </ion-item>
                      <ion-item class="item">
                        <ion-label position="stacked">Référence</ion-label>
                        <ion-input class="in-cadre-in-modal" v-model="supplier.reference"></ion-input>
                      </ion-item>
                      <ion-item class="item">
                        <ion-label position="stacked">Email</ion-label>
                        <ion-input class="in-cadre-in-modal" v-model="supplier.email" type="email"></ion-input>
                      </ion-item>
                      <ion-item class="item">
                        <ion-label position="stacked">Téléphone</ion-label>
                        <ion-input class="in-cadre-in-modal" v-model="supplier.phone" type="tel"></ion-input>
                      </ion-item>
                      <ion-item class="item">
                        <ion-label position="stacked">Site Internet</ion-label>
                        <ion-input class="in-cadre-in-modal" v-model="supplier.website" type="url"></ion-input>
                      </ion-item>
                    </ion-list>
                  </div>
                </ion-accordion>
              </ion-accordion-group>
              <!-- Informations professionnelles -->
              <ion-accordion-group class="add-client-sections">
                <ion-accordion value="professionalInfo">
                  <ion-item slot="header" class="accordion-header">
                    <ion-icon :icon="briefcase" slot="start"></ion-icon>
                    <ion-label>Informations professionnelles</ion-label>
                  </ion-item>
                  <div slot="content" class="accordion-content">
                    <ion-list>
                      <ion-item class="item">
                        <ion-label position="stacked">Type</ion-label>
                        <ion-radio-group :value="supplier.professionalInfo.type" @ionChange="supplier.professionalInfo.type = $event.detail.value" class="radio-group1">
                          <ion-item lines="none">
                            <div class="type">
                              <ion-radio value="entreprise"></ion-radio>
                              <ion-label>Entreprise</ion-label>
                            </div>
                          </ion-item>
                          <ion-item lines="none">
                            <div class="type">
                              <ion-radio value="particulier"></ion-radio>
                              <ion-label>Particulier</ion-label>
                            </div>
                          </ion-item>
                        </ion-radio-group>
                      </ion-item>
                      <ion-item class="item">
                        <ion-label position="stacked">Grille des Prix</ion-label>
                        <ion-select class="select-input-modal" value="prix">
                          <ion-select-option value="prix">Prix par defaut</ion-select-option>
                        </ion-select>
                      </ion-item>
                      <ion-item class="item">
                        <ion-label position="stacked">
                          {{ supplier.professionalInfo.type === 'particulier' ? "Numéro d'identité" : "Numéro d'identification fiscale" }}
                        </ion-label>
                        <ion-input class="in-cadre-in-modal" v-model="supplier.professionalInfo.identityNumber"></ion-input>
                      </ion-item>
                      <ion-item class="item" v-if="supplier.professionalInfo.type === 'particulier'">
                        <ion-label position="stacked">Date d'identité</ion-label>
                        <ion-input class="date-input-modal" v-model="supplier.professionalInfo.identityDate" type="date"></ion-input>
                      </ion-item>
                      <ion-item class="item">
                        <ion-label position="stacked">Activité</ion-label>
                        <ion-select class="select-input-modal" value="activite">
                          <ion-select-option value="activite">Activite</ion-select-option>
                        </ion-select>
                      </ion-item>
                      <ion-item class="item">
                        <ion-label position="stacked">Devise</ion-label>
                        <ion-select class="select-input-modal" value="devise">
                          <ion-select-option value="devise">Devise</ion-select-option>
                        </ion-select>
                      </ion-item>
                      <ion-item class="item">
                        <ion-label position="stacked">Conditions de paiement</ion-label>
                        <ion-select class="select-input-modal" value="paiement">
                          <ion-select-option value="reception">Payable a la reception</ion-select-option>
                          <ion-select-option value="findumois">Echeance a la fin du mois</ion-select-option>
                          <ion-select-option value="findumoisp">Echeance a la fin du mois prochain</ion-select-option>
                          <ion-select-option value="peronnalise">Personnalise</ion-select-option>
                        </ion-select>
                      </ion-item>
                    </ion-list>
                  </div>
                </ion-accordion>
              </ion-accordion-group>
              <!-- Remarques -->
              <ion-accordion-group class="add-client-sections">
                <ion-accordion value="remarks">
                  <ion-item slot="header" class="accordion-header">
                    <ion-icon :icon="documentText" slot="start"></ion-icon>
                    <ion-label>Remarques</ion-label>
                  </ion-item>
                  <div slot="content" class="accordion-content">
                    <ion-list>
                      <ion-item class="item">
                        <ion-label position="stacked">Remarques</ion-label>
                        <ion-textarea class="in-cadre-in-modal" v-model="supplier.remarks"></ion-textarea>
                      </ion-item>
                    </ion-list>
                  </div>
                </ion-accordion>
              </ion-accordion-group>
              <!-- Adresse de facturation -->
              <ion-accordion-group class="add-client-sections">
                <ion-accordion value="billingAddress">
                  <ion-item slot="header" class="accordion-header">
                    <ion-icon :icon="home" slot="start"></ion-icon>
                    <ion-label>Adresse de facturation</ion-label>
                  </ion-item>
                  <div slot="content" class="accordion-content">
                    <ion-list>
                      <ion-item class="item">
                        <ion-label position="stacked">Adresse</ion-label>
                        <ion-input class="in-cadre-in-modal" v-model="supplier.billingAddress.address"></ion-input>
                      </ion-item>
                      <ion-item class="item">
                        <ion-label position="stacked">Gouvernorat</ion-label>
                        <ion-input class="in-cadre-in-modal" v-model="supplier.billingAddress.governorate"></ion-input>
                      </ion-item>
                      <ion-item class="item">
                        <ion-label position="stacked">Code postal</ion-label>
                        <ion-input class="in-cadre-in-modal" v-model="supplier.billingAddress.postalCode"></ion-input>
                      </ion-item>
                      <ion-item class="item">
                        <ion-label position="stacked">Pays</ion-label>
                        <ion-select class="select-input-modal" value="Tunisie">
                          <ion-select-option value="Tunisie">Tunisie</ion-select-option>
                          <ion-select-option value="France">France</ion-select-option>
                        </ion-select>
                      </ion-item>
                    </ion-list>
                  </div>
                </ion-accordion>
              </ion-accordion-group>
              <!-- Adresse de livraison -->
              <ion-accordion-group class="add-client-sections">
                <ion-accordion value="deliveryAddress">
                  <ion-item slot="header" class="accordion-header">
                    <ion-icon :icon="location" slot="start"></ion-icon>
                    <ion-label>Adresse de livraison</ion-label>
                  </ion-item>
                  <div slot="content" class="accordion-content">
                    <ion-list>
                      <ion-item class="item">
                        <ion-label position="stacked">Adresse</ion-label>
                        <ion-input class="in-cadre-in-modal" v-model="supplier.deliveryAddress.address"></ion-input>
                      </ion-item>
                      <ion-item class="item">
                        <ion-label position="stacked">Gouvernorat</ion-label>
                        <ion-input class="in-cadre-in-modal" v-model="supplier.deliveryAddress.governorate"></ion-input>
                      </ion-item>
                      <ion-item class="item">
                        <ion-label position="stacked">Code postal</ion-label>
                        <ion-input class="in-cadre-in-modal" v-model="supplier.deliveryAddress.postalCode"></ion-input>
                      </ion-item>
                      <ion-item class="item">
                        <ion-label position="stacked">Pays</ion-label>
                        <ion-select class="select-input-modal" value="Tunisie">
                          <ion-select-option value="Tunisie">Tunisie</ion-select-option>
                          <ion-select-option value="France">France</ion-select-option>
                        </ion-select>
                      </ion-item>
                    </ion-list>
                  </div>
                </ion-accordion>
              </ion-accordion-group>
              <!-- Boutons d'action -->
              <div class="add-client-modal-actions">
                <ion-button color="danger" @click="closeClientModal">Fermer</ion-button>
                <ion-button color="primary" type="submit" class="submit-button">Ajouter</ion-button>
              </div>
            </form>
          </div>
        </ion-content>
      </ion-modal>
      <!-- Add the Modal for New  Article -->
      <ion-modal :isOpen="isArticleModalOpen" @didDismiss="closeArticleModal" class="add-article-model">
        <ion-header>
          <ion-toolbar>
            <ion-title>Add items in bulk</ion-title>
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
              <span class="search-label">Search:</span>
              <ion-input v-model="searchQuery" placeholder="Search..." class="search-input"></ion-input>
            </div>
          </ion-item>
          <ion-grid>
            <ion-row class="table-header">
              <ion-col>Titre</ion-col>
              <ion-col>Prix</ion-col>
              <ion-col>Quantité</ion-col>
              <ion-col class="action-title">Action</ion-col>
            </ion-row>
            <ion-row v-for="article in paginatedArticles" :key="article.id" class="table-row">
              <ion-col class="articles">{{ article.title }}</ion-col>
              <ion-col class="prices">{{ article.price }} TND</ion-col>
              <ion-col class="quantity-col">
                <div class="quantity-box">{{ article.quantity }}</div>
              </ion-col>              
              <ion-col>
                <ion-button class="add-article-model-action-button" @click="toggleSelection(article.id)">
                  <ion-icon :icon="selectedArticles.includes(article.id) ? checkmarkCircleOutline : addOutline"></ion-icon>
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
            <ion-button color="primary" @click="addArticles">Ajouter</ion-button>
          </div>
        </ion-content>
      </ion-modal>

      <!-- Add the Modal for New item -->
      <ion-modal :isOpen="isNewItemModalOpen" @didDismiss="closeNewItemModal" class="newitem-modal">
        <ion-header>
          <ion-toolbar>
            <ion-title>New item</ion-title>
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
                    <ion-label>General Information</ion-label>
                  </ion-item>
                  <div slot="content" class="accordion-content">
                    <ion-list>
                      <ion-item class="item">
                        <ion-label position="stacked">Title</ion-label>
                        <ion-input class="in-cadre-in-modal"></ion-input>
                      </ion-item>
                      <ion-item class="item">
                        <ion-label position="stacked">Reference</ion-label>
                        <ion-input class="in-cadre-in-modal"></ion-input>
                      </ion-item>
                      <ion-item class="item">
                        <ion-label position="stacked">Description</ion-label>
                        <ion-textarea class="in-cadre-in-modal"></ion-textarea>
                      </ion-item>
                      <ion-item class="item">
                        <ion-label position="stacked">Tax</ion-label>
                        <ion-select class="select-input-modal" value="0%">
                          <ion-select-option value="0%">0%</ion-select-option>
                          <ion-select-option value="FODEC(1%)">FODEC (1%)</ion-select-option>
                          <ion-select-option value="TVA(19%)">TVA (19%)</ion-select-option>
                        </ion-select>
                      </ion-item>
                      <ion-item class="item">
                        <ion-label position="stacked">Unity</ion-label>
                        <ion-select class="select-input-modal" value="Box">
                          <ion-select-option value="Box">Box</ion-select-option>
                          <ion-select-option value="Cm">Cm</ion-select-option>
                          <ion-select-option value="Kg">Kg</ion-select-option>
                          <ion-select-option value="G">G</ion-select-option>
                          <ion-select-option value="Km">Km</ion-select-option>
                          <ion-select-option value="M">M</ion-select-option>
                          <ion-select-option value="L">L</ion-select-option>
                          <ion-select-option value="J/h">J/h</ion-select-option>
                        </ion-select>
                      </ion-item>
                      <ion-item class="item">
                        <ion-label position="stacked">Category</ion-label>
                        <ion-select class="select-input-modal" value="None">
                          <ion-select-option value="None">None</ion-select-option>
                        </ion-select>
                      </ion-item>
                      <ion-item class="item">
                        <ion-label position="stacked">Brand</ion-label>
                        <ion-select class="select-input-modal" value="None">
                          <ion-select-option value="None">None</ion-select-option>
                        </ion-select>
                      </ion-item>
                    </ion-list>
                    <ion-list>
                      <!-- First Group: Item Destination -->
                      <ion-radio-group class="radio-buttons-new-item-modal" v-model="itemDestination">
                        <ion-label>This item is destined for</ion-label>
                          <ion-item v-for="option in destinationOptions" :key="option.value">
                            <div class="radio-items-newitem-model">
                              <ion-radio slot="start" :value="option.value"></ion-radio>
                              <ion-label>{{ option.label }}</ion-label>
                            </div>
                          </ion-item>
                      </ion-radio-group>
                      <!-- Second Group: Item Type -->
                      <ion-radio-group class="radio-buttons-new-item-modal" v-model="itemType">
                        <ion-label>Item type</ion-label>
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
                    <ion-label>Prices Lists</ion-label>
                  </ion-item>
                  <div slot="content" class="accordion-content">
                    <ion-list>
                      <ion-item class="item">
                        <ion-label position="stacked">Default selling rate</ion-label>
                        <ion-input class="in-cadre-in-modal" type="number" value="0"></ion-input>
                      </ion-item>
                      <ion-item class="item">
                        <ion-label position="stacked">Default buying rate</ion-label>
                        <ion-input class="in-cadre-in-modal" type="number" value="0"></ion-input>
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
import { ref, computed } from 'vue';
import { 
  trashOutline, closeOutline, 
  person, briefcase, documentText, home, location, addOutline, checkmarkCircleOutline,  chevronBackOutline, chevronForwardOutline
} from 'ionicons/icons';

const articles = ref([
  {
    id: 1,
    title: 'Title',
    description: '',
    quantity: 1,
    unitPrice: 0,
    discount: 0,
    discountType: '%',
    taxes: [{ id: 1, value: '0%' }],
    price: 0.0,
  },
]);
const selectedTax = ref("0%");
const isCategoryModalOpen = ref(false);
const newCategory = ref('');
const isClientModalOpen = ref(false);
const newClient = ref('');
const isArticleModalOpen = ref(false);
const newArticle = ref('');
const selectedArticles = ref([]);
const searchQuery = ref('');
const currentPage = ref(1);
const articlesPerPage = 5;
const availableArticles = ref([
  { id: 2, title: 'Article 1', price: 10, quantity: 1 },
  { id: 3, title: 'Article 2', price: 15, quantity: 1 },
  { id: 4, title: 'Article 3', price: 20, quantity: 1 },
  { id: 5, title: 'Article 4', price: 25, quantity: 1 },
  { id: 6, title: 'Article 5', price: 30, quantity: 1 },
  { id: 7, title: 'Article 6', price: 35, quantity: 1 },
  { id: 8, title: 'Article 7', price: 40, quantity: 1 },
]);
const destinationOptions = [
  { value: "selling", label: "Selling" },
  { value: "buying", label: "Buying" },
  { value: "both", label: "Both" }
];
const typeOptions = [
  { value: "product", label: "Product" },
  { value: "service", label: "Service" }
];
const isRecurrent = ref(false);
const startDate = ref("");
const endDate = ref("");
const frequency = ref("");
const notes = ref("");
const isNewItemModalOpen = ref(false);
const isNewItemPopoverOpen = ref(false); 
const inputValue = ref("");
const selectedArticle = ref(null);
const isModalOpen = ref(false);

const toggleRecurrent = (event) => {
  isRecurrent.value = event.detail.checked;
  console.log("Toggle changed:", isRecurrent.value);
};
const handleAction = async(action) => {
  console.log(`Action selected: ${action}`);
  if (actionPopover.value) {
    await actionPopover.value.dismiss();
  }
};
function openModal(article) {
  selectedArticle.value = article; 
  isModalOpen.value = true;
}
function closeModal() {
  isModalOpen.value = false;
  selectedArticle.value = null;
}
// Categories Modal Handling
const openCategoryModal = () => {
  isCategoryModalOpen.value = true;
};
const closeCategoryModal = () => {
  isCategoryModalOpen.value = false;
  newCategory.value = ''; 
};
const addCategory = () => {
  if (newCategory.value.trim()) {
    console.log(`New category added: ${newCategory.value}`);
  }
  closeCategoryModal();
};
// Articles Handling
const addArticle = () => {
  articles.value.push({
    id: articles.value.length + 1,
    title: 'Title',
    description: '',
    quantity: 1,
    unitPrice: 0,
    discount: 0,
    discountType: '%',
    taxes: [{ id: 1, value: '0%' }],
    price: 0.0,
  });
};
const removeArticle = (articleId) => {
  if (articles.value.length > 1) {
    articles.value = articles.value.filter((article) => article.id !== articleId);
  }
};
// Taxes Handling
const addTax = (articleId) => {
  const article = articles.value.find((a) => a.id === articleId);
  if (article) {
    const newTaxId = article.taxes.length + 1;
    article.taxes.push({ id: newTaxId, value: '0%' });
  }
};
const removeTax = (articleId, taxId) => {
  const article = articles.value.find((a) => a.id === articleId);
  if (article && article.taxes.length > 1) { 
    article.taxes = article.taxes.filter((tax) => tax.id !== taxId);
  }
};
// Client Modal Handling
const openClientModal = () => {
  isClientModalOpen.value = true;
};
const closeClientModal = () => {
  isClientModalOpen.value = false;
  newClient.value = ''; 
};
const addClient = () => {
  if (newClient.value.trim()) {
    console.log(`New client added: ${newClient.value}`);
  }
  closeClientModal();
};
// Article Modal Handling
const openArticleModal = () => {
  console.log("Available Articles:", availableArticles.value);

  isArticleModalOpen.value = true;
};
const closeArticleModal = () => {
  isArticleModalOpen.value = false;
  newArticle.value = ''; 
};
const toggleSelection = (articleId) => {
  const index = selectedArticles.value.indexOf(articleId);
  if (index !== -1) {
    selectedArticles.value.splice(index, 1); // Remove if already selected
  } else {
    selectedArticles.value.push(articleId); // Add if not selected
  }
};
// Add Selected Articles to Main List
const addArticles = () => {
  if (selectedArticles.value.length > 0) {
    selectedArticles.value.forEach((articleId) => {
      const article = availableArticles.value.find(a => a.id === articleId);
      if (article) {
        articles.value.push({
          ...article,
          id: articles.value.length + 1, // Ensuring unique ID
        });
      }
    });
    selectedArticles.value = [];
    closeArticleModal();
  }
};
const totalPages = computed(() => Math.ceil(availableArticles.value.length / articlesPerPage));
const paginatedArticles = computed(() => {
  const start = (currentPage.value - 1) * articlesPerPage;
  return availableArticles.value.slice(start, start + articlesPerPage);
});
const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++;
  }
};
const prevPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--;
  }
};
const openNewItemPopover = () => {
    isNewItemPopoverOpen.value = true; // Show the popover when clicking the input
};
const openNewItemModal = () => {
  isNewItemPopoverOpen.value = false; // Close popover
  isNewItemModalOpen.value = true; // Open modal
};

const closeNewItemModal = () => {
  isNewItemModalOpen.value = false;
};
// Supplier Form Data
const supplier = ref({
  title: '',
  firstName: '',
  lastName: '',
  company: '',
  displayName: '',
  reference: '',
  email: '',
  phone: '',
  website: '',
  professionalInfo: {
    type: 'entreprise', // Default to 'entreprise'
    priceGrid: '',
    taxIdentificationNumber: '',
    identityDate: '', // Only used for 'Particulier'
    activity: '',
    agencyOrCommercialCompany: '',
    currency: 'Dinar(s) tunisien',
    paymentTerms: 'Payable à réception'
  },
  remarks: '',
  billingAddress: {
    address: '',
    governorate: '',
    postalCode: '',
    country: 'Tunisie'
  },
  deliveryAddress: {
    address: '',
    governorate: '',
    postalCode: '',
    country: 'Tunisie'
  }
});
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
.add-categorie{
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
.add-article-masse{
  --background: #27A2DB !important; 
  --color: #ffffff !important; 
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
  font-size: 20px;
}
.delete-articale-btn {
  --background: #27A2DB !important;
  --color: #ffffff !important; 
  width: 150px !important; 
  height: 40px !important;
  font-size: 20px;
  border-radius: 10px !important;
  --padding-start: 5px !important; 
  --padding-end: 5px !important;
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
  flex-direction: row !important;
  align-items: center !important;
  gap:90%;
}
.add-files{
  display: flex !important;
  flex-direction: row !important;
  align-items: center !important;
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
}
.barcode-qr {
  --background: #27A2DB !important;
  --color: #ffffff !important;
}
.add-file {
  --background: #27A2DB !important;
  --color: #ffffff !important;
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
.add-category-model {
  --width: 90%;
  --max-width: 400px;
  --height: 200px;
  --border-radius: 10px;
  --background: #ffffff;
  --box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}
.add-category-model ion-header {
  --background: #ffffff;
  --color: #000000;
}
.add-category-model ion-content {
  --padding-start: 16px;
  --padding-end: 16px;
  --padding-top: 16px;
  --padding-bottom: 16px;
}
.add-category-model ion-item {
  --background: #ffffff;
  --padding-start: 0;
  --padding-end: 0;
}
.add-category-modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
}
.add-category-modal-actions ion-button {
  --border-radius: 8px;
  --padding-start: 20px;
  --padding-end: 20px;
  font-size: 16px;
  font-weight: bold;
}
.add-category-model ion-buttons ion-button {
  --color: #000000;
}
.add-client-model {
  --width: 90%;
  --max-width: 400px;
  --height: 75%;
  --border-radius: 10px;
  --background: #ffffff;
  --box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}
.add-client-model ion-header {
  --background: #ffffff;
  --color: #000000;
}
.add-client-model ion-content {
  --padding-start: 16px;
  --padding-end: 16px;
  --padding-top: 16px;
  --padding-bottom: 280px;
  overflow-y: auto;
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
.add-client-sections{
  margin-bottom: 30px;
}
.add-client-modal-actions {
  bottom: 0;
  background: #ffffff; 
  padding: 10px;
  display: flex;
  justify-content: space-between;
  border-top: 1px solid #ddd;
}
.add-client-modal-actions ion-button {
  --border-radius: 8px;
  --padding-start: 20px;
  --padding-end: 20px;
  font-size: 16px;
  font-weight: bold;
}
.radio-group1 {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 10px; 
}
.radio-group1 ion-label {
  font-weight: normal;
}
.ion-radio1 {
  --color: #ffffff !important; 
  --color-checked: #ffffff !important;
  border-radius: 50%;
}
.ion-radio1::part(container) {
  width: 25px !important; 
  height: 25px !important; 
  background-color: #000000 !important; 
  border-radius: 50% !important; 
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
    --width: 190px !important;
    --height: 60px !important;
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
    --border-radius: 8px;
    --inner-padding-end: 10px;
    border: 1px solid #ddd;
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
    flex: 90%;
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
  .custom-item {
    display: flex !important; 
    flex-direction: row !important;
    justify-content: space-between !important;
    align-items: center !important; 
    width: 100%; 
    padding: 5px 0; 
  }
  .custom-label {
    text-align: left;
    margin-right: 10px; 
    white-space: nowrap; 
  }
  .custom-content {
    text-align: right; 
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
    --height: 700px;
    --border-radius: 10px;
    --background: #ffffff;
    --box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
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
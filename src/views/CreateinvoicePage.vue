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
        <p class="company">{{ companyName }}</p>
        <ion-popover ref="actionPopover" trigger="action-trigger" trigger-action="click">
          <ion-content>
            <ion-list class="actions">
              <ion-item button detail="false" @click="handleAction('brouillon')">Draft</ion-item>
              <ion-item button detail="false" @click="handleAction('valider')">Valid</ion-item>
            </ion-list>
          </ion-content>
        </ion-popover>
      </div>     

      <!-- ADD VOICE INPUT COMPONENT HERE -->
      <VoiceInputPage
        v-if="true"
        :invoice-form="invoiceForm"
        :clients="clients"
        :categories="categories"
        :deadlines="deadlines"
        :banks="banks" 
        :django-endpoint="voiceEndpoint"
        :show-help="toggleVoiceHelp"
        @form-updated="handleVoiceFormUpdate"
        @error="handleVoiceError"
      />

      <!-- Voice Help Toggle Button -->
      <ion-button 
        v-if="isVoiceEnabled"
        fill="clear" 
        size="small" 
        @click="toggleVoiceHelp = !toggleVoiceHelp"
        class="voice-help-toggle">
        <ion-icon :icon="helpCircleOutline"></ion-icon>
        Voice Help
      </ion-button>

      <!-- PDF Upload Button (add after voice help button) -->
      <ion-button 
        fill="clear" 
        size="small" 
        @click="openPdfUpload"
        class="pdf-upload-toggle">
        <ion-icon :icon="documentTextOutline"></ion-icon>
        Upload PDF
      </ion-button>

      <!-- Hidden file input -->
      <input
        type="file"
        ref="pdfFileInputRef"
        accept=".pdf"
        style="display: none"
        @change="handlePdfUpload"
      />
      <div v-if="isProcessingPdf" class="pdf-processing-indicator">
        <ion-spinner name="circular"></ion-spinner>
        <span>Processing PDF...</span>
      </div>

      <div v-if="pdfProcessingError" class="pdf-error-message">
        <ion-text color="danger">{{ pdfProcessingError }}</ion-text>
      </div>

      <div class="content-wrapper">
        <ion-accordion-group class="all">         
          <ion-accordion value="invoiceDetails">
            <ion-item class="aTitle" slot="header">
              <ion-icon :icon="createOutline"></ion-icon>
              <ion-label>Invoice Details</ion-label>
            </ion-item>
            <div slot="content" class="accordion-content">
              <ion-item>
                <ion-label>Categorie</ion-label>
                <div class="categories">
                  <ion-select v-model="invoiceForm.category" class="select-input">
                    <ion-select-option
                      v-for="cat in categories"
                      :key="cat.hashed_id"
                      :value="cat.hashed_id">
                      {{ cat.title }}
                    </ion-select-option>
                  </ion-select>
                </div>
              </ion-item>
              <ion-item>
                <ion-label>Date</ion-label>
                <ion-input class="date-input" type="date" v-model="invoiceForm.date"></ion-input>
              </ion-item>
              <ion-item>
                <ion-label>Due Date</ion-label>
                <ion-input class="select-input" type="date" v-model="invoiceForm.due"></ion-input>
              </ion-item>
              <ion-item>
                <ion-label>Condition</ion-label>
                <ion-select v-model="invoiceForm.deadline" class="select-input">
                  <ion-select-option
                    v-for="dead in deadlines"
                    :key="dead.hashed_id"
                    :value="dead.hashed_id">
                    {{ dead.title }}
                  </ion-select-option>
                </ion-select>
              </ion-item>
              <ion-item>
                <ion-label>Object</ion-label>
                <ion-input v-model="invoiceForm.object" class="in-cadre" placeholder="Enter object"></ion-input>
              </ion-item>              
              <ion-item>
                <ion-label>Invoice N°</ion-label>
                <div class="newpayment-paidamount">
                  <div class="currency-symbol">INV</div>
                  <div class="currency-symbol">{{ currentYear }}</div>
                  <ion-input 
                    v-model="invoiceForm.invoice_number"
                    class="newpayment-paid-input"
                    readonly>
                  </ion-input>
                </div>
              </ion-item> 
              <ion-item>
                <ion-label>Client</ion-label>
                <div class="clients">
                    <ion-select v-model="invoiceForm.client_id" @update:modelValue="onClientSelected" class="select-input">
                    <ion-select-option v-for="client in clients" :key="client.hashed_id" :value="client.hashed_id">{{ client.display_name }}</ion-select-option>
                  </ion-select>
                </div>
              </ion-item>
              <ion-item>
                <ion-label>Reference N°</ion-label>
                <ion-input v-model="invoiceForm.referenceNumber" class="in-cadre" placeholder="Enter reference number"></ion-input>
              </ion-item>
              <ion-item v-if="deliveryAddress">
                <ion-label>Delivary adress</ion-label>
                <ion-text>{{ deliveryAddress?.address }}</ion-text>
                <ion-text>{{ deliveryAddress?.country_title }}</ion-text>
              </ion-item>
              <ion-item v-if="billingAddress">
                <ion-label>Billing adress</ion-label>
                <ion-text>{{ billingAddress?.address }}</ion-text>
                <ion-text>{{ billingAddress?.country_title }}</ion-text>
              </ion-item>
              

              <ion-button  class="add-article-masse" @click="openArticleModal">Bulk add items</ion-button>
              <ion-button class="add-article" @click="addArticleForm">Add an article</ion-button>
              <div v-for="article in invoiceForm.items" :key="article.id" class="article-list-item">
                <ion-item @click="openArticleDetailsModal(article)" button detail="false">
                  <div class="article-container">
                    <div  class="article-item">
                      <ion-label class="article-label">Article:</ion-label>
                      <span class="article_title">{{ article.title }}</span>
                    </div>
                    <ion-button @click.stop="removeArticle(article.id)" class="delete-articale-btn"><ion-icon :icon="trashOutline"></ion-icon></ion-button>
                  </div>
                </ion-item>
              </div>
              <p>Items prices are :</p>
              <ion-radio-group class="radio-group" v-model="invoiceForm.tax_type">
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
                <ion-textarea class="in-cadre" placeholder="To pay upon reception" v-model="invoiceForm.generalTerms"></ion-textarea>
              </ion-item>
              <ion-item v-if="invoiceForm.generalTerms.trim() !== ''">
                <ion-label>Use in future</ion-label>
                <ion-toggle
                  :checked="invoiceForm.use_conditions === 1"
                  @update:modelValue="invoiceForm.use_conditions = $event ? 1 : 0"
                ></ion-toggle>
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
                    <ion-label class="custom-label">Subtotal</ion-label>
                    <ion-text class="custom-content">{{ formatPrice(calculateSubtotal()) }} {{ selectedCurrency?.symbol  }}</ion-text>
                  </div>
                </ion-item>
                <ion-item class="custom-item">
                  <div class="row">
                    <ion-label class="custom-label">Discount</ion-label>
                    <div class="custom-input-wrapper">
                      <ion-input class="custom-content" type="number" v-model="invoiceForm.totals.discount" @input="updateTotals"></ion-input>
                    </div>
                  </div>
                </ion-item>
                <ion-item class="custom-item" v-for="item in invoiceForm.items" :key="item.id">
                  <ion-list v-if="item.taxes && item.taxes.length">
                    <ion-item
                      v-for="tax in item.taxes"
                      :key="tax.hashed_id"
                      lines="none">
                      <ion-label class="custom-label">
                        <strong>{{ tax.title }}</strong> ({{ tax.rate }}%)
                      </ion-label>
                      <ion-note slot="end" class="custom-content">
                        {{ formatPrice(getTaxAmount(item, tax)) }}
                      </ion-note>
                    </ion-item>
                  </ion-list>
                </ion-item>
                <ion-item class="custom-item" v-if="invoiceForm.additionalEntries.tva === 1">
                  <div class="row">
                    <ion-label class="custom-label">TVA (19%)</ion-label>
                    <div class="input-wrapper">
                      <ion-input class="custom-content">{{ formatPrice(taxValues.tva) }}</ion-input>
                    </div>
                  </div>
                </ion-item>
                <ion-item class="custom-item" v-if="invoiceForm.additionalEntries.fiscalStamp === 1">
                  <div class="row">
                    <ion-label class="custom-label">Timbre Fiscal</ion-label>
                    <div class="input-wrapper">
                    <ion-input class="custom-content">{{ formatPrice(taxValues.fiscalStamp) }}</ion-input>
                  </div>
                </div>
                </ion-item>
                <ion-item class="custom-item" v-if="invoiceForm.additionalEntries.exemple === 1">
                  <div class="row">
                    <ion-label class="custom-label">Exemple</ion-label>
                    <div class="input-wrapper">
                      <ion-input class="custom-content">{{ formatPrice(taxValues.exemple) }}</ion-input>
                    </div>
                  </div>
                </ion-item>
                <ion-item class="custom-item">
                  <div class="row">
                    <ion-label class="custom-label">Total</ion-label>
                    <ion-text class="custom-content">{{ formatPrice(calculateTotal()) }} {{ selectedCurrency?.symbol  }}</ion-text>
                  </div>
                </ion-item>
              </div>
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
                <ion-label>Watermark</ion-label>
                <ion-input class="in-cadre" v-model="invoiceForm.watermark"></ion-input>
              </ion-item>
              <ion-item>
                  <ion-label>PDF language</ion-label>
                    <ion-select class="select-input" v-model="invoiceForm.language">
                      <ion-select-option value="frensh">frensh</ion-select-option>
                      <ion-select-option value="arabic">arabic</ion-select-option>
                      <ion-select-option value="english">english</ion-select-option>
                    </ion-select>
                </ion-item>
                <ion-item lines="none" class="toggle-row">
                  <div class="a-toggle">
                    <ion-label class="toggle-label">Items description</ion-label>
                    <ion-toggle v-model="invoiceForm.show_description"
                    @update:modelValue="invoiceForm.show_description = $event ? 1 : 0"></ion-toggle>
                  </div>
                </ion-item>
                <ion-item lines="none" class="toggle-row">
                  <div class="a-toggle">
                    <ion-label class="toggle-label">Items unity</ion-label>
                    <ion-toggle v-model="invoiceForm.showArticleUnit"
                    @update:modelValue="invoiceForm.showArticleUnit = $event ? 1 : 0"></ion-toggle>
                  </div>
                </ion-item>
                <ion-item lines="none" class="toggle-row">
                  <div class="a-toggle">
                    <ion-label class="toggle-label">Items TTC prices</ion-label>
                    <ion-toggle v-model="invoiceForm.showArticleTTCPrices"
                    @update:modelValue="invoiceForm.showArticleTTCPrices = $event ? 1 : 0"></ion-toggle>
                  </div>
                </ion-item>
                <ion-item lines="none" class="toggle-row">
                  <div class="a-toggle">
                    <ion-label class="toggle-label">Items pictures</ion-label>
                    <ion-toggle v-model="invoiceForm.show_pictures"
                    @update:modelValue="invoiceForm.show_pictures = $event ? 1 : 0"></ion-toggle>
                  </div>
                </ion-item>
                <ion-item lines="none" class="toggle-row">
                  <div class="a-toggle">
                    <ion-label class="toggle-label">Billing address</ion-label>
                    <ion-toggle  v-model="invoiceForm.show_billing"
                    @update:modelValue="invoiceForm.show_billing = $event ? 1 : 0"></ion-toggle>
                  </div>
                </ion-item>
                <ion-item lines="none" class="toggle-row">
                  <div class="a-toggle">
                    <ion-label class="toggle-label">Delivery address</ion-label>
                    <ion-toggle v-model="invoiceForm.show_delivery"
                    @update:modelValue="invoiceForm.show_delivery = $event ? 1 : 0"></ion-toggle>
                  </div>
                </ion-item>
                <ion-item lines="none" class="toggle-row">
                  <div class="a-toggle">
                    <ion-label class="toggle-label">General conditions</ion-label>
                    <ion-toggle v-model="invoiceForm.show_conditions"
                    @update:modelValue="invoiceForm.show_conditions = $event ? 1 : 0"></ion-toggle>
                  </div>
                </ion-item>
                <ion-item lines="none" class="toggle-row">               
                  <div class="a-toggle">
                    <ion-label class="toggle-label">Stamp & Signature</ion-label>
                    <ion-toggle v-model="invoiceForm.show_stamp"
                    @update:modelValue="invoiceForm.show_stamp = $event ? 1 : 0"></ion-toggle>
                  </div>
                </ion-item>
                <ion-item lines="none" class="toggle-row">
                  <div class="a-toggle">
                    <ion-label class="toggle-label">Bank details</ion-label>
                    <ion-toggle v-model="invoiceForm.show_bank"
                    @update:modelValue="invoiceForm.show_bank = $event ? 1 : 0"></ion-toggle>
                  </div>
                </ion-item>
                <ion-item v-if="invoiceForm.show_bank === 1">
                  <ion-select v-model="invoiceForm.selected_bank" class="select-input">
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

          <ion-accordion value="devise" v-if="selectedCurrency?.iso_code==='EUR'">
            <ion-item class="aTitle" slot="header">
              <ion-icon :icon="chatbubbleOutline"></ion-icon>
              <ion-label>Currency</ion-label>
            </ion-item>
            <div slot="content" class="accordion-content">
              <ion-item>
                <ion-label>Currency rate (EUR to TND)</ion-label>
                <div class="input-button-container">
                  <div class="newpayment-paidamount">
                    <ion-input 
                      v-model.number="invoiceForm.currency_rate"
                      placeholder="1"
                      class="newpayment-paid-input">
                    </ion-input>
                  </div>
                  <ion-button class="reload-btn" @click="reloadCurrencyRate">
                    <ion-icon :icon="refreshOutline"></ion-icon>
                  </ion-button>
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
                  <ion-toggle
                    v-model="invoiceForm.additionalEntries.tva"
                    @update:modelValue="invoiceForm.additionalEntries.tva = $event ? 1 : 0; calculateTotal()"
                    />                    
                </div>
              </ion-item>
              <ion-item lines="none" class="toggle-row">
                <div class="a-toggle">
                  <ion-label class="toggle-label">Timbre Fiscal</ion-label>
                  <ion-toggle
                    v-model="invoiceForm.additionalEntries.fiscalStamp"
                    @update:modelValue="invoiceForm.additionalEntries.fiscalStamp = $event ? 1 : 0; calculateTotal()"
                  />
                </div>
              </ion-item>
              <ion-item lines="none" class="toggle-row">
                <div class="a-toggle">
                  <ion-label class="toggle-label">Exemple</ion-label>
                  <ion-toggle
                    v-model="invoiceForm.additionalEntries.exemple"
                    @update:modelValue="invoiceForm.additionalEntries.exemple = $event ? 1 : 0; calculateTotal()"
                  />
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
                  <ion-toggle :checked="invoiceForm.recurrence === 2"
                   @update:modelValue="(val) => invoiceForm.recurrence = val ? 2 : 1"
                 ></ion-toggle>
                </div>
              </ion-item>
              <div v-if="invoiceForm.recurrence === 2" class="recurrence-inputs">
                <ion-item>
                  <ion-label>Start Date</ion-label>
                  <ion-input class="date-input" type="date" v-model="invoiceForm.recurrence_start"></ion-input>
                </ion-item>
                <ion-item>
                  <ion-label>End Date</ion-label>
                  <ion-input class="date-input" type="date" v-model="invoiceForm.recurrence_end"></ion-input>
                </ion-item>
                <ion-item>
                  <ion-label>Every</ion-label>
                  <ion-input class="in-cadre" type="text" value="1" v-model.number="invoiceForm.recurrence_each"></ion-input>
                </ion-item>
                <ion-item>
                  <ion-label>Frequency</ion-label>
                  <ion-select class="select-input" v-model="invoiceForm.recurrence_type">
                    <ion-select-option :value="1">Daily</ion-select-option>
                    <ion-select-option :value="2">Weekly</ion-select-option>
                    <ion-select-option :value="3">Monthly</ion-select-option>
                    <ion-select-option :value="4">Yearly</ion-select-option>
                  </ion-select>
                </ion-item>
              </div>
            </div>
          </ion-accordion>
          <!-- remarques Section -->
          <ion-accordion value="remarque">
            <ion-item class="aTitle" slot="header">
              <ion-icon :icon="chatbubbleOutline"></ion-icon>
              <ion-label>Remarks</ion-label>
            </ion-item>
            <div slot="content" class="accordion-content">
              <ion-textarea placeholder="Enter any remarks" v-model="invoiceForm.remarks"></ion-textarea>
            </div>
          </ion-accordion>
        </ion-accordion-group>
        <div class="add-invoice-container">
          <ion-button @click="validateAndSubmit" class="add-invoice">Add</ion-button>
        </div>
      </div>

      <!-- Article Details Modal -->
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
            <ion-textarea class="in-cadre-in-modal" v-model="selectedArticle.description" placeholder="Enter description"></ion-textarea>
          </ion-item>
          <ion-item>
            <ion-label>Quantity</ion-label>
            <ion-input class="in-cadre-in-modal" type="number" v-model.number="selectedArticle.quantity"></ion-input>
          </ion-item>
          <ion-item>
            <ion-label>P.U.</ion-label>
            <ion-input class="in-cadre-in-modal" type="number" v-model.number="selectedArticle.unitPrice"></ion-input>
          </ion-item>
          <ion-item>
            <ion-label>Discount</ion-label>
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
          </ion-item>
          <ion-item>
            <ion-label>Price</ion-label>
            <ion-input class="in-cadre-in-modal" type="number" :value="selectedArticle.price" readonly></ion-input>
          </ion-item>

          <ion-item>
            <ion-label>Accounting Journal</ion-label>
            <ion-select 
              class="select-input" 
              v-model="selectedArticle.journal_id">
              <ion-select-option 
                v-for="journal in flattenedJournals"
                :key="journal.id"
                :value="journal.id.toString()">
                {{ journal.label }}
                {{ journal.id.toString() === (selectedJournalId?.toString() || '') ? ' (Default)' : '' }}
              </ion-select-option>
            </ion-select>
          </ion-item>

          <div class="add-article-modal-actions">
            <ion-button color="danger" @click="closeArticleDetailsModal">Close</ion-button>
            <ion-button color="primary" @click="saveArticle">{{ isNewItem ? 'Create' : 'Save' }}</ion-button>
          </div>
        </ion-content>
      </ion-modal>

      <!-- Add the Modal for New Article -->
      <ion-modal :is-open="isArticleModalOpen" @didDismiss="closeArticleModal" class="add-article-model">
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
              <ion-col>Title</ion-col>
              <ion-col>Price</ion-col>
              <ion-col>Quantity</ion-col>
              <ion-col class="action-title">Action</ion-col>
            </ion-row>
            <ion-row v-for="article in paginatedArticles" :key="article.id" class="table-row">
              <ion-col class="articles">{{ article.title }}</ion-col>
              <ion-col class="prices">{{ article.unitPrice  }} TND</ion-col>
              <ion-col class="quantity-col">
                <div class="quantity-box">{{ article.quantity }}</div>
              </ion-col>              
              <ion-col>
                <ion-button class="add-article-model-action-button" @click="itemSelection(article.id)">
                  <ion-icon :icon="Items.includes(article.id) ? checkmarkCircleOutline : addOutline"></ion-icon>
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
            <ion-button color="danger" @click="closeArticleModal">Close</ion-button>
            <ion-button color="primary" @click="addSelectedItems">Add</ion-button>
          </div>
        </ion-content>
      </ion-modal>

      <!-- Add the Modal for New item -->
      <ion-modal :is-open="isNewItemModalOpen" @didDismiss="closeNewItemModal" class="newitem-modal">
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
                  <ion-item lines="none" slot="header" class="accordion-header-newitem">
                    <ion-icon :icon="location" slot="start"></ion-icon>
                    <ion-label>General Information</ion-label>
                  </ion-item>
                  <div slot="content" class="accordion-content">
                    <ion-list>
                      <ion-item lines="none">
                        <ion-label position="stacked">Title</ion-label>
                        <ion-input v-model="newItemForm.title" class="in-cadre-in-modal"></ion-input>
                      </ion-item>
                      <ion-item lines="none">
                        <ion-label position="stacked">Reference</ion-label>
                        <ion-input v-model="newItemForm.reference" class="in-cadre-in-modal"></ion-input>
                      </ion-item>
                      <ion-item lines="none">
                        <ion-label position="stacked">Description</ion-label>
                        <ion-textarea v-model="newItemForm.description" class="in-cadre-in-modal"></ion-textarea>
                      </ion-item>
                      <ion-item lines="none">
                        <ion-label position="stacked">Tax</ion-label>
                        <ion-select v-model="newItemForm.taxe" class="select-input-modal" value="0%">
                          <ion-select-option value="0%">0%</ion-select-option>
                          <ion-select-option value="FODEC(1%)">FODEC (1%)</ion-select-option>
                          <ion-select-option value="TVA(19%)">TVA (19%)</ion-select-option>
                        </ion-select>
                      </ion-item>
                      <ion-item lines="none">
                        <ion-label position="stacked">Unity</ion-label>
                        <ion-select v-model="newItemForm.unity" class="select-input-modal">
                          <ion-select-option v-for="u in itemUnities" :key="u.hashed_id" :value="u.hashed_id">
                            {{ u.title }}
                          </ion-select-option>
                        </ion-select>
                      </ion-item>

                      <ion-item lines="none">
                        <ion-label position="stacked">Category</ion-label>
                        <ion-select v-model="newItemForm.category" class="select-input-modal">
                          <ion-select-option v-for="c in itemCategories" :key="c.hashed_id" :value="c.hashed_id">
                            {{ c.title }}
                          </ion-select-option>
                        </ion-select>
                      </ion-item>

                      <ion-item lines="none">
                        <ion-label position="stacked">Brand</ion-label>
                        <ion-select v-model="newItemForm.brand" class="select-input-modal">
                          <ion-select-option v-for="b in itemBrands" :key="b.hashed_id" :value="b.hashed_id">
                            {{ b.title }}
                          </ion-select-option>
                        </ion-select>
                      </ion-item>
                    </ion-list>
                    <ion-list>
                      <ion-radio-group class="radio-buttons-new-item-modal" v-model="itemDestination">
                        <ion-list-header>
                          <ion-label>This item is destined for</ion-label>
                        </ion-list-header>
                        <ion-item lines="none">
                          <ion-label>Selling</ion-label>
                          <ion-radio slot="end" :value="1"></ion-radio>
                        </ion-item>
                        <ion-item lines="none">
                          <ion-label>Buying</ion-label>
                          <ion-radio slot="end" :value="2"></ion-radio>
                        </ion-item>
                        <ion-item lines="none">
                          <ion-label>Both</ion-label>
                          <ion-radio slot="end" :value="3"></ion-radio>
                        </ion-item>
                      </ion-radio-group>
                      <ion-radio-group class="radio-buttons-new-item-modal" v-model="itemType">
                        <ion-list-header>
                          <ion-label>Item type</ion-label>
                        </ion-list-header>                        
                        <ion-item lines="none">
                            <ion-radio slot="end" :value="1"></ion-radio>
                            <ion-label>Product</ion-label>
                        </ion-item>
                        <ion-item lines="none">
                            <ion-radio slot="end" :value="2"></ion-radio>
                            <ion-label>Service</ion-label>
                        </ion-item>
                      </ion-radio-group>
                    </ion-list>
                  </div>
                </ion-accordion>
                <ion-accordion value="pricesLists">
                  <ion-item lines="none" slot="header" class="accordion-header-newitem">
                    <ion-icon :icon="location" slot="start"></ion-icon>
                    <ion-label>Prices Lists</ion-label>
                  </ion-item>
                  <div slot="content" class="accordion-content">
                    <ion-list>
                      <ion-item lines="none">
                        <ion-label position="stacked">Default selling rate</ion-label>
                        <ion-input  v-model="sellingRate" class="in-cadre-in-modal" type="number" value="0"></ion-input>
                      </ion-item>
                      <ion-item lines="none">
                        <ion-label position="stacked">Default buying rate</ion-label>
                        <ion-input  v-model="buyingRate" class="in-cadre-in-modal" type="number" value="0"></ion-input>
                      </ion-item>
                    </ion-list>
                  </div>
                </ion-accordion>
              </ion-accordion-group>
              <div class="add-article-modal-actions">
                <ion-button color="danger" @click="closeNewItemModal">Close</ion-button>
                <ion-button color="primary" @click="addNewItem">Add</ion-button>
              </div>
            </div>
        </ion-content>
      </ion-modal>

      <!-- PDF Preview Modal -->
      <ion-modal :is-open="isPdfPreviewModalOpen" @didDismiss="closePdfPreviewModal" class="pdf-preview-modal">
        <ion-header>
          <ion-toolbar>
            <ion-title>PDF Extraction Results</ion-title>
            <ion-buttons slot="end">
              <ion-button @click="closePdfPreviewModal">
                <ion-icon :icon="closeOutline"></ion-icon>
              </ion-button>
            </ion-buttons>
          </ion-toolbar>
        </ion-header>
        <ion-content class="ion-padding">
          <div v-if="pdfExtractedData">
            <h4>Extracted Information</h4>
            <ion-list>
              <ion-item v-if="pdfExtractedData.solde">
                <ion-label>Amount/Total</ion-label>
                <ion-text>{{ pdfExtractedData.solde }}</ion-text>
              </ion-item>
              <ion-item v-if="pdfExtractedData.invoice_number">
                <ion-label>Invoice Number</ion-label>
                <ion-text>{{ pdfExtractedData.invoice_number }}</ion-text>
              </ion-item>
              <ion-item v-if="pdfExtractedData.date">
                <ion-label>Date</ion-label>
                <ion-text>{{ pdfExtractedData.date }}</ion-text>
              </ion-item>
              <ion-item v-if="pdfExtractedData.due_date">
                <ion-label>Due Date</ion-label>
                <ion-text>{{ pdfExtractedData.due_date }}</ion-text>
              </ion-item>
              <ion-item v-if="pdfExtractedData.client_name">
                <ion-label>Client</ion-label>
                <ion-text>{{ pdfExtractedData.client_name }}</ion-text>
              </ion-item>
              <ion-item v-if="pdfExtractedData.reference_number">
                <ion-label>Reference Number</ion-label>
                <ion-text>{{ pdfExtractedData.reference_number }}</ion-text>
              </ion-item>
            </ion-list>
            
            <div class="ion-padding">
              <ion-button expand="block" @click="applyExtractedData">
                Apply to Form
              </ion-button>
            </div>
          </div>
          <div v-else>
            <ion-text color="medium">No data extracted from PDF</ion-text>
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
  IonTextarea, IonRadioGroup, IonRadio, IonText, IonToggle, IonCol, IonRow, IonGrid,
  IonSpinner, IonNote
} from '@ionic/vue';
import { 
  trashOutline, closeOutline, location, addOutline, checkmarkCircleOutline, 
  chevronBackOutline, chevronForwardOutline, createOutline, helpCircleOutline, 
  documentTextOutline, refreshOutline, calendarOutline, chatbubbleOutline
} from 'ionicons/icons';
import { watch } from 'vue';
import VoiceInputPage from './VoiceInputPage.vue';
import { useInvoiceController } from '@/controllers/CreateInvoiceController';

const {
    invoiceForm,
    isArticleModalOpen,
    isArticleDetailsModalOpen,
    isNewItemModalOpen,
    selectedArticle,
    currentPage,
    searchQuery,
    Items,
    paginatedArticles,
    totalPages,
    clients,
    isNewItem,
    selectedJournalId,
    flattenedJournals,
    newItemForm,
    sellingRate,
    buyingRate,
    fileInputRef,
    taxValues,
    categories,
    deadlines,
    currentYear,
    selectedCurrency,
    billingAddress,
    itemCategories,
    itemBrands,
    itemUnities,
    itemDestination,
    itemType,
    banks,
    deliveryAddress,
    companyName,
    taxes,
    defaultJournalLabel,
    reloadCurrencyRate,
    getTaxAmount,
    addNewItem,
    onClientSelected,
    calculateSubtotal,
    calculateTotal,
    formatPrice,
    updateTotals,
    getFileDisplayText,
    handleFileChange,
    triggerFileInput,
    onTaxChange,
    handleAction,
    addArticleForm,
    removeArticle,
    openArticleDetailsModal,
    closeArticleDetailsModal,
    addTax,
    removeTax,
    itemSelection,
    addSelectedItems,
    nextPage,
    prevPage,
    openArticleModal,
    closeArticleModal,
    openNewItemModal,
    closeNewItemModal,
    validateAndSubmit,
    saveArticle,

    // Voice related
    isVoiceEnabled,
    voiceEndpoint,
    lastVoiceResult,
    toggleVoiceHelp,
    handleVoiceFormUpdate,
    handleVoiceError,
    
    // PDF related
    pdfFileInputRef,
    isProcessingPdf,
    pdfProcessingError,
    isPdfPreviewModalOpen,
    pdfExtractedData,
    openPdfUpload,
    handlePdfUpload,
    openPdfPreviewModal,
    closePdfPreviewModal,
    applyExtractedData
} = useInvoiceController();

watch(itemDestination, (val) => {
  console.log('Destination changed to:', val);
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
  --max-width: 500px;
  --height: 80%;
  --border-radius: 10px;
  --background: #ffffff;
  --box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}
.newitem-modal ion-item {
  --background: #ffffff;
  --padding-start: 0;
  --padding-end: 0;
  --border-color: transparent !important;
  --border-width: 0 !important;
  --inner-border-width: 0 !important;
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
.in-cadre-in-modal-title {
  flex: 1;
  border: 1px solid #ccc;
  border-radius: 8px;
  background: #fff;
  padding: 8px;
  box-sizing: border-box;
}
.add-anItem{
  --background: #27A2DB !important; 
    --color: #ffffff !important; 
    width: 40px !important; 
    height: 40px !important;
    font-size: 20px !important; 
    --border-radius: 30% !important; 
    --padding-start: 0 !important; 
    --padding-end: 0 !important; 
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
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
  --padding-bottom: 250px;
  overflow-y: auto; 

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
  padding-bottom: 20px; 
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
.open-newItemModel{
  --inner-padding-end: 0;
  --padding-start: 0;
  --padding-end: 0;
}
.input-with-button {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
}

.newpayment-paidamount {
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
.newpayment-paid-input {
  flex: 1;
  font-size: 16px;
  color: #333;
  border: none;
  outline: none;
  background: transparent;
}
.input-button-container {
  display: flex !important;
  align-items: center !important;
  width: 95%; 
  justify-content: flex-end !important;
}
.reload-btn{
  --background: #27A2DB !important;
  --color: #ffffff !important; 
  width: 50px !important; 
  height: 40px !important;
  font-size: 20px;
  border-radius: 10px !important;
  --padding-start: 5px !important; 
  --padding-end: 5px !important; 
}
.currency-symbol {
  padding: 10px 15px;
  font-size: 16px;
  color: #666;
  background: #f5f5f5;
  border-left: 1px solid #ccc;
  border-radius: 0 8px 8px 0;
}

  
.voice-help-toggle {
  margin: 0 16px 8px 16px;
  --color: var(--ion-color-medium);
}

.voice-help-toggle ion-icon {
  margin-right: 4px;
}


.pdf-upload-toggle {
  margin-left: 10px;
  --color: #0066cc;
  
  ion-icon {
    margin-right: 4px;
  }
}

.pdf-upload-toggle:hover {
  --color: #004499;
}



/* Add these PDF-related styles */
.pdf-processing-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin: 10px 0;
  color: var(--ion-color-primary);
}

.pdf-error-message {
  margin: 10px 0;
  color: var(--ion-color-danger);
}

.pdf-preview-modal ion-item {
  --padding-start: 0;
}

.pdf-preview-modal ion-text {
  font-weight: 500;
}
.pdf-preview-modal ion-item {
  --padding-start: 0;
}

.pdf-preview-modal ion-text {
  font-weight: 500;
}

.pdf-preview-modal h4 {
  margin-top: 0;
  color: var(--ion-color-primary);
}

.extraction-field-match {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  padding: 8px;
  background-color: rgba(var(--ion-color-success-rgb), 0.1);
  border-radius: 4px;
}

.extraction-field-nomatch {
  background-color: rgba(var(--ion-color-warning-rgb), 0.1);
}

.extraction-label {
  font-weight: bold;
}

.extraction-value {
  text-align: right;
  max-width: 60%;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
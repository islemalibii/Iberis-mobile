<template>
    <ion-page>
      <ion-header>
        <ion-toolbar>
          <ion-title>Iberis</ion-title>
        </ion-toolbar>
      </ion-header>
      <ion-content :fullscreen="true">
        <div class="payments-header">
          <div class="header-row">
            <ion-label class="title">Add payment</ion-label>
          </div>
          <p class="company">company name</p>
        </div>     
        <div class="content-wrapper">
          <ion-accordion-group class="all">         
            <ion-accordion>
              <ion-item class="aTitle" slot="header">
                <ion-icon :icon="createOutline"></ion-icon>
                <ion-label>Payment Details</ion-label>
              </ion-item>
              <div slot="content" class="accordion-content">
                <ion-item>
                  <ion-label>Client</ion-label>
                  <div class="newpayment-paidamount">
                    <ion-input 
                      v-model="clientQuery"
                      placeholder="Client" 
                      class="newpayment-paid-input"
                      readonly
                      @click="toggleClientList"
                      ref="clientInput">
                    </ion-input>
                  </div>
                </ion-item>
                <ion-list v-if="showClientList" class="dropdown-list" ref="clientList">
                  <ion-item 
                    v-for="client in clients" 
                    :key="client.id"
                    button
                    class="no-arrow"
                    @click="selectClient(client.name)">
                    {{ client.name }}
                  </ion-item>
                </ion-list>             
                <ion-item>
                  <ion-label class="newpayment-label">Paid Amount</ion-label>
                  <div class="newpayment-paidamount">
                    <ion-input class="newpayment-paid-input" type="number" placeholder="Enter amount"></ion-input>
                    <div class="currency-symbol">£</div>
                  </div>
                </ion-item>  
                <ion-item>
                  <ion-label>Payment method</ion-label>
                  <ion-select v-model="selectedPaymentMethod" class="newpayment-select" @ionChange="logSelected">
                    <ion-select-option value="cash">Cash</ion-select-option>
                    <ion-select-option value="creditcard">Credit card</ion-select-option>
                    <ion-select-option value="check">Check</ion-select-option>
                    <ion-select-option value="bankrem">Bank remittance</ion-select-option>
                    <ion-select-option value="banktran">Bank transfer</ion-select-option>
                  </ion-select>
                </ion-item>
                <template v-if="selectedPaymentMethod !== 'cash'">
                  <ion-item>
                    <ion-label class="newpayment-label">Bank fees</ion-label>
                    <div class="newpayment-paidamount">
                      <ion-input class="newpayment-paid-input"></ion-input>
                    </div>
                  </ion-item>
                  <ion-item>
                    <ion-label class="newpayment-label">Bank fees tax</ion-label>
                    <ion-select  class ="newpayment-select" value="0%">
                      <ion-select-option value="0%">0%</ion-select-option>
                      <ion-select-option value="fodec">FODEC(1%)</ion-select-option>
                      <ion-select-option value="tva">TVA(19%)</ion-select-option>
                    </ion-select>
                  </ion-item>
                  <ion-item>
                    <ion-label class="newpayment-label">Banks</ion-label>
                    <ion-select  class ="newpayment-select" value="test bank">
                      <ion-select-option value="test bank">test bank</ion-select-option>
                      <ion-select-option value="zitouna">Zitouna(TND)</ion-select-option>
                    </ion-select>
                  </ion-item>
                </template>
                <ion-item>
                  <ion-label>Payment n°</ion-label>
                  <div class="newpayment-paidamount">
                    <div class="currency-symbol">PAY-S</div>
                    <div class="currency-symbol">2025</div>
                    <ion-input class="newpayment-paid-input" value="00002"></ion-input>
                  </div>
                </ion-item>  
                <ion-item>
                  <ion-label>Date</ion-label>
                  <ion-input class="newpayment-date-input" type="date" value=""></ion-input>
                </ion-item>
                <ion-item>
                  <ion-label>Reference N°</ion-label>
                  <div class="newpayment-paidamount">
                    <ion-input placeholder="Enter reference number" class="newpayment-paid-input"></ion-input>
                  </div>
                </ion-item>
                <ion-accordion-group>
                  <ion-accordion>
                    <ion-item slot="header" class="invoices-item">
                        <ion-label class="invoices-label">Invoices</ion-label>
                    </ion-item>
                    <div slot="content">
                      <ion-item 
                          v-for="invoice in invoices" 
                          :key="invoice.id" 
                          button
                          class="invoice"
                          @click="openPopover($event, invoice)">
                          <ion-label class="invoice">Invoice: {{ invoice.number }}</ion-label>
                        </ion-item>
                    </div>
                  </ion-accordion>
                </ion-accordion-group>
                <ion-accordion-group>
                  <ion-accordion>
                    <ion-item slot="header" class="invoices-item">
                        <ion-label class="invoices-label">Disbursement note</ion-label>
                    </ion-item>
                    <div slot="content">
                      <ion-item 
                          v-for="disbursementNote in disbursementNotes" 
                          :key="disbursementNote.id" 
                          button
                          class="invoice"
                          @click="openPopover($event, disbursementNote)">
                          <ion-label class="invoice">Disbursement note: {{ disbursementNote.name }}</ion-label>
                        </ion-item>
                    </div>
                  </ion-accordion>
                </ion-accordion-group>
                <ion-item>
                  <ion-label>Notes</ion-label>
                  <div class="newpayment-paidamount">
                    <ion-textarea class="newpayment-paid-input" placeholder="Enter any remarks"></ion-textarea>
                  </div>
                </ion-item>
                <ion-item>
                  <div class="add-files">
                    <ion-label>Pièces jointes</ion-label>
                    <ion-button class="add-file">Choose Files</ion-button>
                  </div>
                </ion-item>
                <ion-item class="item">
                  <ion-label class="label">Paid</ion-label>
                  <ion-text class="text">0.000</ion-text>
                </ion-item>
                <ion-item class="item">
                  <ion-label class="label">Used</ion-label>
                  <ion-text class="text">0.000</ion-text>
                </ion-item>
                <ion-item class="item">
                  <ion-label class="label">Left to</ion-label>
                  <ion-text class="text">0.000 TND</ion-text>
                </ion-item>
              </div>
            </ion-accordion>
            <!-- contenu Section -->
            <ion-accordion value="PDF language">
              <ion-item class="aTitle" slot="header">
                <ion-icon :icon="calendarOutline"></ion-icon>
                <ion-label>PDF language</ion-label>
              </ion-item>
              <div slot="content" class="accordion-content">
                <ion-item>
                    <ion-label>PDF language</ion-label>
                      <ion-select class ="newpayment-select" value="Frensh">
                        <ion-select-option value="Frensh">Frensh</ion-select-option>
                        <ion-select-option value="Arabic">Arabic</ion-select-option>
                        <ion-select-option value="English">English</ion-select-option>
                      </ion-select>
                  </ion-item>
              </div>
            </ion-accordion>
            <!-- stamp Section -->
            <ion-accordion value="stamp">
              <ion-item class="aTitle" slot="header">
                <ion-icon :icon="chatbubbleOutline"></ion-icon>
                <ion-label>Stamp & Signature</ion-label>
              </ion-item>
              <div slot="content" class="accordion-content">
                <ion-item lines="none" class="toggle-row">
                  <div class="a-toggle">
                    <ion-label class="toggle-label">Stamp & Signature</ion-label>
                    <ion-toggle></ion-toggle>
                  </div>
                </ion-item>
              </div>
            </ion-accordion>
            <!--Only when currency is £ , when currency is tnd its removed-->
            <ion-accordion value="devise">
              <ion-item class="aTitle" slot="header">
                <ion-icon :icon="chatbubbleOutline"></ion-icon>
                <ion-label>Devise</ion-label>
              </ion-item>
              <div slot="content" class="accordion-content">
                <ion-item>
                  <ion-label>Currency rate (EUR to TND)</ion-label>
                  <div class="input-button-container">
                    <ion-input value="3.315"></ion-input>
                    <ion-button class="reload-btn">
                      <ion-icon :icon="refreshOutline"></ion-icon>
                    </ion-button>
                  </div>
                </ion-item>
              </div>
            </ion-accordion>
          <!--END-->
          </ion-accordion-group>
          

          <div class="add-payment-container">
            <ion-button class="add-payment">Add</ion-button>
          </div>
        </div>

        <ion-modal :is-open="popoverOpen" :event="popoverEvent" @didDismiss="popoverOpen = false" class="invoice-model">
          <ion-header>
            <ion-toolbar>
              <ion-title>{{ selectedInvoice?.number }}</ion-title>
              <ion-buttons slot="end">
                <ion-button @click="popoverOpen = false">
                  <ion-icon :icon="closeOutline"></ion-icon>
                </ion-button>
              </ion-buttons>
            </ion-toolbar>
          </ion-header>
          <ion-content class="ion-padding">
            <ion-item>
              <ion-label>Total</ion-label>
              <div class="invoice-div">
                <ion-text class="invoice-champ">{{ selectedInvoice?.total }}</ion-text>
              </div>            
            </ion-item>
            <ion-item>
              <ion-label>To pay</ion-label>
              <div class="invoice-div">
                <ion-text class="invoice-champ">{{ selectedInvoice?.toPay }}</ion-text>
              </div>
            </ion-item>
            <ion-item>
              <ion-label>Payment</ion-label>
              <div class="invoice-div">
                <ion-input class="invoice-champ"></ion-input>
              </div>            
            </ion-item>
            <div class="invoice-modal-actions">
              <ion-button color="danger" @click="popoverOpen = false">Fermer</ion-button>
              <ion-button color="primary" @click="addpayment">Ajouter</ion-button>
            </div>
          </ion-content>
        </ion-modal>
    </ion-content>
  </ion-page>
  </template>
  <script setup>
    import { closeOutline, refreshOutline } from 'ionicons/icons';
    import { ref, onMounted, onUnmounted } from "vue";
    const selectedPaymentMethod = ref('cash');
    const clientQuery = ref(""); 
    const showClientList = ref(false);
    const clientInput = ref(null);
    const clientList = ref(null);
    const popoverOpen = ref(false);
    const popoverEvent = ref(null);
    const selectedInvoice = ref(null);
    const clients = ref([
      { id: 1, name: "John Doe" },
      { id: 2, name: "Jane Smith" },
      { id: 3, name: "Michael Johnson" }
    ]);
    const invoices = ref([
    { id: 1, number: "2024-00001", total: 1500, toPay: 500 },
    { id: 2, number: "2024-00002", total: 2000, toPay: 1500 },
    { id: 3, number: "2024-00003", total: 3000, toPay: 1000 }
    ]);
    const disbursementNotes = ref([
    { id: 1, name: "nOl", total: 444.00, toPay: 444.00 }
    ]);
    const logSelected = (event) => {
      selectedPaymentMethod.value = event.detail.value; 
      console.log("Selected Payment Method:", selectedPaymentMethod.value);
    };
    const openPopover = (event, invoice) => {
      selectedInvoice.value = invoice;
      popoverEvent.value = event;
      popoverOpen.value = true;
    };
    //mayekhdmch
    const toggleClientList = () => {
      showClientList.value = !showClientList.value;
    };
    const selectClient = (name) => {
      clientQuery.value = name;
      showClientList.value = false;
    };
    const handleClickOutside = (event) => {
      if (
        clientInput.value && !clientInput.value.$el.contains(event.target) &&
        clientList.value && !clientList.value.$el.contains(event.target)
      ) {
        showClientList.value = false;
      }
    };
    onMounted(() => {
      document.addEventListener("click", handleClickOutside);
    });

    onUnmounted(() => {
      document.removeEventListener("click", handleClickOutside);
    });
    //lhna


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
  .payments-header {
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
  p{
    color: #000;
    font-weight: bold;
    margin-bottom: 25px;
  }
  .add-files{
    margin-top: 15px;
    display: flex !important;
    flex-direction: row !important;
    align-items: center !important;
  }
  .add-file {
    margin-left: 120px;
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
  .add-payment {
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
  .add-payment-container {
    display: flex;
    justify-content: center;
    margin-top: 80px; 
    padding-bottom: 20px;
  }
  ion-item {
    --border-color: transparent; 
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
  .currency-symbol {
    padding: 10px 15px;
    font-size: 16px;
    color: #666;
    background: #f5f5f5;
    border-left: 1px solid #ccc;
    border-radius: 0 8px 8px 0;
  }
  .newpayment-date-input{
    border: 1px solid #ccc; 
    border-radius: 8px; 
    padding-left: 15px;
    background: white;
    width: 330px;
    margin-left: 15px;
  }
  .newpayment-select{
    border: 1px solid #ccc; 
    border-radius: 8px; 
    padding-left: 10px;
    background: white;
    width: 330px;
    margin-left: 15px;
  }
  .item{
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .label{
    flex: 1;
    text-align: left;
  }
  .text {
    text-align: right;
  }
  .dropdown-list {
    position: absolute;
    background-color: white;
    width: calc(100% - 40px);
    margin-left: 16px;
    border: 1px solid #ccc;
    border-radius: 8px;
    z-index: 999;
    box-shadow: 0px 8px 12px rgba(0, 0, 0, 0.1);
    padding-left: 10px;
    padding-top: 10px;
  }
  .no-arrow::part(native) {
    --inner-border-width: 0;
    --detail-icon-display: none;
  }
  .invoices-item::part(native) {
    display: flex !important;
    flex-direction: row !important; 
    align-items: center !important;
    justify-content: space-between !important; 
    padding-bottom: 15px;
  }
  .invoice::part(native) {
    display: flex !important;
    flex-direction: row !important; 
    align-items: center !important;
    justify-content: space-between !important;
    color: #333;
    flex-grow: 1; 
    text-align: left; 
  }
  .invoices-label{
    font-size: 20px;
    margin-top: 15px;
  }
  .invoice-model {
    --width: 90%;
    --max-width: 400px;
    --height: 380px;
    --border-radius: 10px;
    --background: #ffffff;
    --box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
  .invoice-model ion-header {
    --background: #ffffff;
    --color: #000000;
  }
  .invoice-model ion-content {
    --padding-start: 16px;
    --padding-end: 16px;
    --padding-top: 16px;
    --padding-bottom: 16px;
  }
  .invoice-model ion-item {
    --background: #ffffff;
    --padding-start: 0;
    --padding-end: 0;
  }
  .invoice-modal-actions {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    margin-top: 20px;
  }
  .invoice-modal-actions ion-button {
    --border-radius: 8px;
    --padding-start: 20px;
    --padding-end: 20px;
    font-size: 16px;
    font-weight: bold;
  }
  .invoice-model ion-buttons ion-button {
    --color: #000000;
  }
  .invoice-div {
    display: flex;
    align-items: center;
    border: 1px solid #ccc;
    border-radius: 8px;
    width: 290px;
    background: #fff;
    overflow: hidden;
    box-sizing: border-box;
    margin-left: 15px;
  }
  .invoice-champ {
    flex: 1;
    font-size: 16px;
    color: #333;
    border: none;
    outline: none;
    background: transparent;
    margin-top: 10px; 
    padding-bottom: 10px;
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
  </style>
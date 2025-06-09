<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Send Invoice</ion-title>
      </ion-toolbar>
    </ion-header>
  
    <ion-content class="ion-padding">
      <div v-if="sendViaEmail">
        <ion-item lines="none">
          <ion-label position="stacked">From</ion-label>
          <ion-input
            class="in-cadre-input"
            :value="userEmail"
            readonly
          ></ion-input>
        </ion-item>
    
        <ion-item lines="none">
          <ion-label position="stacked">To</ion-label>
          <div class="email-tags-wrapper in-cadre-input">
            <div v-for="(email, index) in toEmails" :key="index" class="email-tag">
              {{ email }}
              <span class="remove-tag" @click="removeToEmail(index)">×</span>
            </div>
            <input
              v-model="toInput"
              @keydown.enter.prevent="addToEmail"
              @keydown.space.prevent="addToEmail"
              @keydown="handleCommaKeyTo"
              @blur="addToEmail"
              class="email-tags-input"
            />
          </div>
        </ion-item>
    
        <ion-item lines="none">
          <ion-label position="stacked">CC</ion-label>
          <div class="email-tags-wrapper in-cadre-input">
            <div v-for="(email, index) in ccEmails" :key="index" class="email-tag">
              {{ email }}
              <span class="remove-tag" @click="removeCcEmail(index)">×</span>
            </div>
            <input
              v-model="ccInput"
              @keydown.enter.prevent="addCcEmail"
              @keydown.space.prevent="addCcEmail"
              @keydown="handleCommaKeyCc"
              @blur="addCcEmail"
              class="email-tags-input"
            />
          </div>
        </ion-item>

        <ion-item lines="none">
          <ion-label position="stacked">Subject</ion-label>
          <ion-input
            :value="subject"
            @ionInput="subject = $event.target.value"
            class="in-cadre-input"
            placeholder="Enter subject"
          />
        </ion-item>
      </div>

      <div v-if="sendViaWhatsApp">
        <ion-item lines="none">
          <ion-label position="stacked">Phone Number</ion-label>
          <ion-input
            :value="clientPhone"
            @ionInput="clientPhone = $event.target.value"
            class="in-cadre-input"
            placeholder="Enter phone number"
            type="tel"
          />
        </ion-item>
      </div>

      <ion-item lines="none">
        <ion-label position="stacked">Message</ion-label>
        <div class="editor-wrapper">
          <QuillEditor
            :content="messageContent"
            @update:content="messageContent = $arguments[0]"
            content-type="html"
            theme="snow"
            style="height: 300px; background: white;"
          />
        </div>
      </ion-item>

      <ion-item v-if="sendError" lines="none" class="error-message">
        <ion-label color="danger">{{ sendError }}</ion-label>
      </ion-item>
      
      <ion-item v-if="sendSuccess" lines="none" class="success-message">
        <ion-label color="success">Message sent successfully!</ion-label>
      </ion-item>

      <ion-item lines="none" class="ion-margin-top">
        <ion-checkbox 
          :checked="sendViaEmail"
          @ionChange="handleEmailCheckboxChange($event.detail.checked)"
          labelPlacement="end"
        >
          Send via email
        </ion-checkbox>
      </ion-item>
  
      <ion-item lines="none">
        <ion-checkbox 
          :checked="sendViaWhatsApp"
          @ionChange="handleWhatsAppCheckboxChange($event.detail.checked)"
          labelPlacement="end"
        >
          Send via WhatsApp
        </ion-checkbox>
      </ion-item>
  
      <ion-button 
        expand="block" 
        class="ion-margin-top"
        @click="handleSend"
        :disabled="isSending || isUploadingToDropbox">
        <ion-spinner v-if="isSending || isUploadingToDropbox" name="crescent"></ion-spinner>
        <span v-if="isUploadingToDropbox">Uploading to Dropbox...</span>
        <span v-else-if="isSending">Sending...</span>
        <span v-else>Send</span>
      </ion-button>

    </ion-content>
  </ion-page>
</template>
  
<script setup lang="ts">
import { useSendController } from '@/controllers/SendInvoiceController'; // adjust path if needed
//import { QuillEditor } from '@vueup/vue-quill';
//import '@vueup/vue-quill/dist/vue-quill.snow.css';

const {
  toEmails,
  toInput,
  addToEmail,
  handleCommaKeyTo,
  removeToEmail,
  messageContent,
  ccEmails,
  ccInput,
  addCcEmail,
  handleCommaKeyCc,
  removeCcEmail,
  userEmail,
  userLoaded,
  fetchInvoice,
  subject,
  isSending,
  sendError,
  sendSuccess,
  isUploadingToDropbox,
  dropboxUrl,
  handleSend,
  sendViaEmail,
  sendViaWhatsApp,
  clientPhone,
  handleEmailCheckboxChange,
  handleWhatsAppCheckboxChange,
} = useSendController();
</script>
  
  

<style scoped>
ion-page, ion-content {
  --background: #ffffff !important;   
  color: #000000 !important; 
}
:deep(.ql-toolbar.ql-snow) {
  border: 1px solid #9b9898 !important;
}

:deep(.ql-container.ql-snow) {
  border: 1px solid #9b9898 !important;
}


ion-item {
  --background: #ffffff !important; 
  --color: #000000 !important; 
}

ion-label {
  color: #000000 !important; 
}

ion-input, ion-textarea {
    background: transparent !important; 
    color: #6c6363 !important; 
    font-size: 16px;
    border: none;
    outline: none;
}

ion-checkbox {
  --background: #ffffff !important; 
  --color: #000000 !important; 
}

ion-button {
  --color: #000000 !important; 
  margin-bottom: 40px;

}
.in-cadre-input {
  --background: #ffffff !important; 
  --color: #000000 !important; 
  border: 1px solid #9b9898; 
  border-radius: 8px; 
  padding: 10px 10px; 
  width: 320px;
  margin-bottom: 10px; 
}

.email-tags-wrapper {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  border: 1px solid #9b9898;
  border-radius: 8px;
  padding: 6px 10px;
  background: #ffffff;
  width: 320px;
  margin-bottom: 10px;
  min-height: 42px;
}

.email-tags-input {
  flex: 1;
  border: none;
  outline: none;
  background: transparent;
  padding: 6px;
  font-size: 14px;
  min-width: 100px;
}
.email-tag {
  display: flex;
  align-items: center;
  background-color: #45AEEE;
  color: white;
  border-radius: 16px;
  padding: 4px 10px;
  margin: 2px 4px 2px 0;
  font-size: 14px;
}

.remove-tag {
  margin-left: 6px;
  cursor: pointer;
  font-size: 18px;
  line-height: 14px;
  font-weight: bold;
}
.ql-editor {
  text-align: left !important;
  padding: 10px !important;
  font-size: 14px;
  line-height: 1.5;
}
</style>
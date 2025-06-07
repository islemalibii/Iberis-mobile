<template>
  <div class="voice-input-container">
    <!-- Voice Input Button -->
    <ion-button 
      :disabled="voiceState.isProcessing" 
      @click="toggleRecording"
      class="voice-button"
      :class="{ 'recording': voiceState.isRecording, 'processing': voiceState.isProcessing }"
      fill="clear">
      <ion-icon 
        :icon="getVoiceIcon()" 
        :class="{ 'pulse': voiceState.isRecording }"
      ></ion-icon>
      <span class="voice-text">{{ getVoiceButtonText() }}</span>
    </ion-button>

    <!-- Recording Status -->
    <div v-if="voiceState.isRecording" class="recording-status">
      <div class="recording-indicator">
        <div class="recording-dot"></div>
        <span>Recording: {{ formattedTime }}</span>
      </div>
      <ion-button 
        size="small" 
        color="danger" 
        @click="stopRecording"
        class="stop-button">
        Stop Recording
      </ion-button>
    </div>

    <!-- Processing Status -->
    <div v-if="voiceState.isProcessing" class="processing-status">
      <ion-spinner></ion-spinner>
      <span>Processing voice input...</span>
    </div>

    <!-- Results Display -->
    <div v-if="lastResult && lastResult.fieldsUpdated.length > 0" class="voice-results">
      <div class="results-header">
        <ion-icon :icon="checkmarkCircleOutline" color="success"></ion-icon>
        <span>Voice input processed successfully!</span>
      </div>
      
      <div class="updated-fields">
        <p><strong>Updated fields:</strong></p>
        <ul>
          <li v-for="field in lastResult.fieldsUpdated" :key="field">{{ field }}</li>
        </ul>
      </div>

      <div v-if="lastResult.warnings.length > 0" class="warnings">
        <p><strong>Warnings:</strong></p>
        <ul>
          <li v-for="warning in lastResult.warnings" :key="warning">{{ warning }}</li>
        </ul>
      </div>

      <ion-button 
        size="small" 
        fill="clear" 
        @click="clearResults"
        class="clear-results">
        <ion-icon :icon="closeOutline"></ion-icon>
      </ion-button>
    </div>

    <!-- Error Display -->
    <div v-if="voiceState.error" class="voice-error">
      <ion-icon :icon="alertCircleOutline" color="danger"></ion-icon>
      <span>{{ voiceState.error }}</span>
      <ion-button 
        size="small" 
        fill="clear" 
        @click="clearError"
        class="clear-error">
        <ion-icon :icon="closeOutline"></ion-icon>
      </ion-button>
    </div>

    <!-- Help Text -->
    <div v-if="showHelp" class="voice-help">
      <p><strong>Voice Commands Examples:</strong></p>
      <ul>
        <li>"Client: ABC Company"</li>
        <li>"Date: today" or "Date: 2025-01-15"</li>
        <li>"Object: Website development services"</li>
        <li>"Bank details yes" or "Bank details no"</li>
        <li>"Items description yes"</li>
        <li>"Items pictures no"</li>
        
        <!-- Additional Entries Toggles -->
        <li>"TVA yes" or "TVA no"</li>
        <li>"Timbre fiscal yes"</li>
        <li>"Fiscal stamp no"</li>
        <li>"Exemple yes"</li>
        <li>"Choose bank BIAT"</li>
        <li>"Add item: Consulting services, quantity 5, price 100"</li>
        <li>"Notes: Payment due in 30 days"</li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted, watch } from 'vue';
import { 
  IonButton, 
  IonIcon, 
  IonSpinner,
  toastController 
} from '@ionic/vue';
import { 
  micOutline, 
  micOffOutline, 
  stopOutline,
  checkmarkCircleOutline,
  closeOutline,
  alertCircleOutline,
  helpCircleOutline 
} from 'ionicons/icons';
import { voiceService } from '@/services/VoiceRecording';
import { voiceFormMapper, type VoiceFormMappingResult } from '@/services/Voice_to_form';
import type { AddInvoiceForm } from '@/models/InvoicesModel';
import type { Client } from '@/models/ClientModel';
import type { Bank } from '@/models/BankModel';

// Props
interface Props {
  invoiceForm: AddInvoiceForm;
  clients: Client[];
  categories: any[];
  deadlines: any[];
  banks: Bank[];
  djangoEndpoint: string;
  showHelp?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  showHelp: false,
  djangoEndpoint: 'http://127.0.0.1:8000/transcribe/'
});

// Emits
const emit = defineEmits<{
  formUpdated: [result: VoiceFormMappingResult];
  error: [error: string];
}>();

// Reactive state
const voiceState = voiceService.state;
const lastResult = ref<VoiceFormMappingResult | null>(null);

// Computed
const formattedTime = computed(() => voiceService.getFormattedTime());

// Watch for prop changes and log them
watch(() => props.banks, (newBanks) => {
  console.log('Banks prop changed:', newBanks?.length || 0, 'banks');
}, { immediate: true });

// Methods
const toggleRecording = async () => {
  if (voiceState.value.isRecording) {
    stopRecording();
  } else {
    await startRecording();
  }
};

const startRecording = async () => {
  try {
    // Initialize voice recording if not already done
    const hasPermission = await voiceService.initializeVoiceRecording();
    if (!hasPermission) {
      showToast('Microphone permission is required for voice input', 'warning');
      return;
    }

    // Clear previous results
    clearResults();
    clearError();

    // Start recording
    await voiceService.startRecording();
    showToast('Recording started - speak clearly', 'success');
    
  } catch (error) {
    console.error('Error starting recording:', error);
    showToast('Failed to start recording', 'danger');
  }
};

const stopRecording = () => {
  voiceService.stopRecording();
  // Process the recording after a short delay
  setTimeout(() => {
    processVoiceInput();
  }, 500);
};

// COMPLETE processVoiceInput method
const processVoiceInput = async () => {
  if (!voiceState.value.audioBlob) {
    showToast('No audio recorded', 'warning');
    return;
  }

  try {

    // Set reference data
    voiceFormMapper.setReferenceData(
      props.clients, 
      props.categories, 
      props.deadlines, 
      props.banks
    );

    // Send to Django Whisper API
    const voiceData = await voiceService.processVoiceToForm(props.djangoEndpoint);
    
    // Debug logging
    console.log('Raw transcribed text:', voiceData.transcribed_text);
    console.log('Full Django response:', voiceData);
    
    // Map the response to form fields
    const mappingResult = voiceFormMapper.mapVoiceToInvoiceForm(voiceData, props.invoiceForm);
    
    console.log('Mapping result:', mappingResult);
    
    // Store the result for display
    lastResult.value = mappingResult;
    
    // Emit the result to parent component
    emit('formUpdated', mappingResult);
    
    // Show success/warning message
    if (mappingResult.success) {
      if (mappingResult.fieldsUpdated.length > 0) {
        showToast(`Updated ${mappingResult.fieldsUpdated.length} field(s)`, 'success');
      }
      if (mappingResult.warnings.length > 0) {
        showToast(`${mappingResult.warnings.length} warning(s) found`, 'warning');
      }
    } else {
      showToast('No recognizable fields found in voice input', 'warning');
    }
    
  } catch (error) {
    console.error('Error processing voice input:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    
    // Store error in voice state
    voiceState.value.error = `Processing failed: ${errorMessage}`;
    
    // Emit error to parent
    emit('error', errorMessage);
    
    showToast('Failed to process voice input', 'danger');
  }
};

const getVoiceIcon = () => {
  if (voiceState.value.isProcessing) return stopOutline;
  if (voiceState.value.isRecording) return micOffOutline;
  return micOutline;
};

const getVoiceButtonText = () => {
  if (voiceState.value.isProcessing) return 'Processing...';
  if (voiceState.value.isRecording) return 'Recording...';
  return 'Voice Input';
};

const clearResults = () => {
  lastResult.value = null;
};

const clearError = () => {
  voiceState.value.error = null;
};

const showToast = async (message: string, color: 'success' | 'warning' | 'danger' = 'primary') => {
  const toast = await toastController.create({
    message,
    duration: 3000,
    color,
    position: 'top',
  });
  toast.present();
};

// Lifecycle
onMounted(async () => {
  // Initialize voice service
  await voiceService.initializeVoiceRecording();
  
  // Debug initial props
  console.log('VoiceInputPage mounted with props:', {
    clients: props.clients?.length || 0,
    categories: props.categories?.length || 0,
    deadlines: props.deadlines?.length || 0,
    banks: props.banks?.length || 0
  });
});

onUnmounted(() => {
  // Cleanup
  voiceService.cleanup();
});
</script>

<style scoped>
.voice-input-container {
  padding: 16px;
  border: 1px solid var(--ion-color-light);
  border-radius: 8px;
  margin: 16px 0;
  background: var(--ion-color-light-tint);
}

.voice-button {
  --color: var(--ion-color-primary);
  font-weight: 500;
  margin-bottom: 8px;
}

.voice-button.recording {
  --color: var(--ion-color-danger);
}

.voice-button.processing {
  --color: var(--ion-color-warning);
}

.voice-text {
  margin-left: 8px;
}

.pulse {
  animation: pulse 1s infinite;
}

@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.1); }
  100% { transform: scale(1); }
}

.recording-status {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px;
  background: var(--ion-color-danger-tint);
  border-radius: 4px;
  margin: 8px 0;
}

.recording-indicator {
  display: flex;
  align-items: center;
  color: var(--ion-color-danger);
  font-weight: 500;
}

.recording-dot {
  width: 8px;
  height: 8px;
  background: var(--ion-color-danger);
  border-radius: 50%;
  margin-right: 8px;
  animation: pulse 1s infinite;
}

.processing-status {
  display: flex;
  align-items: center;
  padding: 12px;
  background: var(--ion-color-warning-tint);
  border-radius: 4px;
  margin: 8px 0;
}

.processing-status ion-spinner {
  margin-right: 8px;
}

.voice-results {
  background: var(--ion-color-success-tint);
  padding: 12px;
  border-radius: 4px;
  margin: 8px 0;
  position: relative;
}

.results-header {
  display: flex;
  align-items: center;
  color: var(--ion-color-success);
  font-weight: 500;
  margin-bottom: 8px;
}

.results-header ion-icon {
  margin-right: 8px;
}

.updated-fields ul, .warnings ul {
  margin: 4px 0;
  padding-left: 20px;
}

.updated-fields li, .warnings li {
  margin: 2px 0;
}

.warnings {
  color: var(--ion-color-warning);
  margin-top: 8px;
}

.clear-results {
  position: absolute;
  top: 4px;
  right: 4px;
  --color: var(--ion-color-medium);
}

.voice-error {
  display: flex;
  align-items: center;
  background: var(--ion-color-danger-tint);
  padding: 12px;
  border-radius: 4px;
  margin: 8px 0;
  color: var(--ion-color-danger);
  position: relative;
}

.voice-error ion-icon {
  margin-right: 8px;
}

.clear-error {
  position: absolute;
  top: 4px;
  right: 4px;
  --color: var(--ion-color-danger);
}

.voice-help {
  background: var(--ion-color-light);
  padding: 12px;
  border-radius: 4px;
  margin-top: 8px;
  font-size: 0.9em;
}

.voice-help ul {
  margin: 8px 0;
  padding-left: 20px;
}

.voice-help li {
  margin: 4px 0;
  font-style: italic;
}

.stop-button {
  --background: var(--ion-color-danger);
  --color: white;
}
</style>
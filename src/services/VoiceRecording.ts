// services/VoiceService.ts
import { ref } from 'vue';
import { Capacitor } from '@capacitor/core';
import { MediaRecorder as CapacitorMediaRecorder } from '@capacitor-community/media-recorder';

export interface VoiceRecordingState {
  isRecording: boolean;
  isProcessing: boolean;
  recordingTime: number;
  audioBlob: Blob | null;
  error: string | null;
}

export interface VoiceToFormResponse {
  client_name?: string;
  date?: string;
  due_date?: string;
  object?: string;
  reference_number?: string;
  items?: Array<{
    title: string;
    description?: string;
    quantity?: number;
    unit_price?: number;
  }>;
  general_terms?: string;
  watermark?: string;
  notes?: string;
  [key: string]: any;
}

class VoiceService {
  private mediaRecorder: MediaRecorder | null = null;
  private recordingTimer: NodeJS.Timeout | null = null;
  private chunks: Blob[] = [];
  
  public state = ref<VoiceRecordingState>({
    isRecording: false,
    isProcessing: false,
    recordingTime: 0,
    audioBlob: null,
    error: null
  });

  // Initialize voice recording permissions
  async initializeVoiceRecording(): Promise<boolean> {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Media recording not supported');
      }

      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } 
      });
      
      // Stop the stream immediately after getting permission
      stream.getTracks().forEach(track => track.stop());
      return true;
    } catch (error) {
      console.error('Voice recording permission denied:', error);
      this.state.value.error = 'Microphone permission required';
      return false;
    }
  }

  // Start recording voice
  async startRecording(): Promise<void> {
    try {
      this.resetState();
      
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      this.mediaRecorder = new MediaRecorder(stream, {
        mimeType: this.getSupportedMimeType()
      });

      this.chunks = [];
      this.state.value.isRecording = true;
      this.state.value.recordingTime = 0;

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.chunks.push(event.data);
        }
      };

      this.mediaRecorder.onstop = () => {
        const audioBlob = new Blob(this.chunks, { type: 'audio/wav' });
        this.state.value.audioBlob = audioBlob;
        this.state.value.isRecording = false;
        
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
      };

      this.mediaRecorder.start(1000); // Collect data every second
      this.startTimer();

    } catch (error) {
      console.error('Error starting recording:', error);
      this.state.value.error = 'Failed to start recording';
      this.state.value.isRecording = false;
    }
  }

  // Stop recording
  stopRecording(): void {
    if (this.mediaRecorder && this.state.value.isRecording) {
      this.mediaRecorder.stop();
      this.stopTimer();
    }
  }

  // Send audio to Django Whisper API
  async processVoiceToForm(djangoEndpoint: string): Promise<VoiceToFormResponse> {
    if (!this.state.value.audioBlob) {
      throw new Error('No audio recording available');
    }

    try {
      this.state.value.isProcessing = true;
      
      const formData = new FormData();
      formData.append('audio', this.state.value.audioBlob, 'recording.wav');

      const response = await fetch(djangoEndpoint, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result;

    } catch (error) {
      console.error('Error processing voice:', error);
      throw new Error('Failed to process voice recording');
    } finally {
      this.state.value.isProcessing = false;
    }
  }

  // Helper methods
  private getSupportedMimeType(): string {
    const types = [
      'audio/webm;codecs=opus',
      'audio/webm',
      'audio/ogg;codecs=opus',
      'audio/wav'
    ];
    
    for (const type of types) {
      if (MediaRecorder.isTypeSupported(type)) {
        return type;
      }
    }
    return 'audio/wav';
  }

  private startTimer(): void {
    this.recordingTimer = setInterval(() => {
      this.state.value.recordingTime++;
    }, 1000);
  }

  private stopTimer(): void {
    if (this.recordingTimer) {
      clearInterval(this.recordingTimer);
      this.recordingTimer = null;
    }
  }

  private resetState(): void {
    this.state.value.error = null;
    this.state.value.audioBlob = null;
    this.state.value.recordingTime = 0;
  }

  // Format recording time for display
  getFormattedTime(): string {
    const minutes = Math.floor(this.state.value.recordingTime / 60);
    const seconds = this.state.value.recordingTime % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }

  // Clean up resources
  cleanup(): void {
    this.stopRecording();
    this.stopTimer();
    this.chunks = [];
    this.state.value.audioBlob = null;
  }
}

export const voiceService = new VoiceService();
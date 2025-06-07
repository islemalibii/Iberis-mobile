import { ref, onMounted  } from 'vue';
import { AuthService } from '@/services/User';
import { getInvoice, fetchToken, sendInvoice, uploadToDropbox, sendWhatsAppMessage } from '@/services/Invoices';
import { useRoute } from 'vue-router';
import type { SendInvoiceRequest } from '@/models/InvoicesModel';

export function useSendController() {
  const  messageContent = ref(''); 
  const toEmails = ref<string[]>([]);
  const toInput = ref('');
  const ccEmails = ref<string[]>([]);
  const ccInput = ref('');
  const userEmail = ref(''); 
  const userLoaded = ref(false);
  const route = useRoute();
  const invoiceId = route.params.id as string;
  const subject = ref('');
  const invoice = ref<any>(null);
  const sendViaEmail = ref(true);  
  const sendViaWhatsApp = ref(false);
  const clientPhone = ref('');

  const isSending = ref(false);
  const sendError = ref('');
  const sendSuccess = ref(false);

  const isUploadingToDropbox = ref(false);
  const dropboxUrl = ref('');

  function handleEmailCheckboxChange(isChecked: boolean) {
    if (!isChecked && !sendViaWhatsApp.value) {
      sendViaEmail.value = true;
      return;
    }
    sendViaEmail.value = isChecked;
  }
  function handleWhatsAppCheckboxChange(isChecked: boolean) {
    if (!isChecked && !sendViaEmail.value) {
        sendViaWhatsApp.value = true;
        return;
    }
    sendViaWhatsApp.value = isChecked;
  }

  function validateEmail(email: string) {
    const re = /\S+@\S+\.\S+/;
    return re.test(email);
  }

  function addToEmail() {
    const input = toInput.value.trim().replace(/,$/, '');
    if (input && validateEmail(input) && !toEmails.value.includes(input)) {
      toEmails.value.push(input.toLowerCase());
    }
    toInput.value = '';
  }

  function handleCommaKeyTo(event: KeyboardEvent) {
    if (event.key === ",") {
      event.preventDefault();
      addToEmail();
    }
  }

  function removeToEmail(index: number) {
    toEmails.value.splice(index, 1);
  }

  function addCcEmail() {
    const input = ccInput.value.trim().replace(/,$/, '');
    if (input && validateEmail(input) && !ccEmails.value.includes(input)) {
      ccEmails.value.push(input.toLowerCase());
    }
    ccInput.value = '';
  }

  function handleCommaKeyCc(event: KeyboardEvent) {
    if (event.key === ",") {
      event.preventDefault();
      addCcEmail();
    }
  }

  function removeCcEmail(index: number) {
    ccEmails.value.splice(index, 1);
  }

  async function fetchInvoice() {
    console.log('fetchInvoice called with invoiceId:', invoiceId);
    if (!invoiceId) {
        console.log('No invoiceId provided');
        return;
    }
    try {
      invoice.value = await getInvoice(invoiceId);
      console.log('Fetched invoice directly:', invoice.value);
      if (invoice.value) {
        const newSubject = `Invoice ${invoice.value.invoice_number} from ${invoice.value.company?.title || 'Your Company'}`;
        subject.value = newSubject;

        const clientName = invoice.value.contact?.display_name || invoice.value.contact?.first_name || 'Client';
        
        let totalFormatted = '';
        try {
          const totals = JSON.parse(invoice.value.totals || '{}');
            totalFormatted = totals.total || '0';
        } catch (e) {
          totalFormatted = '0';
        }

        clientPhone.value = invoice.value.contact?.phone || '';
        console.log('Client phone:', clientPhone.value);

        messageContent.value = `
        Dear ${clientName},
        Thank you for choosing us.
        We are sending you the attached invoice <strong>${invoice.value.invoice_number}</strong>
        with a total of <strong>${totalFormatted} ${invoice.value.contact?.currency?.symbol || 'TND'}</strong>.
        Thank you in advance,
        Regards,
        ${invoice.value.company?.title || 'Your Company'}`;
        console.log('Set message content with client name:', clientName);
        if (invoice.value.contact?.email && !toEmails.value.includes(invoice.value.contact.email)) {
          toEmails.value.push(invoice.value.contact.email);
          console.log('Added client email to recipients:', invoice.value.contact.email);
        }
      } else {
        console.warn('Invoice not found for hashed_id:', invoiceId);
      }
    } catch (error) {
      console.error('Error fetching invoices:', error);
    }
  }


  function validateForm(): boolean {
    sendError.value = '';
    if (!sendViaEmail.value && !sendViaWhatsApp.value) {
      sendError.value = 'Please select at least one sending method';
      return false;
    }
    if (sendViaEmail.value) {
      if (toEmails.value.length === 0) {
          sendError.value = 'Please add at least one recipient email';
          return false;
      }
      
      if (!subject.value.trim()) {
          sendError.value = 'Subject is required for email';
          return false;
      }
    }
    if (sendViaWhatsApp.value) {
      if (!clientPhone.value.trim()) {
          sendError.value = 'Phone number is required for WhatsApp';
          return false;
      }
    }
    if (!messageContent.value.trim()) {
        sendError.value = 'Message is required';
        return false;
    }
    return true;
  }

  async function handleSend() {
    if (!validateForm()) return;
    try {
      isSending.value = true;
      sendError.value = '';
      sendSuccess.value = false;

      if (sendViaEmail.value) {
        const emailData: SendInvoiceRequest = {
          from: userEmail.value,
          to: toEmails.value,
          cc: ccEmails.value,
          subject: subject.value,
          message: messageContent.value,
          ngsign_include: true,
          attachments: [] 
        };
        await sendInvoice(invoiceId, emailData);
        console.log('Email sent successfully!');
      }
      if (sendViaWhatsApp.value) {
        isUploadingToDropbox.value = true;
        try {
          dropboxUrl.value = await uploadToDropbox(invoiceId);
          console.log('Uploaded to Dropbox:', dropboxUrl.value);
        } catch (uploadError) {
          console.warn('Dropbox upload failed, sending without attachment:', uploadError);
        }
        isUploadingToDropbox.value = false;
        await sendWhatsAppMessage(
          clientPhone.value,
          messageContent.value.replace(/<[^>]*>/g, ''),
          dropboxUrl.value
        );
        console.log('WhatsApp message sent successfully!');
      }
      sendSuccess.value = true;
    } catch (error) {
        console.error('Send failed:', error);
        sendError.value = error instanceof Error ? error.message : 'Failed to send. Please try again.';
    } finally {
      isSending.value = false;
      isUploadingToDropbox.value = false;
    }
  }
        

  onMounted(async () => {
    try {
      const token = await fetchToken();
      if (token) {
        const userProfile = await AuthService.fetchUserProfile(token);
        userEmail.value = userProfile.email;
        ccEmails.value.push(userProfile.email); 
        if (invoiceId) {
          await fetchInvoice(); 
        }
      } else {
        console.error('No token found');
      }
    } catch (error) {
      console.error('Error in onMounted:', error);
    }
  });

  return {
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
    subject,
    fetchInvoice,
    isSending,
    sendError,
    sendSuccess,
    handleSend,
    sendViaEmail,
    sendViaWhatsApp,
    clientPhone,
    handleEmailCheckboxChange,
    handleWhatsAppCheckboxChange,
    isUploadingToDropbox,
    dropboxUrl,
  };
}
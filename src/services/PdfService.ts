// src/services/PdfProcessingService.js
import axios from 'axios';

// Define the backend base URL
const API_BASE_URL = 'http://localhost:8000'; // Your Django server URL

export const pdfService = {
  /**
   * Process a PDF file and extract invoice data
   * @param {File} pdfFile - The PDF file to process
   * @returns {Promise<Object>} - The extracted data
   */
  async processPdfInvoice(pdfFile) {
    const formData = new FormData();
    formData.append('pdf_file', pdfFile);
    
    // Note the /api/ prefix added to match your Django URL configuration
    const response = await axios.post(`${API_BASE_URL}/api/predict_layoutlm/`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    
    return response.data;
  }
};
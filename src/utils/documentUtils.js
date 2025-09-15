/**
 * Utility functions for document handling across the application
 */

/**
 * Creates a standardized minimal document object for initial display
 * @param {Object} params - Document parameters
 * @param {string} params.id - Document ID
 * @param {string} params.documentType - Document type
 * @param {string} params.title - Document title
 * @param {string} params.status - Document status
 * @param {string} params.uploadDate - Document upload date
 * @returns {Object} Standardized minimal document object
 */
export const createMinimalDocument = ({ id, documentType, title, status, uploadDate }) => {
  return {
    id,
    documentType,
    title: title || 'Без названия',
    status: status || 'prepared',
    uploadDate: uploadDate || new Date().toISOString().split('T')[0]
  };
};

/**
 * Merges document data while preserving existing properties
 * @param {Object} existingDocument - Existing document data
 * @param {Object} updatedData - Updated data to merge
 * @returns {Object} Merged document object
 */
export const mergeDocumentData = (existingDocument, updatedData) => {
  // If no existing document, return updated data
  if (!existingDocument) {
    return updatedData;
  }
  
  // Merge data while preserving existing properties that aren't in updatedData
  return {
    ...existingDocument,
    ...updatedData,
    // Ensure critical properties are preserved if not in updatedData
    id: updatedData.id || existingDocument.id,
    documentType: updatedData.documentType || existingDocument.documentType
  };
};

/**
 * Determines if detailed document data needs to be fetched
 * @param {Object} document - Document object to check
 * @returns {boolean} True if detailed data needs to be fetched
 */
export const needsDetailedData = (document) => {
  if (!document || !document.id || !document.documentType) {
    return false;
  }
  
  // For newly created documents, we should always fetch detailed data
  if (document.status === 'prepared') {
    return true;
  }
  
  // Standardize document type to handle typos
  const standardizedType = standardizeDocumentType(document.documentType);
  
  // For payment documents, we need to ensure we have paymentLines with actual data
  if (standardizedType === 'payment') {
    // If paymentLines doesn't exist or is not an array, we need to fetch
    if (!document.hasOwnProperty('paymentLines') || !Array.isArray(document.paymentLines)) {
      return true;
    }
    // If paymentLines is an empty array, we need to fetch
    if (document.paymentLines.length === 0) {
      return true;
    }
    // If paymentLines exists but doesn't have the required fields, we need to fetch
    const firstPayment = document.paymentLines[0];
    if (!firstPayment.hasOwnProperty('guid') && !firstPayment.hasOwnProperty('amount') && !firstPayment.hasOwnProperty('paymentDate')) {
      return true;
    }
  }
  
  // For memo documents, we need to ensure we have message or text with actual content
  if (standardizedType === 'memo') {
    if (!document.hasOwnProperty('message') && !document.hasOwnProperty('text')) {
      return true;
    }
    // If we have message or text but it's empty, we might need to fetch
    if (document.hasOwnProperty('message') && (!document.message || document.message === '')) {
      return true;
    }
    if (document.hasOwnProperty('text') && (!document.text || document.text === '')) {
      return true;
    }
  }
  
  // For expenditure documents, we need to ensure we have detailed financial information
  if (standardizedType === 'expenditure') {
    // Check if we have the essential detailed fields
    const hasExpenseDate = document.hasOwnProperty('expenseDate') && document.expenseDate;
    const hasOperationType = document.hasOwnProperty('operationType') && document.operationType;
    const hasPurposeText = document.hasOwnProperty('purposeText') && document.purposeText;
    const hasDetailedFields = hasExpenseDate || hasOperationType || hasPurposeText;
    
    // If we don't have detailed fields, we need to fetch
    if (!hasDetailedFields) {
      return true;
    }
  }
  
  // For other document types, check if we have basic detailed fields
  const hasDetailedFields = document.hasOwnProperty('payments') || 
                           document.hasOwnProperty('project') || 
                           document.hasOwnProperty('paymentLines') ||
                           document.hasOwnProperty('expenseDate') ||
                           document.hasOwnProperty('author') ||
                           document.hasOwnProperty('message') ||
                           document.hasOwnProperty('text') ||
                           document.hasOwnProperty('operationType') ||
                           document.hasOwnProperty('purposeText');
  
  // If we don't have detailed fields, we need to fetch
  return !hasDetailedFields;
};

/**
 * Standardizes document type (fixes typos)
 * @param {string} documentType - Document type to standardize
 * @returns {string} Standardized document type
 */
export const standardizeDocumentType = (documentType) => {
  // Fix common typos
  if (documentType === 'paymemnt') {
    return 'payment';
  }
  return documentType || 'payment';
};

/**
 * Extracts document ID from various possible fields in backend responses
 * @param {Object} response - Backend response object
 * @returns {string|null} Document ID or null if not found
 */
export const extractDocumentId = (response) => {
  if (!response) return null;
  return response.documentId || response.guid || response.id || null;
};

/**
 * Safely formats a date for input fields
 * @param {string|Date} dateValue - Date value to format
 * @returns {string} Formatted date string (YYYY-MM-DD) or empty string if invalid
 */
export const formatDateForInput = (dateValue) => {
  if (!dateValue) return '';
  
  try {
    // Handle different date formats
    const date = new Date(dateValue);
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      return '';
    }
    
    // Format as YYYY-MM-DD for input type="date"
    return date.toISOString().split('T')[0];
  } catch (error) {
    // Return empty string if any error occurs
    return '';
  }
};

/**
 * Parses a date string in various formats
 * @param {string} dateString - Date string to parse
 * @returns {Date|null} Parsed Date object or null if invalid
 */
export const parseDateString = (dateString) => {
  if (!dateString) return null;
  
  // Handle format "dd.mm.yyyy" (date only)
  if (dateString.includes('.') && !dateString.includes(':')) {
    const [day, month, year] = dateString.split('.');
    // Check if we have valid date components
    if (day && month && year) {
      return new Date(year, month - 1, day);
    }
  }
  
  // Handle format "dd.mm.yyyy hh:mm:ss"
  if (dateString.includes('.') && dateString.includes(':')) {
    const [datePart, timePart] = dateString.split(' ');
    const [day, month, year] = datePart.split('.');
    const [hour, minute, second] = timePart.split(':');
    return new Date(year, month - 1, day, hour, minute, second);
  }
  
  // Try to parse as standard date string
  const date = new Date(dateString);
  return isNaN(date.getTime()) ? null : date;
};

/**
 * Formats a date for display
 * @param {string|Date} date - Date to format
 * @returns {string} Formatted date string or '-' if invalid
 */
export const formatDate = (date) => {
  if (!date) return '-';
  
  const parsedDate = parseDateString(date);
  if (!parsedDate) return '-';
  
  return new Intl.DateTimeFormat('ru-RU', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(parsedDate);
};

export default {
  createMinimalDocument,
  mergeDocumentData,
  needsDetailedData,
  standardizeDocumentType,
  extractDocumentId,
  formatDateForInput,
  parseDateString,
  formatDate
};
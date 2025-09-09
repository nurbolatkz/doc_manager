import DOMPurify from 'dompurify';

/**
 * Sanitize user input to prevent XSS attacks
 * @param {string} input - User input string
 * @returns {string} Sanitized string
 */
export const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  return DOMPurify.sanitize(input);
};

/**
 * Sanitize HTML content
 * @param {string} html - HTML content
 * @returns {string} Sanitized HTML
 */
export const sanitizeHTML = (html) => {
  if (typeof html !== 'string') return html;
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br'],
    ALLOWED_ATTR: ['href', 'target']
  });
};

/**
 * Validate and sanitize form input
 * @param {Object} formData - Form data object
 * @returns {Object} Sanitized form data
 */
export const sanitizeFormData = (formData) => {
  const sanitizedData = {};
  for (const key in formData) {
    if (formData.hasOwnProperty(key)) {
      if (typeof formData[key] === 'string') {
        sanitizedData[key] = sanitizeInput(formData[key]);
      } else {
        sanitizedData[key] = formData[key];
      }
    }
  }
  return sanitizedData;
};

export default {
  sanitizeInput,
  sanitizeHTML,
  sanitizeFormData
};
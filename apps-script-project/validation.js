// validation.js - Reusable validation functions
// Pure JavaScript - works in both Apps Script and Node.js

/**
 * Validate email address format
 * @param {string} email - Email to validate
 * @param {string} fieldName - Field name for error messages
 * @returns {string} Trimmed and lowercased email
 * @throws {Error} If email is invalid
 */
function validateEmail(email, fieldName) {
  fieldName = fieldName || 'Email';

  var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!email || !emailRegex.test(email)) {
    throw new Error(fieldName + ' must be a valid email address, got: ' + email);
  }

  return email.toString().trim().toLowerCase();
}

/**
 * Validate numeric field
 * @param {any} value - Value to validate and convert to number
 * @param {string} fieldName - Field name for error messages
 * @param {number} minValue - Minimum allowed value (default: 0)
 * @returns {number} Validated number
 * @throws {Error} If value is not a valid number or below minimum
 */
function validateNumericField(value, fieldName, minValue) {
  fieldName = fieldName || 'Number';
  minValue = minValue !== undefined ? minValue : 0;

  var num = Number(value);

  if (isNaN(num)) {
    throw new Error(fieldName + ' must be a number, got: ' + value);
  }

  if (num < minValue) {
    throw new Error(fieldName + ' must be >= ' + minValue + ', got: ' + num);
  }

  return num;
}

/**
 * Validate required string field
 * @param {any} value - Value to validate
 * @param {string} fieldName - Field name for error messages
 * @param {number} maxLength - Maximum string length (default: 255)
 * @returns {string} Trimmed string
 * @throws {Error} If value is empty or too long
 */
function validateRequiredString(value, fieldName, maxLength) {
  fieldName = fieldName || 'Field';
  maxLength = maxLength || 255;

  if (!value || typeof value !== 'string' || value.trim().length === 0) {
    throw new Error(fieldName + ' is required');
  }

  if (value.length > maxLength) {
    throw new Error(fieldName + ' must be <= ' + maxLength + ' characters');
  }

  return value.trim();
}

/**
 * Validate enum value (must be one of allowed values)
 * @param {string} value - Value to validate
 * @param {Array<string>} allowedValues - Array of allowed values
 * @param {string} fieldName - Field name for error messages
 * @returns {string} Validated value
 * @throws {Error} If value is not in allowed list
 */
function validateEnum(value, allowedValues, fieldName) {
  fieldName = fieldName || 'Field';

  if (allowedValues.indexOf(value) === -1) {
    throw new Error(fieldName + ' must be one of: ' + allowedValues.join(', ') + ', got: ' + value);
  }

  return value;
}

/**
 * Validate date string
 * @param {string} dateStr - Date string to validate (ISO format)
 * @param {string} fieldName - Field name for error messages
 * @returns {string|null} Validated date string or null if empty
 * @throws {Error} If date string is invalid
 */
function validateDateString(dateStr, fieldName) {
  fieldName = fieldName || 'Date';

  if (!dateStr) {
    return null;
  }

  var date = new Date(dateStr);

  if (isNaN(date.getTime())) {
    throw new Error(fieldName + ' must be a valid date, got: ' + dateStr);
  }

  return dateStr;
}

/**
 * Validate optional numeric field (allows null/undefined)
 * @param {any} value - Value to validate
 * @param {string} fieldName - Field name for error messages
 * @param {number} minValue - Minimum allowed value (default: 0)
 * @returns {number|null} Validated number or null
 * @throws {Error} If value is invalid
 */
function validateOptionalNumericField(value, fieldName, minValue) {
  if (value === null || value === undefined || value === '') {
    return null;
  }

  return validateNumericField(value, fieldName, minValue);
}

/**
 * Sanitize string for JSON payload (prevent injection)
 * @param {string} value - String to sanitize
 * @param {number} maxLength - Maximum length (default: 5000)
 * @returns {string} Sanitized string
 */
function sanitizeString(value, maxLength) {
  if (!value) return '';

  maxLength = maxLength || 5000;

  var sanitized = value.toString().trim();

  // Truncate if too long
  if (sanitized.length > maxLength) {
    sanitized = sanitized.substring(0, maxLength);
  }

  return sanitized;
}

/**
 * Validate form data object with all required fields
 * @param {Object} formData - Form data to validate
 * @throws {Error} If any required field is missing or invalid
 */
function validateFormData(formData) {
  // Required string fields
  validateRequiredString(formData.clientName, 'Client Name');
  validateRequiredString(formData.decisionMakerName, 'Decision Maker Name');
  validateRequiredString(formData.decisionMakerSurname, 'Decision Maker Surname');
  validateRequiredString(formData.street, 'Street');
  validateRequiredString(formData.city, 'City');
  validateRequiredString(formData.zip, 'ZIP');
  validateRequiredString(formData.country, 'Country');
  validateRequiredString(formData.businessId, 'Business ID');

  // Email validation
  validateEmail(formData.billingEmail, 'Billing Email');

  // Contract type validation
  if (formData.contractType) {
    // Note: In Apps Script, use isValidContractType() from constants.js
    var contractTypes = ['Single licence', 'One+'];
    validateEnum(formData.contractType, contractTypes, 'Contract Type');
  }

  // Date validations
  if (formData.licenseStart) {
    validateDateString(formData.licenseStart, 'License Start');
  }

  if (formData.licenseEnd && formData.licenseUnlimited !== 'on') {
    validateDateString(formData.licenseEnd, 'License End');
  }

  return true;
}

// Export for Node.js testing (works in both Apps Script and Node.js)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    validateEmail: validateEmail,
    validateNumericField: validateNumericField,
    validateRequiredString: validateRequiredString,
    validateEnum: validateEnum,
    validateDateString: validateDateString,
    validateOptionalNumericField: validateOptionalNumericField,
    sanitizeString: sanitizeString,
    validateFormData: validateFormData
  };
}

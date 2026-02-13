// constants.js - Apps Script configuration and constants
// All hard-coded values extracted here for maintainability

// Application configuration
var CONFIG = {
  FORM_NAME: "Generátor Smluv Krutart v12",
  MAIN_TEMPLATE: "Index",
  MAX_ROWS_TO_PROCESS: 100,
  MAX_INSTALLMENTS: 6
};

// Sheets to ignore when building film list
var IGNORED_SHEETS = [
  "Settings",
  "Odpovědi",
  "Data",
  "Template",
  "List1",
  "Mustry smluv",
  "Delivery type",
  "Ticket share cap",
  "MG bez stropu",
  "MG strop"
];

// Film option columns (column letter -> field name mapping)
var FILM_OPTION_COLUMNS = {
  languages: 'D',
  resolutions: 'F',
  formats: 'G',
  soundmixes: 'H',
  durations: 'E'
};

// Payment type constants
var PAYMENT_TYPES = {
  FLAT_FEE: 'flat_fee',
  INSTALLMENTS: 'installments',
  TICKET_SHARE: 'ticket_share'
};

// Contract type constants
var CONTRACT_TYPES = {
  SINGLE: 'Single licence',
  ONE_PLUS: 'One+'
};

// Payment type mapping for Make webhook
var PAYMENT_TYPE_LABELS = {
  'flat_fee': 'Flat fee',
  'installments': 'Installments',
  'ticket_share': 'Ticket share'
};

// Currency symbols
var CURRENCY_SYMBOLS = {
  EUR: '€',
  USD: '$',
  CZK: 'Kč'
};

/**
 * Get webhook URL from Script Properties
 * Falls back to default if not configured
 *
 * To set webhook URL in Apps Script:
 * 1. File > Project properties > Script properties
 * 2. Add property: MAKE_WEBHOOK_URL = https://hook.eu2.make.com/...
 */
function getWebhookUrl() {
  try {
    var url = PropertiesService.getScriptProperties().getProperty('MAKE_WEBHOOK_URL');

    if (!url) {
      Logger.log('⚠️ MAKE_WEBHOOK_URL not set in Script Properties, using default');
      // Default fallback (current production URL)
      return 'https://hook.eu2.make.com/xr4qkia7cyvt65n9tn272b3d5wm0zum7';
    }

    Logger.log('✅ Using webhook URL from Script Properties');
    return url;

  } catch (error) {
    Logger.log('❌ Error reading Script Properties: ' + error.message);
    // Return default if properties service fails
    return 'https://hook.eu2.make.com/xr4qkia7cyvt65n9tn272b3d5wm0zum7';
  }
}

/**
 * Check if a payment type is valid
 */
function isValidPaymentType(paymentType) {
  return Object.values(PAYMENT_TYPES).indexOf(paymentType) !== -1;
}

/**
 * Check if a contract type is valid
 */
function isValidContractType(contractType) {
  return Object.values(CONTRACT_TYPES).indexOf(contractType) !== -1;
}

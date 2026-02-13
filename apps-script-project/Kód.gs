// --- SOUBOR: Kód.gs ---
// Main Apps Script code for Krutart Contract Generator v12
// Refactored with error handling, logging, and validation

/**
 * Main entry point - handles HTTP GET requests with URL parameters
 * Prefills form with data from URL query string
 *
 * @param {Object} e - Event object with URL parameters in e.parameter
 * @returns {HtmlOutput} HTML page with prefilled form
 */
function doGet(e) {
  Logger.log('=== doGet() START ===');
  Logger.log('Timestamp: ' + new Date().toISOString());
  Logger.log('URL parameters: ' + JSON.stringify(e.parameter));

  try {
    // Load HTML template
    var template = HtmlService.createTemplateFromFile(CONFIG.MAIN_TEMPLATE);

    // Prepare prefill data from URL parameters
    template.prefill = {
      dealId: e.parameter.dealId || "",
      clientName: e.parameter.clientName || "",
      venueName: e.parameter.venueName || "",
      orgId: e.parameter.orgId || "",
      email: e.parameter.email || "",
      street: e.parameter.street || e.parameter.address || "",
      city: e.parameter.city || "",
      zip: e.parameter.zip || "",
      country: e.parameter.country || "",
      vatId: e.parameter.vatId || "",
      businessId: e.parameter.businessId || "",
      productType: e.parameter.productType || ""
    };

    Logger.log('Prefill data prepared: ' + JSON.stringify(template.prefill));
    Logger.log('✅ doGet() completed successfully');

    return template.evaluate()
      .setTitle(CONFIG.FORM_NAME)
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
      .addMetaTag('viewport', 'width=device-width, initial-scale=1');

  } catch (error) {
    Logger.log('❌ ERROR in doGet(): ' + error.message);
    Logger.log('Stack trace: ' + error.stack);

    // Return user-friendly error page
    return HtmlService.createHtmlOutput(
      '<h1>Chyba načítání formuláře</h1>' +
      '<p>Prosím kontaktujte podporu.</p>' +
      '<p>Chyba: ' + error.message + '</p>'
    ).setTitle('Chyba');
  }
}

/**
 * Get list of available films from spreadsheet sheets
 * Excludes system/settings sheets
 *
 * @returns {Array<string>} Array of film names
 */
function getFilmList() {
  Logger.log('=== getFilmList() START ===');
  Logger.log('Timestamp: ' + new Date().toISOString());

  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheets = ss.getSheets();
    var filmNames = [];

    Logger.log('Total sheets found: ' + sheets.length);
    Logger.log('Ignored sheets: ' + IGNORED_SHEETS.join(', '));

    sheets.forEach(function(sheet) {
      var name = sheet.getName();
      if (IGNORED_SHEETS.indexOf(name) === -1) {
        filmNames.push(name);
      }
    });

    Logger.log('Film sheets found: ' + filmNames.length);
    Logger.log('Films: ' + filmNames.join(', '));
    Logger.log('✅ getFilmList() completed successfully');

    return filmNames;

  } catch (error) {
    Logger.log('❌ ERROR in getFilmList(): ' + error.message);
    Logger.log('Stack trace: ' + error.stack);
    throw error; // Re-throw so caller knows it failed
  }
}

/**
 * Get available options for a specific film
 * Reads columns D, E, F, G, H from the film's sheet
 *
 * @param {string} filmName - Name of the film sheet
 * @returns {Object} Object with arrays of options, or error object
 */
function getFilmOptions(filmName) {
  Logger.log('=== getFilmOptions() START ===');
  Logger.log('Timestamp: ' + new Date().toISOString());
  Logger.log('Requested film: ' + filmName);

  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(filmName);

    if (!sheet) {
      Logger.log('❌ Sheet not found: ' + filmName);
      return { error: "List nenalezen: " + filmName };
    }

    var lastRow = Math.min(sheet.getLastRow(), CONFIG.MAX_ROWS_TO_PROCESS);
    Logger.log('Processing rows: ' + lastRow);

    if (lastRow < 2) {
      Logger.log('⚠️ Sheet is empty: ' + filmName);
      return { error: "List je prázdný." };
    }

    // Helper function to get unique values from a column
    function getCol(colLetter, colName) {
      var colIndex = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".indexOf(colLetter) + 1;
      var values = sheet.getRange(2, colIndex, lastRow - 1, 1).getValues();
      var clean = values.map(function(r) {
        return r[0].toString();
      }).filter(function(v) {
        return v !== "";
      });

      var unique = [];
      clean.forEach(function(item) {
        if (unique.indexOf(item) === -1) {
          unique.push(item);
        }
      });

      Logger.log('Column ' + colLetter + ' (' + colName + '): found ' + unique.length + ' unique values');
      return unique;
    }

    var result = {
      languages: getCol(FILM_OPTION_COLUMNS.languages, 'languages'),
      resolutions: getCol(FILM_OPTION_COLUMNS.resolutions, 'resolutions'),
      formats: getCol(FILM_OPTION_COLUMNS.formats, 'formats'),
      soundmixes: getCol(FILM_OPTION_COLUMNS.soundmixes, 'soundmixes'),
      durations: getCol(FILM_OPTION_COLUMNS.durations, 'durations')
    };

    Logger.log('✅ Successfully loaded options for: ' + filmName);
    return result;

  } catch (e) {
    Logger.log('❌ ERROR in getFilmOptions(): ' + e.message);
    Logger.log('Stack trace: ' + e.stack);
    return { error: e.message };
  }
}

/**
 * Build installments payload object from form data
 * Replaces 12 lines of repetitive code with a loop
 *
 * @param {Object} formData - Form data object
 * @returns {Object} Installments fields for payload
 */
function buildInstallmentsPayload(formData) {
  var installments = {};

  for (var i = 1; i <= CONFIG.MAX_INSTALLMENTS; i++) {
    var amount = getInstAmount(formData, i);
    var date = getInstDate(formData, i);

    // Only include installments that have an amount
    if (amount !== null) {
      installments[i + ". splátka"] = amount;
      installments["Datum " + i + ". splátky"] = date;
    }
  }

  return installments;
}

/**
 * Extract payment date information from form data
 *
 * @param {Object} formData - Form data object
 * @param {boolean} isOnePlus - Whether this is One+ contract
 * @returns {Object} Object with paymentDateType and specificPaymentDate
 */
function extractPaymentDate(formData, isOnePlus) {
  var paymentDateType = [];
  var specificPaymentDate = null;

  if (isOnePlus) {
    if (formData.paymentTimingOnePlus === "signature") {
      paymentDateType = ["Po podpisu"];
    } else {
      paymentDateType = ["Konkrétní datum"];
      specificPaymentDate = formData.specificPaymentDateOnePlus;
    }
  } else {
    if (formData.paymentTiming === "signature") {
      paymentDateType = ["Po podpisu"];
    } else {
      paymentDateType = ["Konkrétní datum"];
      specificPaymentDate = formData.specificPaymentDateInput;
    }
  }

  return {
    paymentDateType: paymentDateType,
    specificPaymentDate: specificPaymentDate
  };
}

/**
 * Send form data to Make.com webhook
 * Validates data, builds payload, and sends HTTP POST request
 *
 * @param {Object} formData - Form data from submitted form
 * @returns {string} Success or error message
 */
function sendToMake(formData) {
  Logger.log('=== sendToMake() START ===');
  Logger.log('Timestamp: ' + new Date().toISOString());
  Logger.log('Contract Type: ' + formData.contractType);
  Logger.log('Client Name: ' + formData.clientName);

  try {
    // Validate required fields
    Logger.log('Validating form data...');

    validateRequiredString(formData.clientName, 'Client Name');
    validateEmail(formData.billingEmail, 'Billing Email');
    validateRequiredString(formData.decisionMakerName, 'Decision Maker Name');
    validateRequiredString(formData.decisionMakerSurname, 'Decision Maker Surname');
    validateRequiredString(formData.street, 'Street');
    validateRequiredString(formData.city, 'City');
    validateRequiredString(formData.zip, 'ZIP');
    validateRequiredString(formData.country, 'Country');
    validateRequiredString(formData.businessId, 'Business ID');

    Logger.log('✅ Basic validation passed');

    // Prepare payment data
    var finalVenueName = formData.venueName || formData.clientName;
    var paymentTypeMake = [];
    var totalAmountMake = 0;
    var periodicity = [];
    var isOnePlus = (formData.contractType === CONTRACT_TYPES.ONE_PLUS);

    if (isOnePlus) {
      // One+ subscription
      periodicity = [formData.subscriptionFrequency];
      totalAmountMake = validateNumericField(formData.subscriptionPrice, 'Subscription Price', 0);
      paymentTypeMake = ["Subscription"];
      Logger.log('One+ subscription - Price: ' + totalAmountMake);

    } else {
      // Single licence
      paymentTypeMake = [mapPaymentType(formData.paymentType)];
      totalAmountMake = validateNumericField(formData.totalAmount, 'Total Amount', 0);
      Logger.log('Single licence - Payment type: ' + formData.paymentType + ', Amount: ' + totalAmountMake);
    }

    // Extract payment date info
    var paymentDateInfo = extractPaymentDate(formData, isOnePlus);

    // Validate optional numeric fields
    var mgAmount = validateOptionalNumericField(formData.mgAmount, 'MG Amount', 0) || 0;
    var marketingAmount = validateOptionalNumericField(formData.marketingDeductionAmount, 'Marketing Amount', 0) || 0;
    var dealId = validateOptionalNumericField(formData.dealId, 'Deal ID', 0) || 0;

    // Build installments payload
    var installmentsPayload = buildInstallmentsPayload(formData);
    Logger.log('Installments added: ' + Object.keys(installmentsPayload).length / 2);

    // Build complete payload
    var payload = {
      "eventId": Utilities.getUuid(),
      "createdAt": new Date().toISOString(),
      "formName": CONFIG.FORM_NAME,
      "fields": {
        "Pipedrive Deal ID": dealId,
        "Jméno firmy": formData.clientName,
        "Jméno planetária / venue": finalVenueName,
        "Ulice a číslo popisné": formData.street,
        "PSČ": formData.zip,
        "Město": formData.city,
        "Země": formData.country,
        "Business ID": formData.businessId,
        "Tax ID": formData.vatId || "",
        "Zodpovědná osoba - jméno": formData.decisionMakerName,
        "Zodpovědná osoba - příjmení": formData.decisionMakerSurname,
        "E-mail na fakturaci": formData.billingEmail,
        "Měna": formData.currency || "EUR",
        "Jazyk smlouvy": [formData.contractLanguage || "EN"],
        "Typ smlouvy": [formData.contractType],
        "Periodicita platby": periodicity,
        "Jméno filmu": isOnePlus ? ["Krutart One+"] : [formData.selectedProduct || ""],
        "Rozlišení": formData.resolution ? [formData.resolution] : [],
        "Formát": formData.format ? [formData.format] : [],
        "Soundmix": formData.audio ? [formData.audio] : [],
        "Stopáž": formData.duration || "",
        "Jazyk dabingu": formData.language || "",
        "Delivery": [formData.deliveryMethod || "FTP"],
        "Začátek licence": formData.licenseStart || "",
        "Konec licence": isOnePlus ? "Automaticky" : (formData.licenseUnlimited === "on" ? "neomezeně" : formData.licenseEnd),
        "Typ platby Single licence": paymentTypeMake,
        "Celková částka": totalAmountMake,
        "Datum platby": paymentDateInfo.paymentDateType,
        "Konkrétní datum platby": paymentDateInfo.specificPaymentDate,
        "Konkrétní podmínky ticket share (nakopírují se do smlouvy)": sanitizeString(formData.shareConditions || ""),
        "Výše minimální garance": mgAmount,
        "Zastropování minimální garance?": formData.mgCap === "on" ? "Ano" : "Ne",
        "Odečtení úvodních marketingových nákladů?": formData.marketingDeduction === "yes" ? "Ano" : "Ne",
        "Výše marketingových nákladů": marketingAmount
      }
    };

    // Add installments to payload
    for (var key in installmentsPayload) {
      payload.fields[key] = installmentsPayload[key];
    }

    Logger.log('Payload prepared, total fields: ' + Object.keys(payload.fields).length);
    Logger.log('Payload preview: ' + JSON.stringify(payload, null, 2).substring(0, 500) + '...');

    // Send to webhook
    var webhookUrl = getWebhookUrl();
    Logger.log('Sending to webhook: ' + webhookUrl.substring(0, 50) + '...');

    var options = {
      'method': 'post',
      'contentType': 'application/json',
      'payload': JSON.stringify(payload),
      'muteHttpExceptions': true
    };

    var response = UrlFetchApp.fetch(webhookUrl, options);
    var statusCode = response.getResponseCode();
    var responseBody = response.getContentText();

    Logger.log('Response status: ' + statusCode);
    Logger.log('Response body: ' + responseBody);

    // Check response status
    if (statusCode >= 200 && statusCode < 300) {
      Logger.log('✅ sendToMake() completed successfully');
      return "✅ Odesláno do Make! (Status: " + statusCode + ")";
    } else {
      Logger.log('⚠️ Make webhook returned non-2xx status: ' + statusCode);
      return "⚠️ Částečná chyba: Status " + statusCode + " - zkontrolujte logy v Make";
    }

  } catch (error) {
    Logger.log('❌ ERROR in sendToMake(): ' + error.message);
    Logger.log('Stack trace: ' + error.stack);
    return "❌ Chyba: " + error.message;
  }
}

/**
 * Map internal payment type to Make-friendly label
 *
 * @param {string} val - Internal payment type value
 * @returns {string} Formatted payment type label
 */
function mapPaymentType(val) {
  if (PAYMENT_TYPE_LABELS[val]) {
    return PAYMENT_TYPE_LABELS[val];
  }

  Logger.log('⚠️ Unknown payment type: ' + val + ', returning as-is');
  return val;
}

/**
 * Get installment amount for a specific installment number
 *
 * @param {Object} data - Form data
 * @param {number} num - Installment number (1-6)
 * @returns {number|null} Installment amount or null
 */
function getInstAmount(data, num) {
  var val = data["inst_amount_" + num];
  return val ? Number(val) : null;
}

/**
 * Get installment date for a specific installment number
 *
 * @param {Object} data - Form data
 * @param {number} num - Installment number (1-6)
 * @returns {string|null} Installment date or null
 */
function getInstDate(data, num) {
  return data["inst_date_" + num] || null;
}

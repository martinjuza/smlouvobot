#!/usr/bin/env node
/**
 * Local test runner for Apps Script validation functions
 * Can be run in Node.js without Apps Script environment
 *
 * Usage:
 *   node test-local.js                    # Run all tests
 *   node test-local.js testEmailValidation # Run specific test
 */

const {
  validateEmail,
  validateNumericField,
  validateRequiredString,
  validateEnum,
  validateDateString,
  validateOptionalNumericField,
  sanitizeString,
  validateFormData
} = require('./validation.js');

// Test suite
const tests = {
  testEmailValidation: () => {
    console.log('\n=== Test: Email Validation ===');

    // Valid emails
    try {
      const result = validateEmail('martin.juza@krutart.cz', 'Test Email');
      console.log('✅ Valid email accepted:', result);
    } catch (e) {
      console.log('❌ Valid email rejected:', e.message);
    }

    try {
      const result = validateEmail('test+alias@example.com', 'Email with +');
      console.log('✅ Email with + accepted:', result);
    } catch (e) {
      console.log('❌ Email with + rejected:', e.message);
    }

    // Invalid emails
    try {
      validateEmail('invalid-email', 'Invalid Email');
      console.log('❌ Invalid email accepted (BAD!)');
    } catch (e) {
      console.log('✅ Invalid email rejected correctly:', e.message);
    }

    try {
      validateEmail('missing@domain', 'No TLD');
      console.log('❌ Email without TLD accepted (BAD!)');
    } catch (e) {
      console.log('✅ Email without TLD rejected:', e.message);
    }

    try {
      validateEmail('', 'Empty Email');
      console.log('❌ Empty email accepted (BAD!)');
    } catch (e) {
      console.log('✅ Empty email rejected:', e.message);
    }
  },

  testNumericValidation: () => {
    console.log('\n=== Test: Numeric Field Validation ===');

    // Valid numbers
    try {
      const result = validateNumericField('1500.50', 'Amount');
      console.log('✅ Valid decimal accepted:', result);
    } catch (e) {
      console.log('❌ Valid decimal rejected:', e.message);
    }

    try {
      const result = validateNumericField(42, 'Integer');
      console.log('✅ Integer accepted:', result);
    } catch (e) {
      console.log('❌ Integer rejected:', e.message);
    }

    try {
      const result = validateNumericField('0', 'Zero', 0);
      console.log('✅ Zero accepted (when min=0):', result);
    } catch (e) {
      console.log('❌ Zero rejected:', e.message);
    }

    // Invalid numbers
    try {
      validateNumericField('abc', 'Amount');
      console.log('❌ Non-numeric string accepted (BAD!)');
    } catch (e) {
      console.log('✅ Non-numeric string rejected:', e.message);
    }

    try {
      validateNumericField('-100', 'Amount', 0);
      console.log('❌ Negative number accepted (BAD!)');
    } catch (e) {
      console.log('✅ Negative number rejected:', e.message);
    }

    try {
      validateNumericField('', 'Empty');
      console.log('❌ Empty string accepted (BAD!)');
    } catch (e) {
      console.log('✅ Empty string rejected:', e.message);
    }
  },

  testRequiredStringValidation: () => {
    console.log('\n=== Test: Required String Validation ===');

    // Valid strings
    try {
      const result = validateRequiredString('ACME Planetarium', 'Company Name');
      console.log('✅ Valid string accepted:', result);
    } catch (e) {
      console.log('❌ Valid string rejected:', e.message);
    }

    try {
      const result = validateRequiredString('  Trimmed  ', 'Trimmed String');
      console.log('✅ String trimmed correctly:', result);
    } catch (e) {
      console.log('❌ Trimmed string rejected:', e.message);
    }

    // Invalid strings
    try {
      validateRequiredString('', 'Empty String');
      console.log('❌ Empty string accepted (BAD!)');
    } catch (e) {
      console.log('✅ Empty string rejected:', e.message);
    }

    try {
      validateRequiredString('   ', 'Whitespace Only');
      console.log('❌ Whitespace-only string accepted (BAD!)');
    } catch (e) {
      console.log('✅ Whitespace-only string rejected:', e.message);
    }

    try {
      const longString = 'a'.repeat(300);
      validateRequiredString(longString, 'Too Long', 255);
      console.log('❌ Too-long string accepted (BAD!)');
    } catch (e) {
      console.log('✅ Too-long string rejected:', e.message);
    }
  },

  testEnumValidation: () => {
    console.log('\n=== Test: Enum Validation ===');

    const allowedPaymentTypes = ['flat_fee', 'installments', 'ticket_share'];

    // Valid enum values
    try {
      const result = validateEnum('flat_fee', allowedPaymentTypes, 'Payment Type');
      console.log('✅ Valid enum accepted:', result);
    } catch (e) {
      console.log('❌ Valid enum rejected:', e.message);
    }

    try {
      const result = validateEnum('ticket_share', allowedPaymentTypes, 'Payment Type');
      console.log('✅ Another valid enum accepted:', result);
    } catch (e) {
      console.log('❌ Valid enum rejected:', e.message);
    }

    // Invalid enum values
    try {
      validateEnum('invalid_type', allowedPaymentTypes, 'Payment Type');
      console.log('❌ Invalid enum accepted (BAD!)');
    } catch (e) {
      console.log('✅ Invalid enum rejected:', e.message);
    }

    try {
      validateEnum('', allowedPaymentTypes, 'Payment Type');
      console.log('❌ Empty enum accepted (BAD!)');
    } catch (e) {
      console.log('✅ Empty enum rejected:', e.message);
    }
  },

  testDateValidation: () => {
    console.log('\n=== Test: Date Validation ===');

    // Valid dates
    try {
      const result = validateDateString('2026-03-15', 'License Start');
      console.log('✅ Valid ISO date accepted:', result);
    } catch (e) {
      console.log('❌ Valid ISO date rejected:', e.message);
    }

    try {
      const result = validateDateString('', 'Optional Date');
      console.log('✅ Empty date returns null:', result);
    } catch (e) {
      console.log('❌ Empty date caused error:', e.message);
    }

    // Invalid dates
    try {
      validateDateString('not-a-date', 'Invalid Date');
      console.log('❌ Invalid date accepted (BAD!)');
    } catch (e) {
      console.log('✅ Invalid date rejected:', e.message);
    }

    try {
      validateDateString('2026-13-01', 'Invalid Month');
      console.log('❌ Invalid month accepted (BAD!)');
    } catch (e) {
      console.log('✅ Invalid month rejected:', e.message);
    }
  },

  testOptionalNumericValidation: () => {
    console.log('\n=== Test: Optional Numeric Validation ===');

    // Valid optional numbers
    try {
      const result = validateOptionalNumericField('100', 'Optional Amount', 0);
      console.log('✅ Valid optional number accepted:', result);
    } catch (e) {
      console.log('❌ Valid optional number rejected:', e.message);
    }

    try {
      const result = validateOptionalNumericField('', 'Empty Optional');
      console.log('✅ Empty optional returns null:', result);
    } catch (e) {
      console.log('❌ Empty optional caused error:', e.message);
    }

    try {
      const result = validateOptionalNumericField(null, 'Null Optional');
      console.log('✅ Null optional returns null:', result);
    } catch (e) {
      console.log('❌ Null optional caused error:', e.message);
    }

    // Invalid optional numbers
    try {
      validateOptionalNumericField('abc', 'Invalid Optional');
      console.log('❌ Invalid optional number accepted (BAD!)');
    } catch (e) {
      console.log('✅ Invalid optional number rejected:', e.message);
    }
  },

  testSanitizeString: () => {
    console.log('\n=== Test: String Sanitization ===');

    const result1 = sanitizeString('  Normal string  ');
    console.log('✅ String trimmed:', `"${result1}"`);

    const result2 = sanitizeString('');
    console.log('✅ Empty string handled:', `"${result2}"`);

    const longString = 'a'.repeat(6000);
    const result3 = sanitizeString(longString, 5000);
    console.log('✅ Long string truncated to:', result3.length, 'chars');

    const result4 = sanitizeString(null);
    console.log('✅ Null handled:', `"${result4}"`);
  },

  testURLParameterPrefill: () => {
    console.log('\n=== Test: URL Parameter Prefill Simulation ===');

    // Simulate doGet() URL parameters
    const mockParams = {
      dealId: '12345',
      clientName: 'ACME Planetarium s.r.o.',
      email: 'billing@acme.cz',
      street: 'Hvězdná 123',
      city: 'Praha',
      zip: '12000',
      country: 'Česká republika',
      vatId: 'CZ12345678',
      businessId: '12345678'
    };

    console.log('Simulated URL parameters:', JSON.stringify(mockParams, null, 2));

    // Validate each field
    try {
      validateRequiredString(mockParams.clientName, 'Client Name');
      validateEmail(mockParams.email, 'Email');
      validateRequiredString(mockParams.street, 'Street');
      validateRequiredString(mockParams.city, 'City');
      validateRequiredString(mockParams.zip, 'ZIP');
      validateRequiredString(mockParams.country, 'Country');
      validateRequiredString(mockParams.businessId, 'Business ID');

      console.log('✅ All URL parameters valid - form would prefill correctly');
    } catch (e) {
      console.log('❌ Validation failed:', e.message);
    }
  },

  testWebhookPayload: () => {
    console.log('\n=== Test: Webhook Payload Structure ===');

    const mockFormData = {
      dealId: '12345',
      clientName: 'ACME Planetarium',
      venueName: '',
      street: 'Main Street 123',
      city: 'Prague',
      zip: '12000',
      country: 'Czech Republic',
      businessId: '12345678',
      vatId: 'CZ12345678',
      billingEmail: 'billing@acme.cz',
      decisionMakerName: 'Jan',
      decisionMakerSurname: 'Novák',
      contractType: 'Single licence',
      paymentType: 'flat_fee',
      totalAmount: '1500',
      currency: 'EUR',
      licenseStart: '2026-03-01',
      licenseEnd: '2027-03-01'
    };

    console.log('\nMock form data:', JSON.stringify(mockFormData, null, 2));

    // Validate critical fields
    try {
      validateFormData(mockFormData);

      console.log('\n✅ All required fields valid for webhook payload');
      console.log('\nSimulated payload structure:');
      console.log(JSON.stringify({
        eventId: 'test-uuid-12345',
        createdAt: new Date().toISOString(),
        formName: 'Krutart Contract v12',
        fields: {
          'Pipedrive Deal ID': Number(mockFormData.dealId),
          'Jméno firmy': mockFormData.clientName,
          'E-mail na fakturaci': mockFormData.billingEmail,
          'Celková částka': Number(mockFormData.totalAmount),
          'Začátek licence': mockFormData.licenseStart,
          'Konec licence': mockFormData.licenseEnd
        }
      }, null, 2));

    } catch (e) {
      console.log('❌ Payload validation failed:', e.message);
    }
  },

  testInvalidFormData: () => {
    console.log('\n=== Test: Invalid Form Data Rejection ===');

    const invalidFormData = {
      dealId: '999',
      clientName: '',  // Invalid: empty
      billingEmail: 'not-an-email',  // Invalid: bad format
      decisionMakerName: 'Jan',
      decisionMakerSurname: '',  // Invalid: empty
      street: 'Street',
      city: '',  // Invalid: empty
      zip: '12000',
      country: 'CZ',
      businessId: 'ABC'
    };

    try {
      validateFormData(invalidFormData);
      console.log('❌ Invalid form data accepted (BAD!)');
    } catch (e) {
      console.log('✅ Invalid form data rejected correctly');
      console.log('   Error:', e.message);
    }
  }
};

// CLI runner
const testName = process.argv[2];

console.log('🧪 Apps Script Validation Test Runner');
console.log('═'.repeat(50));

if (testName && tests[testName]) {
  console.log(`\nRunning test: ${testName}`);
  console.log('─'.repeat(50));
  tests[testName]();
} else if (testName) {
  console.log(`\n❌ Test not found: ${testName}`);
  console.log('\nAvailable tests:');
  Object.keys(tests).forEach(name => {
    console.log(`  node test-local.js ${name}`);
  });
} else {
  console.log('\nRunning all tests...\n');
  Object.keys(tests).forEach(name => {
    tests[name]();
  });
  console.log('\n' + '═'.repeat(50));
  console.log('✅ All tests completed');
}

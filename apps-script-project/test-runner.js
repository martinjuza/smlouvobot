#!/usr/bin/env node

/**
 * Local test runner for Apps Script functions
 * Simulates Apps Script environment for quick testing
 */

const fs = require('fs');
const path = require('path');

// Mock Apps Script globals
global.Logger = {
  log: (...args) => console.log('[Logger]', ...args)
};

global.console = {
  log: (...args) => console.log('[Console]', ...args),
  error: (...args) => console.error('[Error]', ...args)
};

global.HtmlService = {
  createTemplateFromFile: (filename) => {
    const content = fs.readFileSync(path.join(__dirname, `${filename}.html`), 'utf8');
    return {
      content,
      evaluate: function() {
        return {
          getContent: () => this.content,
          setTitle: (title) => { this.title = title; return this; }
        };
      }
    };
  },
  createHtmlOutput: (content) => ({
    getContent: () => content,
    setTitle: (title) => title
  })
};

global.UrlFetchApp = {
  fetch: (url, options) => {
    console.log('[UrlFetchApp.fetch] URL:', url);
    console.log('[UrlFetchApp.fetch] Options:', JSON.stringify(options, null, 2));
    return {
      getContentText: () => '{"success": true}',
      getResponseCode: () => 200
    };
  }
};

// Load your Apps Script code
function loadScript(filename) {
  const code = fs.readFileSync(path.join(__dirname, filename), 'utf8');
  // Remove GAS-specific syntax that won't work in Node
  const cleanCode = code.replace(/function\s+include\s*\([^)]*\)[^}]*\}/g, '');
  eval(cleanCode);
}

// Test scenarios
const tests = {
  testDoGetWithParams: () => {
    console.log('\n=== Test: doGet s URL parametry ===\n');

    const mockEvent = {
      parameter: {
        jmeno: 'Martin Juza',
        email: 'martin.juza@krutart.cz',
        telefon: '+420123456789',
        typ_smlouvy: 'fulldome'
      },
      parameters: {
        jmeno: ['Martin Juza'],
        email: ['martin.juza@krutart.cz'],
        telefon: ['+420123456789'],
        typ_smlouvy: ['fulldome']
      }
    };

    console.log('Input parametry:', JSON.stringify(mockEvent.parameter, null, 2));

    try {
      const result = doGet(mockEvent);
      console.log('\n✅ doGet successful');
      console.log('Output type:', typeof result);

      if (result && result.getContent) {
        const html = result.getContent();
        console.log('HTML length:', html.length, 'characters');

        // Check if parameters were injected
        Object.keys(mockEvent.parameter).forEach(key => {
          if (html.includes(mockEvent.parameter[key])) {
            console.log(`✅ Parameter '${key}' found in output`);
          } else {
            console.log(`⚠️  Parameter '${key}' NOT found in output`);
          }
        });
      }
    } catch (error) {
      console.error('❌ Test failed:', error.message);
    }
  },

  testDoGetEmpty: () => {
    console.log('\n=== Test: doGet bez parametrů ===\n');

    const mockEvent = {
      parameter: {},
      parameters: {}
    };

    try {
      const result = doGet(mockEvent);
      console.log('✅ doGet with empty params successful');
    } catch (error) {
      console.error('❌ Test failed:', error.message);
    }
  },

  testWebhook: () => {
    console.log('\n=== Test: Webhook odeslání ===\n');

    const testData = {
      jmeno: 'Martin Juza',
      email: 'martin.juza@krutart.cz',
      telefon: '+420123456789',
      timestamp: new Date().toISOString()
    };

    console.log('Odesílaná data:', JSON.stringify(testData, null, 2));

    // Pokud máte funkci odeslat() nebo podobnou
    try {
      if (typeof odeslat !== 'undefined') {
        const result = odeslat(testData);
        console.log('✅ Webhook call successful');
        console.log('Result:', result);
      } else {
        console.log('ℹ️  Function odeslat() not found - create it to test webhooks');
      }
    } catch (error) {
      console.error('❌ Test failed:', error.message);
    }
  }
};

// CLI
const testName = process.argv[2];

if (testName && tests[testName]) {
  console.log('🧪 Running test:', testName);

  // Load your script first
  try {
    if (fs.existsSync(path.join(__dirname, 'Kód.gs'))) {
      loadScript('Kód.gs');
      tests[testName]();
    } else {
      console.error('❌ Kód.gs not found. Run "node sync.js pull" first.');
    }
  } catch (error) {
    console.error('❌ Error loading script:', error.message);
  }
} else {
  console.log('🧪 Apps Script Test Runner\n');
  console.log('Available tests:');
  Object.keys(tests).forEach(name => {
    console.log(`  node test-runner.js ${name}`);
  });
  console.log('\nExample:');
  console.log('  node test-runner.js testDoGetWithParams');
}

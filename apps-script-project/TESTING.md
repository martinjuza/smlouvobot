# Testing Workflow pro Apps Script Web App

## Váš use case:
1. **URL parametry** - předvyplnění formuláře (doGet)
2. **Webhook** - odesílání dat (doPost nebo UrlFetchApp)

## 🚀 Doporučený workflow

### 1. Lokální vývoj + Rychlé testování

```bash
# Editujte soubory lokálně (VS Code, atd.)
vim Kód.gs

# Nahrajte změny do Apps Script (2-3 sekundy)
node sync.js push

# Testujte v prohlížeči na deployment URL
```

### 2. Test Deployment URL

Apps Script má tři typy URL:

**A) Test Deployment** (pro vývoj):
```
https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec?param1=value1&param2=value2
```

**B) Head Deployment** (pro testování nové verze):
```
https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/dev
```

**C) Production Deployment** (pro uživatele):
```
https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec
```

### 3. Rychlé testování v Apps Script Editoru

Po `node sync.js push`:
1. Otevřete Apps Script Editor
2. Vyberte funkci (např. `doGet`)
3. Klikněte **Run** nebo **Debug**
4. Nebo klikněte **Deploy** > **Test deployments**

## 🛠️ Testing Tools

### Test URL parametrů lokálně

Vytvořím test script pro simulaci doGet():

```javascript
// test-doget.js
function testDoGet() {
  // Simulace URL: ?name=Martin&email=test@example.com
  const mockEvent = {
    parameter: {
      name: "Martin",
      email: "test@example.com"
    },
    parameters: {
      name: ["Martin"],
      email: ["test@example.com"]
    }
  };

  const result = doGet(mockEvent);
  console.log(result.getContent());
}
```

### Test Webhook volání

```javascript
// test-webhook.js
function testWebhook() {
  const testData = {
    name: "Martin",
    email: "test@example.com"
  };

  const options = {
    method: 'post',
    contentType: 'application/json',
    payload: JSON.stringify(testData)
  };

  const response = UrlFetchApp.fetch('YOUR_WEBHOOK_URL', options);
  Logger.log(response.getContentText());
}
```

## 📊 Debugging

### V Apps Script Editoru:
1. Použijte `Logger.log()` nebo `console.log()`
2. View > Logs (Ctrl+Enter) nebo View > Execution log

### Lokálně:
```javascript
// Přidejte debugging
function doGet(e) {
  console.log('Received params:', JSON.stringify(e.parameter));
  // ... zbytek kódu
}
```

## ⚡ Rychlý iterační cyklus

```bash
# 1. Upravte kód
vim Kód.gs

# 2. Push změny (2-3 sekundy)
node sync.js push

# 3. Test v prohlížeči
# Otevřete: https://script.google.com/macros/s/.../exec?test=123

# 4. Zkontrolujte logy v Apps Script Editoru
# Nebo použijte: clasp logs (pokud máme clasp)
```

## 🎯 Pro váš konkrétní případ:

### Test předvyplnění formuláře z URL:

1. Deployment URL s parametry:
```
https://script.google.com/.../exec?jmeno=Martin&email=test@test.com&smlouva=fulldome
```

2. Funkce doGet() zpracuje parametry:
```javascript
function doGet(e) {
  const jmeno = e.parameter.jmeno || '';
  const email = e.parameter.email || '';

  // Předat do HTML
  const template = HtmlService.createTemplateFromFile('Index');
  template.jmeno = jmeno;
  template.email = email;

  return template.evaluate();
}
```

3. V HTML použijete:
```html
<input type="text" name="jmeno" value="<?= jmeno ?>">
<input type="email" name="email" value="<?= email ?>">
```

### Test webhook:

```javascript
function odeslat(formData) {
  const webhookUrl = 'https://your-webhook.com/endpoint';

  const options = {
    method: 'post',
    contentType: 'application/json',
    payload: JSON.stringify(formData),
    muteHttpExceptions: true
  };

  try {
    const response = UrlFetchApp.fetch(webhookUrl, options);
    console.log('Webhook response:', response.getContentText());
    return { success: true };
  } catch (error) {
    console.error('Webhook error:', error);
    return { success: false, error: error.toString() };
  }
}
```

## 🔥 Pro maximální rychlost:

Použijeme **hot reload** workflow:
1. Otevřete deployment URL v prohlížeči
2. V jiném okně editujte kód
3. `node sync.js push` (2 sekundy)
4. F5 refresh v prohlížeči
5. Změny jsou live!

**Poznámka**: HTML změny jsou okamžité, script změny mohou trvat 5-10 sekund než se projeví.

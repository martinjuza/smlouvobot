# Testing Workflow pro Apps Script Web App

## 🎯 Váš use case:
1. **URL parametry** - předvyplnění formuláře (doGet)
2. **Webhook** - odesílání dat na Make.com
3. **Validace** - kontrola dat před odesláním

## 🚀 Kompletní Testing Workflow

### Krok 1: Lokální validační testy (okamžité, bez Apps Script)

```bash
# Test všech validací najednou
node test-local.js

# Nebo jednotlivé testy:
node test-local.js testEmailValidation
node test-local.js testNumericValidation
node test-local.js testURLParameterPrefill
node test-local.js testWebhookPayload
```

**Co to testuje:**
- ✅ Email formát validace
- ✅ Numeric field kontroly
- ✅ Required string fields
- ✅ Enum hodnoty (payment types, contract types)
- ✅ Date formát validace
- ✅ Kompletní form data struktura

**Výhody:**
- Běží v Node.js bez Apps Script
- Okamžité výsledky (< 1 sekunda)
- Můžete testovat před pushem do Apps Script

### Krok 2: Push změn do Apps Script (2-3 sekundy)

```bash
# Editujte soubory lokálně
vim apps-script-project/Kód.gs

# Push všech změn do Apps Script
node sync.js push

# Měli byste vidět:
# ✅ Kód.gs synchronized
# ✅ Index.html synchronized
# ✅ constants.js synchronized
# ✅ validation.js synchronized
```

**Co se nahraje:**
- `Kód.gs` - hlavní logika
- `Index.html` - formulář
- `constants.js` - konfigurace
- `validation.js` - validační funkce

### Krok 3: Test URL předvyplnění v prohlížeči

**Testovací URL s parametry:**

```
https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec?dealId=12345&clientName=ACME+Planetarium&email=billing@acme.cz&street=Hvezdna+123&city=Praha&zip=12000&country=Ceska+republika&businessId=12345678
```

**Všechny dostupné URL parametry:**

| Parametr | Popis | Příklad |
|----------|-------|---------|
| `dealId` | Pipedrive Deal ID | `12345` |
| `clientName` | Jméno firmy | `ACME+Planetarium` |
| `venueName` | Jméno planetária (pokud jiné) | `Star+Dome` |
| `email` | Fakturační email | `billing@acme.cz` |
| `street` | Ulice a číslo | `Hvezdna+123` |
| `city` | Město | `Praha` |
| `zip` | PSČ | `12000` |
| `country` | Země | `Czech+Republic` |
| `vatId` | DIČ | `CZ12345678` |
| `businessId` | IČ | `12345678` |
| `productType` | Typ produktu | `fulldome` |

**Očekávaný výsledek:**
- Formulář se otevře s předvyplněnými poli
- Zkontrolujte, že všechna pole obsahují správné hodnoty
- Otevřete browser console (F12) a zkontrolujte JavaScript errors

**Debugging URL předvyplnění:**

1. Otevřete Apps Script Editor
2. View > Logs (nebo Ctrl+Enter)
3. Měli byste vidět:
   ```
   === doGet() START ===
   Timestamp: 2026-02-13T10:30:00.000Z
   URL parameters: {"dealId":"12345","clientName":"ACME Planetarium",...}
   Prefill data prepared: {...}
   ✅ doGet() completed successfully
   ```

### Krok 4: Test odeslání formuláře a webhook volání

**Postup:**

1. Vyplňte formulář (nebo použijte předvyplněná data z URL)
2. Klikněte "ODESLAT DATA"
3. Počkejte na zprávu "✅ Odesláno do Make!"

**Zkontrolujte Apps Script logy:**

```
=== sendToMake() START ===
Timestamp: 2026-02-13T10:35:00.000Z
Contract Type: Single licence
Client Name: ACME Planetarium
Validating form data...
✅ Basic validation passed
Single licence - Payment type: flat_fee, Amount: 1500
Payload prepared, total fields: 45
Payload preview: {"eventId":"abc-123",...}
Sending to webhook: https://hook.eu2.make.com/xr4qkia7...
Response status: 200
Response body: {"success":true}
✅ sendToMake() completed successfully
```

**Zkontrolujte Make.com:**

1. Otevřete Make.com scenario
2. Klikněte na "History"
3. Najděte nejnovější execution
4. Zkontrolujte, že všechna data jsou správně namapována

### Krok 5: Test chybových stavů

**Test 1: Nevalidní email**

```javascript
// V formuláři zadejte: not-an-email
// Očekávaný výsledek:
❌ Chyba: Billing Email must be a valid email address, got: not-an-email
```

**Logy v Apps Script:**
```
=== sendToMake() START ===
Validating form data...
❌ ERROR in sendToMake(): Billing Email must be a valid email address, got: not-an-email
Stack trace: Error: Billing Email must be a valid email address...
```

**Test 2: Prázdná povinná pole**

Formulář má frontend validaci, ale zkuste obejít:
- Měli byste dostat: `❌ Chyba: Client Name is required`

**Test 3: Nevalidní částka**

```javascript
// Zadejte do totalAmount: "abc"
// Očekávaný výsledek:
❌ Chyba: Total Amount must be a number >= 0, got: abc
```

## 🛠️ Debugging Tipy

### 1. Zobrazení Apps Script logů

**Metoda A: V editoru**
1. Otevřete Apps Script editor
2. View > Logs (Ctrl+Enter)
3. Uvidíte všechny `Logger.log()` výstupy

**Metoda B: Execution log**
1. View > Executions
2. Klikněte na konkrétní execution
3. Uvidíte detailní timeline a logy

### 2. Časté chyby a řešení

| Chyba | Příčina | Řešení |
|-------|---------|--------|
| `List nenalezen: Film XYZ` | Film sheet neexistuje v spreadsheet | Zkontrolujte, že sheet existuje a není v IGNORED_SHEETS |
| `Email must be a valid email address` | Špatný formát emailu | Opravte email na validní formát |
| `Total Amount must be a number` | Nečíselná hodnota v Amount | Zadejte číslo bez měny |
| `Status 400` - Make webhook | Make odmítl payload | Zkontrolujte Make scenario a mapping |
| `Status 401` - Make webhook | Neplatná webhook URL | Zkontrolujte webhook URL v Script Properties |
| `Template not found: Index` | Index.html chybí | Pushnout Index.html pomocí sync.js |

### 3. Kontrola payload struktury

**Před odesláním na Make:**

V `sendToMake()` logy najdete:
```javascript
Payload preview: {
  "eventId": "abc-123-def-456",
  "createdAt": "2026-02-13T10:35:00.000Z",
  "formName": "Krutart Contract v12",
  "fields": {
    "Pipedrive Deal ID": 12345,
    "Jméno firmy": "ACME Planetarium",
    "E-mail na fakturaci": "billing@acme.cz",
    "Celková částka": 1500,
    // ... další pole
  }
}
```

**Zkontrolujte:**
- ✅ EventId je UUID
- ✅ CreatedAt je ISO timestamp
- ✅ Všechna povinná pole jsou přítomna
- ✅ Numeric fields jsou numbers, ne strings
- ✅ Array fields mají správný formát

### 4. Test jednotlivých funkcí v Apps Script editoru

**Test getFilmList():**
```javascript
function testGetFilmList() {
  var films = getFilmList();
  Logger.log('Films: ' + JSON.stringify(films));
}
```

**Test getFilmOptions():**
```javascript
function testGetFilmOptions() {
  var options = getFilmOptions('Fulldome Film Name');
  Logger.log('Options: ' + JSON.stringify(options));
}
```

**Test validací:**
```javascript
function testValidation() {
  try {
    validateEmail('test@test.com', 'Test Email');
    Logger.log('✅ Email valid');
  } catch (e) {
    Logger.log('❌ Email invalid: ' + e.message);
  }
}
```

## ⚡ Rychlý Iterační Cyklus

**Celý workflow:**

```bash
# 1. Lokální test validací (0.5s)
node test-local.js testEmailValidation

# 2. Upravte kód
vim apps-script-project/Kód.gs

# 3. Lokální test změn (0.5s)
node test-local.js testFormData

# 4. Push do Apps Script (2-3s)
node sync.js push

# 5. Test v prohlížeči
# Otevřete: https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec?dealId=999&clientName=Test

# 6. Zkontrolujte logy
# Apps Script Editor > View > Logs

# 7. Zkontrolujte Make execution
# Make.com > Scenario > History
```

**Celkový čas: < 10 sekund per iteraci** 🚀

## 📦 Test Deployment vs Production

### Test Deployment (pro vývoj)

```bash
# URL s /dev endpoint
https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/dev

# Používá nejnovější kód
# Může mít unstable změny
# Pro interní testování
```

### Production Deployment (pro uživatele)

```bash
# URL s /exec endpoint
https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec

# Používá stable verzi
# Pro produkční použití
# Vyžaduje "New deployment" v Apps Script
```

**Vytvoření nového production deployment:**

1. Apps Script Editor > Deploy > New deployment
2. Type: Web app
3. Execute as: Me
4. Who has access: Anyone
5. Deploy
6. Copy deployment ID

## 🎯 Real-World Test Scenarios

### Scenario 1: Single Licence - Flat Fee

**URL:**
```
?dealId=101&clientName=Test+Cinema&email=test@cinema.com&street=Main+St+1&city=Prague&zip=12000&country=CZ&businessId=12345678
```

**Formulář:**
- Contract Type: Single licence
- Film: Vyberte z dropdownu
- Payment Type: Flat fee
- Total Amount: 1500
- Currency: EUR
- License Start: 2026-03-01
- License End: 2027-03-01

**Očekávaný Make payload:**
```json
{
  "Typ smlouvy": ["Single licence"],
  "Typ platby Single licence": ["Flat fee"],
  "Celková částka": 1500,
  "Datum platby": ["Po podpisu"]
}
```

### Scenario 2: One+ Subscription

**Formulář:**
- Contract Type: One+
- Subscription Price: 500
- Subscription Frequency: Monthly
- Payment Timing: Konkrétní datum: 2026-04-01

**Očekávaný Make payload:**
```json
{
  "Typ smlouvy": ["One+"],
  "Typ platby Single licence": ["Subscription"],
  "Celková částka": 500,
  "Periodicita platby": ["Monthly"],
  "Datum platby": ["Konkrétní datum"],
  "Konkrétní datum platby": "2026-04-01"
}
```

### Scenario 3: Installments (splátky)

**Formulář:**
- Payment Type: Installments
- Installment 1: 500 EUR, 2026-03-01
- Installment 2: 500 EUR, 2026-06-01
- Installment 3: 500 EUR, 2026-09-01

**Očekávaný Make payload:**
```json
{
  "Typ platby Single licence": ["Installments"],
  "Celková částka": 1500,
  "1. splátka": 500,
  "Datum 1. splátky": "2026-03-01",
  "2. splátka": 500,
  "Datum 2. splátky": "2026-06-01",
  "3. splátka": 500,
  "Datum 3. splátky": "2026-09-01"
}
```

## 🔧 Nastavení Script Properties (jednorázově)

**Pro webhook URL security:**

1. Apps Script Editor > Project Settings
2. Script Properties > Add property
3. Property: `MAKE_WEBHOOK_URL`
4. Value: `https://hook.eu2.make.com/xr4qkia7cyvt65n9tn272b3d5wm0zum7`
5. Save

**Výhody:**
- Webhook URL není hard-coded v kódu
- Můžete mít různé URL pro dev/prod
- Citlivé údaje mimo git

## ✅ Checklist před pushem do produkce

- [ ] Všechny lokální testy prošly (`node test-local.js`)
- [ ] Sync do Apps Script proběhl bez chyb (`node sync.js push`)
- [ ] URL předvyplnění funguje správně
- [ ] Formulář se odesílá bez chyb
- [ ] Make.com přijímá data správně
- [ ] Všechny validace fungují (testováno s bad data)
- [ ] Logy ukazují správné informace
- [ ] Žádné JavaScript errors v browser console
- [ ] Všechny povinné pole jsou validovány
- [ ] Response z Make je 200 OK
- [ ] Kód je commitnut do gitu

**Hotovo!** Můžete vytvořit production deployment a poslat URL uživatelům. 🎉

# Apps Script Development Workflow - Krutart Contract Generator v12

Tento adresář obsahuje lokální kopii vašeho Google Apps Script projektu **Smlouvomat** (Krutart Contract Generator) s nástroji pro rychlý vývoj a testování.

## 🎯 Co je tady

**Apps Script Web App pro generování smluv:**
- **URL předvyplnění** - přijímá data z Pipedrive přes URL parametry
- **Formulář** - interaktivní web UI pro výběr filmu a platebních podmínek
- **Webhook** - odesílá data do Make.com pro generování PDF smluv
- **Validace** - kontrola dat na backendu i frontendu

**Development workflow:**
- ✅ **Lokální editor** - editujte kód ve VS Code / Vim
- ✅ **Lokální testy** - běží v Node.js bez Apps Script
- ✅ **Rychlá synchronizace** - push změn za 2-3 sekundy
- ✅ **Git verzování** - track všech změn
- ✅ **Robustní logging** - detailní logy pro debugging

## 🚀 Rychlý start

### 1. První autentifikace (jen jednou)

```bash
node auth.js
```

Tento příkaz:
- Otevře prohlížeč s Google OAuth stránkou
- Po přihlášení uloží přístupový token do `.token`
- Token je platný několik hodin

### 2. Stáhněte projekt (pokud ještě není)

```bash
node sync.js pull
```

Stáhne všechny soubory z Apps Script:
- `Kód.gs` - hlavní Apps Script kód
- `Index.html` - formulář UI
- `constants.js` - konfigurace
- `validation.js` - validační funkce

### 3. Test validací lokálně (volitelné, ale doporučené)

```bash
# Spustí všechny validační testy
node test-local.js

# Nebo specifický test:
node test-local.js testEmailValidation
```

**Výhody:**
- Okamžité výsledky (< 1 sekunda)
- Bez nutnosti uploadu do Apps Script
- Catch chyb před pushem

### 4. Editujte soubory lokálně

```bash
# Otevřete ve vašem editoru
vim Kód.gs
# nebo
code .  # VS Code
```

**Hlavní soubory:**
- `Kód.gs` - doGet(), sendToMake(), getFilmList(), getFilmOptions()
- `Index.html` - formulář HTML + JavaScript
- `constants.js` - CONFIG, IGNORED_SHEETS, PAYMENT_TYPES
- `validation.js` - validateEmail(), validateNumericField(), atd.

### 5. Push změn do Apps Script

```bash
node sync.js push

# Měli byste vidět:
# ✅ Kód.gs synchronized
# ✅ Index.html synchronized
# ✅ constants.js synchronized
# ✅ validation.js synchronized
```

⏱️ **2-3 sekundy** - změny jsou live!

### 6. Test v prohlížeči

```
https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec?dealId=12345&clientName=Test+Company&email=test@test.com
```

**Zkontrolujte:**
- [ ] Formulář se otevřel
- [ ] URL parametry předvyplnily formulář
- [ ] Žádné JavaScript errors v konzoli (F12)

### 7. Zkontrolujte logy

**Apps Script Editor:**
1. Otevřete: https://script.google.com/d/1SReMMnLUJuOl842N7mD75hCNNqUB-3oibhd0Yuovxy7o73gwjwyCbwj3/edit
2. View > Logs (Ctrl+Enter)
3. Měli byste vidět:
   ```
   === doGet() START ===
   Timestamp: 2026-02-13...
   URL parameters: {...}
   ✅ doGet() completed successfully
   ```

## 📋 Dostupné příkazy

### Development workflow

| Příkaz | Popis | Čas |
|--------|-------|-----|
| `node test-local.js` | Lokální validační testy | < 1s |
| `node sync.js push` | Push změn do Apps Script | 2-3s |
| `node sync.js pull` | Stáhnout projekt z Apps Script | 2-3s |
| `node sync.js info` | Info o projektu | < 1s |
| `node auth.js` | Znovu autentifikovat | 30s |

### Testing (detaily v TESTING.md)

```bash
# Lokální testy
node test-local.js                      # Všechny testy
node test-local.js testEmailValidation  # Specifický test
node test-local.js testURLParameterPrefill  # Test URL params
node test-local.js testWebhookPayload   # Test webhook payload

# Apps Script testy
# 1. node sync.js push
# 2. Otevřít deployment URL s parametry
# 3. View > Logs v Apps Script editoru
```

## 🔄 Typický daily workflow

```bash
# 1. Lokální test (ověření že validace fungují)
node test-local.js testEmailValidation

# 2. Upravit kód
vim Kód.gs

# 3. Další lokální test (quick check)
node test-local.js

# 4. Push do Apps Script
node sync.js push

# 5. Test v prohlížeči
# Otevřít: https://script.google.com/macros/s/.../exec?dealId=999&clientName=Test

# 6. Zkontrolovat logy
# Apps Script Editor > View > Logs

# 7. Commit do gitu
git add .
git commit -m "feat: add better validation logging"
git push
```

**Celkový čas per iteraci: < 10 sekund** ⚡

## 📁 Struktura projektu

```
apps-script-project/
├── Kód.gs              # Hlavní Apps Script kód
│                       # - doGet(e) - URL parameters handler
│                       # - sendToMake(formData) - webhook caller
│                       # - getFilmList() - načte filmy ze sheetu
│                       # - getFilmOptions(filmName) - načte detaily filmu
│
├── Index.html          # Formulář UI
│                       # - Bootstrap 5 styling
│                       # - Dynamic form logic (contract types)
│                       # - Client-side validation
│
├── constants.js        # Konfigurace a konstanty
│                       # - CONFIG (form name, max rows, atd.)
│                       # - IGNORED_SHEETS (které sheety ignorovat)
│                       # - PAYMENT_TYPES, CONTRACT_TYPES
│                       # - getWebhookUrl() - načte URL z Script Properties
│
├── validation.js       # Validační funkce (běží i v Node.js!)
│                       # - validateEmail()
│                       # - validateNumericField()
│                       # - validateRequiredString()
│                       # - validateEnum(), validateDateString()
│
├── test-local.js       # Lokální test runner (Node.js)
│                       # - Testuje validace bez Apps Script
│                       # - Simuluje URL parametry
│                       # - Testuje webhook payload strukturu
│
├── sync.js             # Sync script (pull/push)
├── auth.js             # Autentifikace
├── .env.example        # Environment variables template
├── TESTING.md          # Kompletní testing guide
└── README.md           # Tento soubor
```

## 🧪 Testing

### Lokální testy (bez Apps Script)

```bash
node test-local.js
```

**Co to testuje:**
- ✅ Email validace - `test@example.com` ✅, `invalid-email` ❌
- ✅ Numeric validace - `1500` ✅, `abc` ❌, `-100` ❌
- ✅ Required strings - prázdné hodnoty odmítnuty
- ✅ Enum validace - payment types, contract types
- ✅ Date validace - `2026-03-01` ✅, `invalid-date` ❌
- ✅ URL parameter simulation - všechny parametry validní
- ✅ Webhook payload struktura - formát OK

**Výhody:**
- Instant feedback (< 1s)
- Catch bugs before pushing
- No Apps Script environment needed

### Integration testy (v Apps Script)

Viz **TESTING.md** pro detailní návod včetně:
- URL parametry testing
- Webhook testing
- Error handling testing
- Real-world scenarios (flat fee, installments, ticket share, One+)

## 🔧 Konfigurace

### Script Properties (jednorázově)

Pro security, webhook URL by měla být v Script Properties, ne hard-coded:

1. Apps Script Editor > Project Settings
2. Script Properties > Add property
3. Property: `MAKE_WEBHOOK_URL`
4. Value: `https://hook.eu2.make.com/xr4qkia7cyvt65n9tn272b3d5wm0zum7`
5. Save

**Kód automaticky použije tento URL:**
```javascript
// V constants.js
function getWebhookUrl() {
  return PropertiesService.getScriptProperties().getProperty('MAKE_WEBHOOK_URL')
    || 'https://hook.eu2.make.com/...'; // fallback
}
```

### Deployment URL

**Current deployment:**
- Script ID: `1SReMMnLUJuOl842N7mD75hCNNqUB-3oibhd0Yuovxy7o73gwjwyCbwj3`
- Editor: https://script.google.com/d/1SRe.../edit
- Web App: https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec

**Vytvoření nového deployment:**
1. Apps Script Editor > Deploy > New deployment
2. Type: Web app
3. Execute as: Me
4. Who has access: Anyone
5. Deploy
6. Copy deployment ID

## 🛟 Řešení problémů

### Token expiroval

```bash
node auth.js
```

### Port 8888 je obsazený

Zavřete aplikaci používající port 8888 nebo změňte port v `auth.js`.

### Push selhává

```bash
# Zkontrolujte, že máte platný token
node auth.js

# Zkontrolujte projekt info
node sync.js info

# Zkuste pull nejprve
node sync.js pull

# Pak push
node sync.js push
```

### Lokální testy failují

```bash
# Zkontrolujte, že máte validation.js
ls -la validation.js

# Test jednotlivých funkcí
node test-local.js testEmailValidation

# Zkontrolujte syntax errors
node -c validation.js
```

### URL parametry nefungují

**Debugování:**
1. Otevřete Apps Script Editor > View > Logs
2. Najděte `=== doGet() START ===`
3. Zkontrolujte `URL parameters: {...}`
4. Ověřte, že parametry jsou tam

**Časté chyby:**
- URL encoding: mezery musí být `+` nebo `%20`
- Deployment ID je starý (create new deployment)
- Chybí parametry v URL

### Webhook volání failuje

**Debugování:**
1. Apps Script Editor > View > Logs
2. Najděte `=== sendToMake() START ===`
3. Zkontrolujte `Response status: ...`
4. Zkontrolujte `Response body: ...`

**Časté chyby:**
- Status 400: Make odmítl payload (check Make scenario)
- Status 401: Neplatná webhook URL
- Status 500: Make scenario error (check Make logs)

**Make.com debugging:**
1. Otevřete Make scenario
2. History > Latest execution
3. Zkontrolujte received data
4. Zkontrolujte mapping errors

## 💡 Best Practices

### Development

- ✅ **Vždy testujte lokálně** před pushem (`node test-local.js`)
- ✅ **Commitujte často** s clear messages
- ✅ **Používejte constants** místo hard-coded hodnot
- ✅ **Přidávejte logy** do nových funkcí
- ✅ **Validujte inputs** na backendu i frontendu
- ✅ **Test edge cases** (prázdné hodnoty, nevalidní data)

### Production

- ✅ **Nastavte Script Properties** pro webhook URL
- ✅ **Create stable deployment** (ne "Test deployment")
- ✅ **Monitor Make executions** - zkontrolujte že data přicházejí
- ✅ **Backup spreadsheet** - data o filmech
- ✅ **Document URL parameters** - jaké parametry jsou podporované

### Security

- ✅ **Webhook URL v Script Properties** (ne v kódu)
- ✅ **Validace na backendu** (ne jen frontend)
- ✅ **Sanitize user input** (před odesláním na webhook)
- ✅ **Error messages** - neodhalujte citlivé info
- ✅ **Git ignore** - `.token`, `.credentials.json`, `.env`

## 🎯 Co dál?

**Immediate next steps:**
1. ✅ Otestujte lokální validace: `node test-local.js`
2. ✅ Push kód do Apps Script: `node sync.js push`
3. ✅ Otestujte URL parametry v prohlížeči
4. ✅ Otestujte webhook odeslání
5. ✅ Zkontrolujte Make execution

**Long-term improvements:**
- [ ] Přidat více test cases do `test-local.js`
- [ ] Setup pre-commit hooks (linting, testing)
- [ ] Add CI/CD pipeline (auto-deploy on git push)
- [ ] Monitor webhook success rate
- [ ] Add error notifications (email when webhook fails)
- [ ] Performance monitoring (track sendToMake() duration)

## 📚 Dokumentace

- **TESTING.md** - Kompletní testing guide s real-world examples
- **constants.js** - Všechny konfigurace a konstanty
- **validation.js** - Dokumentace validačních funkcí
- **.env.example** - Environment variables template

## 🔗 Užitečné linky

- **Apps Script Editor**: https://script.google.com/d/1SRe.../edit
- **Google Apps Script Docs**: https://developers.google.com/apps-script
- **Make.com**: https://www.make.com/
- **Bootstrap 5 Docs**: https://getbootstrap.com/docs/5.3/

---

**Vytvořeno s Claude Code** 🤖
**Script ID**: `1SReMMnLUJuOl842N7mD75hCNNqUB-3oibhd0Yuovxy7o73gwjwyCbwj3`

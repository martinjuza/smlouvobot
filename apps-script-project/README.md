# Apps Script Development Workflow

Tento adresář obsahuje lokální kopii vašeho Google Apps Script projektu **Smlouvomat** a nástroje pro synchronizaci.

## 🚀 Rychlý start

### 1. První autentifikace (jen jednou)

```bash
node auth.js
```

Tento příkaz:
- Otevře prohlížeč s Google OAuth stránkou
- Po přihlášení uloží přístupový token do `.token`
- Token je platný několik hodin

**Pokud browser neotevře automaticky**, zkopírujte URL z terminálu a otevřete v prohlížeči.

### 2. Stáhněte projekt

```bash
node sync.js pull
```

Stáhne všechny soubory z Apps Script projektu:
- `Kód.gs` - hlavní kód
- `Index.html` - HTML rozhraní
- další soubory...

### 3. Upravte soubory lokálně

Můžete editovat soubory ve vašem oblíbeném editoru:
- `Kód.gs` - Google Apps Script kód
- `Index.html` - HTML šablony
- atd.

### 4. Nahrajte změny zpět

```bash
node sync.js push
```

Nahraje všechny lokální změny zpět do Apps Script projektu.

## 📋 Dostupné příkazy

| Příkaz | Popis |
|--------|-------|
| `node auth.js` | Autentifikace s Google (nutné před prvním použitím) |
| `node sync.js pull` | Stáhnout projekt z Apps Script |
| `node sync.js push` | Nahrát lokální změny do Apps Script |
| `node sync.js info` | Zobrazit informace o projektu |

## 🔄 Typický workflow

```bash
# 1. Stáhnout nejnovější verzi
node sync.js pull

# 2. Upravit soubory (Kód.gs, Index.html, ...)
# ... editujte v editoru ...

# 3. Nahrát změny
node sync.js push

# 4. Otestovat v Apps Script
# Otevřít https://script.google.com/d/1SReMMnLUJuOl842N7mD75hCNNqUB-3oibhd0Yuovxy7o73gwjwyCbwj3/edit
```

## 🔧 Technické detaily

- **Script ID**: `1SReMMnLUJuOl842N7mD75hCNNqUB-3oibhd0Yuovxy7o73gwjwyCbwj3`
- **API**: Google Apps Script API v1
- **Autentifikace**: OAuth 2.0 (využívá clasp credentials)

## 📁 Soubory

- `auth.js` - Autentifikační script
- `sync.js` - Synchronizační script (pull/push)
- `.token` - Access token (automaticky generovaný)
- `.credentials.json` - Plné OAuth credentials včetně refresh tokenu
- `.appsscript.json` - Metadata projektu

## 🛟 Řešení problémů

### Token expiroval

```bash
node auth.js
```

Znovu získá nový access token.

### Port 8888 je obsazený

Zavřete aplikaci používající port 8888 nebo změňte port v `auth.js`.

### Chyba API

Zkontrolujte, že:
1. Apps Script API je povolené v Google Cloud Console
2. Máte přístup k projektu (Script ID je správný)
3. Token je stále platný

## 💡 Výhody tohoto workflow

✅ **Žádné copy-paste** - přímá synchronizace
✅ **Lokální editor** - použijte VS Code, Vim, atd.
✅ **Git friendly** - verzování změn
✅ **Rychlé** - žádné čekání na UI
✅ **Automatizace** - možnost CI/CD

## 🎯 Next steps

Po úspěšném nastavení můžete:
- Používat git pro verzování (`git init`, `git add`, `git commit`)
- Nastavit pre-commit hooks pro linting
- Automatizovat deployment s CI/CD
- Psát testy lokálně

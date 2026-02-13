# Manuální získání přístupového tokenu

Protože běžíme na vzdáleném serveru, musíme použít Google OAuth Playground pro získání tokenu.

## Krok 1: Otevřete OAuth Playground

https://developers.google.com/oauthplayground/

## Krok 2: Konfigurace

1. Klikněte na **ikonu ozubeného kola (⚙️)** vpravo nahoře
2. Zaškrtněte **"Use your own OAuth credentials"**
3. Zadejte:
   - **OAuth Client ID**: `1072944905499-vm2v2i5dvn0a0d2o4ca36i1vge8cvbn0.apps.googleusercontent.com`
   - **OAuth Client secret**: `v6V3fKV_zWU7iw1DrpO1rknX`

## Krok 3: Výběr scope

1. V levém panelu najděte **"Apps Script API v1"** (nebo vyhledejte "script")
2. Zaškrtněte tyto scopes:
   - ✅ `https://www.googleapis.com/auth/script.projects`
   - ✅ `https://www.googleapis.com/auth/script.deployments`
   - ✅ `https://www.googleapis.com/auth/drive.file`

## Krok 4: Autorizace

1. Klikněte **"Authorize APIs"**
2. Přihlaste se svým Google účtem
3. Povolte přístup

## Krok 5: Získání tokenu

1. Klikněte **"Exchange authorization code for tokens"**
2. Zkopírujte **"Access token"** (dlouhý řetězec začínající "ya29...")

## Krok 6: Uložení tokenu

Spusťte tento příkaz (nahraďte YOUR_TOKEN_HERE skutečným tokenem):

```bash
cd /home/user/smlouvobot/apps-script-project
echo "YOUR_TOKEN_HERE" > .token
```

## Krok 7: Hotovo!

Teď můžete použít:

```bash
node sync.js pull   # Stáhnout projekt
node sync.js push   # Nahrát změny
node sync.js info   # Info o projektu
```

---

**Poznámka**: Access token vyprší za 1 hodinu. Pokud vyprší, opakujte kroky 4-6.
Pro dlouhodobé použití si uložte také **Refresh token** ze Step 5.

# Vytvoření vlastní OAuth aplikace

## Krok 1: Google Cloud Console

1. Otevřete: https://console.cloud.google.com/
2. Vytvořte nový projekt nebo vyberte existující
3. V menu přejděte na **APIs & Services** > **Credentials**

## Krok 2: Povolit Apps Script API

1. V menu **APIs & Services** > **Library**
2. Vyhledejte "Apps Script API"
3. Klikněte **Enable**

## Krok 3: Vytvořit OAuth Client ID

1. V **Credentials** klikněte **+ CREATE CREDENTIALS**
2. Vyberte **OAuth client ID**
3. Pokud nemáte OAuth consent screen, nastavte ho:
   - User Type: **External**
   - App name: "Apps Script Sync"
   - User support email: váš email
   - Developer contact: váš email
   - V Scopes přidejte: `https://www.googleapis.com/auth/script.projects`
   - V Test users přidejte váš email
   - Save

4. Vytvořte OAuth client:
   - Application type: **Desktop app**
   - Name: "Apps Script CLI"
   - Klikněte **CREATE**

5. Zkopírujte **Client ID** a **Client Secret**

## Krok 4: Použijte v OAuth Playground

1. Otevřete: https://developers.google.com/oauthplayground/
2. Klikněte na ⚙️ a zaškrtněte "Use your own OAuth credentials"
3. Zadejte svůj Client ID a Client Secret
4. V levém panelu do "Input your own scopes" zadejte:
   ```
   https://www.googleapis.com/auth/script.projects
   ```
5. Klikněte **Authorize APIs**
6. Po autorizaci klikněte **Exchange authorization code for tokens**
7. Zkopírujte **Access token**

## Krok 5: Uložte token

Pošlete mi access token nebo ho uložte sami:

```bash
cd /home/user/smlouvobot/apps-script-project
echo "VÁŠ_TOKEN" > .token
node sync.js pull
```

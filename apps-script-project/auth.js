#!/usr/bin/env node

/**
 * Simple OAuth authentication for Apps Script API
 * Opens browser and gets access token
 */

const http = require('http');
const { URL } = require('url');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

// Google OAuth credentials (clasp public client)
const CLIENT_ID = '1072944905499-vm2v2i5dvn0a0d2o4ca36i1vge8cvbn0.apps.googleusercontent.com';
const CLIENT_SECRET = 'v6V3fKV_zWU7iw1DrpO1rknX';
const REDIRECT_URI = 'http://localhost:8888';
const SCOPES = [
  'https://www.googleapis.com/auth/script.projects',
  'https://www.googleapis.com/auth/script.deployments',
  'https://www.googleapis.com/auth/drive.file'
];

const TOKEN_FILE = path.join(__dirname, '.token');
const CREDS_FILE = path.join(__dirname, '.credentials.json');

// Generate auth URL
function getAuthUrl() {
  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    redirect_uri: REDIRECT_URI,
    response_type: 'code',
    scope: SCOPES.join(' '),
    access_type: 'offline',
    prompt: 'consent'
  });

  return `https://accounts.google.com/o/oauth2/v2/auth?${params}`;
}

// Exchange code for tokens
async function exchangeCode(code) {
  const https = require('https');

  const postData = new URLSearchParams({
    code,
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET,
    redirect_uri: REDIRECT_URI,
    grant_type: 'authorization_code'
  }).toString();

  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'oauth2.googleapis.com',
      path: '/token',
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        if (res.statusCode === 200) {
          resolve(JSON.parse(body));
        } else {
          reject(new Error(`Token exchange failed: ${body}`));
        }
      });
    });

    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

// Start OAuth flow
async function authenticate() {
  console.log('🔐 Starting authentication...\n');

  const authUrl = getAuthUrl();

  console.log('Opening browser for authentication...');
  console.log('If browser doesn\'t open, visit this URL:\n');
  console.log(authUrl);
  console.log('');

  // Try to open browser
  const openCommand = process.platform === 'darwin' ? 'open' :
                     process.platform === 'win32' ? 'start' : 'xdg-open';

  exec(`${openCommand} "${authUrl}"`, (err) => {
    if (err) {
      console.log('Could not open browser automatically.');
    }
  });

  // Start local server to receive callback
  return new Promise((resolve, reject) => {
    const server = http.createServer(async (req, res) => {
      const url = new URL(req.url, REDIRECT_URI);

      if (url.pathname === '/') {
        const code = url.searchParams.get('code');
        const error = url.searchParams.get('error');

        if (error) {
          res.writeHead(200, { 'Content-Type': 'text/html' });
          res.end('<h1>❌ Authentication failed</h1><p>You can close this window.</p>');
          server.close();
          reject(new Error(`OAuth error: ${error}`));
          return;
        }

        if (code) {
          try {
            console.log('✅ Received authorization code');
            console.log('📝 Exchanging code for tokens...');

            const tokens = await exchangeCode(code);

            // Save access token
            fs.writeFileSync(TOKEN_FILE, tokens.access_token);
            console.log('✅ Access token saved to .token');

            // Save full credentials (including refresh token)
            fs.writeFileSync(CREDS_FILE, JSON.stringify(tokens, null, 2));
            console.log('✅ Full credentials saved to .credentials.json');

            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(`
              <html>
                <body style="font-family: Arial; text-align: center; padding: 50px;">
                  <h1>✅ Authentication Successful!</h1>
                  <p>You can close this window and return to your terminal.</p>
                  <script>setTimeout(() => window.close(), 2000);</script>
                </body>
              </html>
            `);

            server.close();
            resolve(tokens);
          } catch (err) {
            res.writeHead(500, { 'Content-Type': 'text/html' });
            res.end('<h1>❌ Token exchange failed</h1><p>Check console for details.</p>');
            server.close();
            reject(err);
          }
        }
      }
    });

    server.listen(8888, () => {
      console.log('Waiting for authentication...\n');
    });

    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.error('❌ Port 8888 is already in use.');
        console.error('Please close any other applications using this port and try again.');
      }
      reject(err);
    });
  });
}

// Main
if (require.main === module) {
  authenticate()
    .then(() => {
      console.log('\n✅ Authentication complete!');
      console.log('\nYou can now use:');
      console.log('  node sync.js pull   # Download your project');
      console.log('  node sync.js push   # Upload your changes');
      console.log('  node sync.js info   # Show project info');
      process.exit(0);
    })
    .catch((err) => {
      console.error('\n❌ Authentication failed:', err.message);
      process.exit(1);
    });
}

module.exports = { authenticate };

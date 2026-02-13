#!/usr/bin/env node

/**
 * Apps Script Sync Tool
 * Synchronizes local files with Google Apps Script project
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

const SCRIPT_ID = '1SReMMnLUJuOl842N7mD75hCNNqUB-3oibhd0Yuovxy7o73gwjwyCbwj3';
const TOKEN_FILE = path.join(__dirname, '.token');

// Read access token from file or environment
function getAccessToken() {
  if (process.env.GOOGLE_ACCESS_TOKEN) {
    return process.env.GOOGLE_ACCESS_TOKEN;
  }

  if (fs.existsSync(TOKEN_FILE)) {
    return fs.readFileSync(TOKEN_FILE, 'utf8').trim();
  }

  console.error('Error: No access token found.');
  console.error('Please set GOOGLE_ACCESS_TOKEN environment variable or create .token file');
  console.error('\nTo get an access token:');
  console.error('1. Visit: https://developers.google.com/oauthplayground/');
  console.error('2. Click gear icon (⚙️) and check "Use your own OAuth credentials"');
  console.error('3. Enter these scopes: https://www.googleapis.com/auth/script.projects');
  console.error('4. Authorize and get the access token');
  console.error('5. Save it to .token file or export GOOGLE_ACCESS_TOKEN=your_token');
  process.exit(1);
}

// Make API request
function apiRequest(method, endpoint, data = null) {
  return new Promise((resolve, reject) => {
    const token = getAccessToken();
    const options = {
      hostname: 'script.googleapis.com',
      path: endpoint,
      method: method,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(JSON.parse(body || '{}'));
        } else {
          reject(new Error(`API Error ${res.statusCode}: ${body}`));
        }
      });
    });

    req.on('error', reject);

    if (data) {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
}

// Pull project from Apps Script
async function pull() {
  console.log('📥 Pulling project from Apps Script...');

  try {
    const project = await apiRequest('GET', `/v1/projects/${SCRIPT_ID}/content`);

    console.log(`✅ Retrieved ${project.files.length} files`);

    // Save files locally
    for (const file of project.files) {
      const filename = file.name + (file.type === 'SERVER_JS' ? '.gs' : '.html');
      const filepath = path.join(__dirname, filename);

      fs.writeFileSync(filepath, file.source);
      console.log(`   📄 ${filename}`);
    }

    // Save metadata
    fs.writeFileSync(
      path.join(__dirname, '.appsscript.json'),
      JSON.stringify(project, null, 2)
    );

    console.log('\n✅ Pull complete! Files are ready for editing.');
  } catch (error) {
    console.error('❌ Pull failed:', error.message);
    process.exit(1);
  }
}

// Push local changes to Apps Script
async function push() {
  console.log('📤 Pushing changes to Apps Script...');

  try {
    // Read local files
    const files = [];
    const localFiles = fs.readdirSync(__dirname);

    for (const filename of localFiles) {
      if (filename.endsWith('.gs')) {
        files.push({
          name: filename.replace('.gs', ''),
          type: 'SERVER_JS',
          source: fs.readFileSync(path.join(__dirname, filename), 'utf8')
        });
      } else if (filename.endsWith('.html')) {
        files.push({
          name: filename.replace('.html', ''),
          type: 'HTML',
          source: fs.readFileSync(path.join(__dirname, filename), 'utf8')
        });
      }
    }

    if (files.length === 0) {
      console.error('❌ No .gs or .html files found to push');
      process.exit(1);
    }

    // Push to Apps Script
    const result = await apiRequest('PUT', `/v1/projects/${SCRIPT_ID}/content`, { files });

    console.log(`✅ Pushed ${files.length} files successfully`);
    files.forEach(f => console.log(`   📄 ${f.name}`));

  } catch (error) {
    console.error('❌ Push failed:', error.message);
    process.exit(1);
  }
}

// Get project info
async function info() {
  console.log('ℹ️  Project Information\n');

  try {
    const project = await apiRequest('GET', `/v1/projects/${SCRIPT_ID}`);

    console.log(`Title: ${project.title}`);
    console.log(`Script ID: ${SCRIPT_ID}`);
    console.log(`Created: ${new Date(project.createTime).toLocaleString()}`);
    console.log(`Updated: ${new Date(project.updateTime).toLocaleString()}`);

  } catch (error) {
    console.error('❌ Failed to get info:', error.message);
    process.exit(1);
  }
}

// Main CLI
const command = process.argv[2];

switch (command) {
  case 'pull':
    pull();
    break;
  case 'push':
    push();
    break;
  case 'info':
    info();
    break;
  default:
    console.log('Apps Script Sync Tool\n');
    console.log('Usage:');
    console.log('  node sync.js pull   - Download project from Apps Script');
    console.log('  node sync.js push   - Upload local changes to Apps Script');
    console.log('  node sync.js info   - Show project information');
    console.log('\nProject ID:', SCRIPT_ID);
}

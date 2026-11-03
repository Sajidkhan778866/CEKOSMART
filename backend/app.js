/**
 * cPanel Phusion Passenger Startup Entry Point
 * 
 * CloudLinux / cPanel "Setup Node.js App" looks for an application startup file (app.js).
 * This entry point initializes environment variables and boots the compiled Express API server.
 */

const path = require('path');
const fs = require('fs');

// Ensure local .env file in the backend root is loaded if present
const envPath = path.resolve(__dirname, '.env');
if (fs.existsSync(envPath)) {
  require('dotenv').config({ path: envPath });
} else {
  require('dotenv').config();
}

// Locate the compiled TypeScript server
const distServerPath = path.resolve(__dirname, 'dist', 'server.js');

if (!fs.existsSync(distServerPath)) {
  console.error('[cPanel Startup Error] Compiled server not found at: ' + distServerPath);
  console.error('Please run "npm run build" in the backend directory or cPanel terminal before starting the app.');
  process.exit(1);
}

// Require and run the compiled server
require(distServerPath);

// Export the underlying Express application instance for Passenger frameworks
module.exports = require('./dist/app').default || require('./dist/app');

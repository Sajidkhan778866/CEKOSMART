/**
 * Root cPanel Phusion Passenger Startup Entry Point
 *
 * Allows cPanel "Setup Node.js App" to use either the workspace root OR the backend/
 * directory as the Application Root.
 */
module.exports = require('./backend/app.js');

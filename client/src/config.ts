// API configuration for client-side use
// No process.env access in the browser

// Default to relative URLs
let apiBaseUrl = '';

// For local development, we want to use the actual server URL
// Use window.location to determine the current host
const isLocalhost = window.location.hostname === 'localhost' || 
                   window.location.hostname === '127.0.0.1';

if (isLocalhost) {
  // When running locally, ensure we connect to the right port
  const protocol = window.location.protocol;
  const hostname = window.location.hostname;
  const port = '5000'; // Default port for the server
  
  apiBaseUrl = `${protocol}//${hostname}:${port}`;
  console.log('Using API base URL for local development:', apiBaseUrl);
}

export const config = {
  apiBaseUrl,
};

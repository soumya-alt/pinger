// Service Worker for URL Pinger
const CACHE_NAME = 'url-pinger-v1';
const PING_INTERVAL = 60000; // 1 minute
const TARGET_URL = 'https://discord-welcome-bot-4ssw.onrender.com/';

// Install event - cache assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll([
        '/',
        '/index.html',
        '/styles.css',
        '/script.js'
      ]);
    })
  );
  
  // Skip waiting to activate immediately
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  
  // Claim clients to ensure the service worker controls all pages
  event.waitUntil(clients.claim());
  
  // Start pinging automatically when service worker activates
  startPinging(TARGET_URL);
});

// Background ping functionality
let pingInterval;
let targetUrl = null;

// Function to ping the URL
async function pingUrl(url) {
  try {
    const startTime = Date.now();
    const response = await fetch(url, { method: 'HEAD', mode: 'no-cors' });
    const endTime = Date.now();
    const responseTime = endTime - startTime;
    
    // Store the ping result in IndexedDB
    const db = await openDB();
    await addPingLog(db, {
      timestamp: new Date().toISOString(),
      url: url,
      success: true,
      responseTime: responseTime
    });
    
    // Notify any open clients
    self.clients.matchAll().then(clients => {
      clients.forEach(client => {
        client.postMessage({
          type: 'pingResult',
          success: true,
          responseTime: responseTime,
          timestamp: new Date().toISOString()
        });
      });
    });
  } catch (error) {
    // Store the error in IndexedDB
    const db = await openDB();
    await addPingLog(db, {
      timestamp: new Date().toISOString(),
      url: url,
      success: false,
      error: error.message
    });
    
    // Notify any open clients
    self.clients.matchAll().then(clients => {
      clients.forEach(client => {
        client.postMessage({
          type: 'pingResult',
          success: false,
          error: error.message,
          timestamp: new Date().toISOString()
        });
      });
    });
  }
}

// Start pinging function
function startPinging(url) {
  targetUrl = url;
  
  // Clear any existing interval
  if (pingInterval) {
    clearInterval(pingInterval);
  }
  
  // Start pinging
  pingUrl(targetUrl);
  pingInterval = setInterval(() => pingUrl(targetUrl), PING_INTERVAL);
  
  // Notify any open clients
  self.clients.matchAll().then(clients => {
    clients.forEach(client => {
      client.postMessage({
        type: 'pingingStarted',
        url: targetUrl
      });
    });
  });
}

// IndexedDB setup
function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('PingLogsDB', 1);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains('pingLogs')) {
        db.createObjectStore('pingLogs', { keyPath: 'timestamp' });
      }
    };
  });
}

function addPingLog(db, log) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['pingLogs'], 'readwrite');
    const store = transaction.objectStore('pingLogs');
    const request = store.add(log);
    
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

// Message handling from the client
self.addEventListener('message', (event) => {
  if (event.data.type === 'startPinging') {
    startPinging(event.data.url);
  } 
  else if (event.data.type === 'stopPinging') {
    if (pingInterval) {
      clearInterval(pingInterval);
      pingInterval = null;
      targetUrl = null;
      
      // Notify client that pinging has stopped
      event.source.postMessage({
        type: 'pingingStopped'
      });
    }
  }
  else if (event.data.type === 'getLogs') {
    // Retrieve logs from IndexedDB and send to client
    openDB().then(db => {
      const transaction = db.transaction(['pingLogs'], 'readonly');
      const store = transaction.objectStore('pingLogs');
      const request = store.getAll();
      
      request.onsuccess = () => {
        event.source.postMessage({
          type: 'pingLogs',
          logs: request.result
        });
      };
    });
  }
}); 
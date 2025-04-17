// DOM Elements
const urlInput = document.getElementById('urlInput');
const startButton = document.getElementById('startPing');
const stopButton = document.getElementById('stopPing');
const pingStatus = document.getElementById('pingStatus');
const lastPingTime = document.getElementById('lastPingTime');
const pingLogs = document.getElementById('pingLogs');

// Target URL to ping
const TARGET_URL = 'https://discord-welcome-bot-4ssw.onrender.com/';

// Ping interval ID
let pingInterval = null;

// Store logs in localStorage
function saveLogs(logs) {
    try {
        localStorage.setItem('pingLogs', JSON.stringify(logs));
    } catch (error) {
        console.error('Error saving logs:', error);
    }
}

// Load logs from localStorage
function loadLogs() {
    try {
        const logs = localStorage.getItem('pingLogs');
        return logs ? JSON.parse(logs) : [];
    } catch (error) {
        console.error('Error loading logs:', error);
        return [];
    }
}

// Function to add a log entry
function addLogEntry(message, isError = false) {
    const logEntry = {
        timestamp: new Date().toISOString(),
        message,
        isError
    };

    // Add to UI
    const logElement = document.createElement('div');
    logElement.className = `log-entry ${isError ? 'error' : 'success'}`;
    logElement.textContent = `[${new Date(logEntry.timestamp).toLocaleTimeString()}] ${message}`;
    pingLogs.insertBefore(logElement, pingLogs.firstChild);

    // Save to localStorage
    const logs = loadLogs();
    logs.unshift(logEntry);
    // Keep only last 100 logs
    if (logs.length > 100) {
        logs.pop();
    }
    saveLogs(logs);
}

// Function to display stored logs
function displayStoredLogs() {
    const logs = loadLogs();
    pingLogs.innerHTML = '';
    logs.forEach(log => {
        const logElement = document.createElement('div');
        logElement.className = `log-entry ${log.isError ? 'error' : 'success'}`;
        logElement.textContent = `[${new Date(log.timestamp).toLocaleTimeString()}] ${log.message}`;
        pingLogs.appendChild(logElement);
    });
}

// Function to ping URL
async function pingUrl(url) {
    try {
        const startTime = performance.now();
        
        // Use no-cors mode to avoid CORS issues
        const response = await fetch(url, {
            method: 'HEAD',
            mode: 'no-cors',
            cache: 'no-store'
        });
        
        const endTime = performance.now();
        const responseTime = Math.round(endTime - startTime);
        
        lastPingTime.textContent = new Date().toLocaleTimeString();
        addLogEntry(`Ping successful - Response time: ${responseTime}ms`);
        pingStatus.textContent = 'Active';
        pingStatus.style.color = '#2ecc71';
        
        return true;
    } catch (error) {
        console.error('Ping error:', error);
        lastPingTime.textContent = new Date().toLocaleTimeString();
        addLogEntry(`Ping failed - ${error.message}`, true);
        pingStatus.textContent = 'Error';
        pingStatus.style.color = '#e74c3c';
        
        return false;
    }
}

// Function to start pinging
function startPinging(url) {
    if (!url) {
        alert('Please enter a valid URL');
        return;
    }

    // Clear any existing interval
    if (pingInterval) {
        clearInterval(pingInterval);
    }

    // Update status
    pingStatus.textContent = 'Starting...';
    pingStatus.style.color = '#f39c12';
    addLogEntry(`Starting to ping ${url}`);

    // Perform initial ping
    pingUrl(url);

    // Set up interval for subsequent pings
    pingInterval = setInterval(() => pingUrl(url), 60000); // 60000ms = 1 minute

    // Store the active state
    localStorage.setItem('isPinging', 'true');
    localStorage.setItem('targetUrl', url);
}

// Function to stop pinging
function stopPinging() {
    if (pingInterval) {
        clearInterval(pingInterval);
        pingInterval = null;
        
        pingStatus.textContent = 'Stopped';
        pingStatus.style.color = '#666';
        addLogEntry('Pinging stopped');
        
        // Clear the active state
        localStorage.removeItem('isPinging');
        localStorage.removeItem('targetUrl');
    }
}

// Event listeners
startButton.addEventListener('click', () => {
    const url = urlInput.value.trim();
    startPinging(url);
});

stopButton.addEventListener('click', stopPinging);

// Initialize the application
function initializeApp() {
    // Pre-fill the URL input
    urlInput.value = TARGET_URL;
    
    // Display stored logs
    displayStoredLogs();
    
    // Check if we were pinging before page reload
    const wasPinging = localStorage.getItem('isPinging') === 'true';
    const savedUrl = localStorage.getItem('targetUrl');
    
    if (wasPinging && savedUrl) {
        startPinging(savedUrl);
    }
}

// Handle page visibility changes
document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
        // When page becomes visible, check if we should be pinging
        const wasPinging = localStorage.getItem('isPinging') === 'true';
        const savedUrl = localStorage.getItem('targetUrl');
        
        if (wasPinging && savedUrl) {
            // Restart pinging to ensure it's running
            startPinging(savedUrl);
        }
    }
});

// Initialize when page loads
window.addEventListener('load', initializeApp); 
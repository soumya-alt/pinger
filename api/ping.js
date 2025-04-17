const https = require('https');

// The URL to ping
const targetUrl = 'https://discord-welcome-bot-4ssw.onrender.com/';

// Function to ping the URL
async function pingUrl() {
    return new Promise((resolve, reject) => {
        console.log(`[${new Date().toISOString()}] Attempting to ping: ${targetUrl}`);
        
        const startTime = Date.now();
        
        const req = https.get(targetUrl, (response) => {
            const endTime = Date.now();
            const responseTime = endTime - startTime;
            
            console.log(`[${new Date().toISOString()}] Ping successful!`);
            console.log(`Status: ${response.statusCode}`);
            console.log(`Response time: ${responseTime}ms`);
            
            resolve({
                success: true,
                status: response.statusCode,
                responseTime: `${responseTime}ms`,
                timestamp: new Date().toISOString()
            });
        });

        req.on('error', (error) => {
            console.error(`[${new Date().toISOString()}] Ping failed:`, error.message);
            
            reject({
                success: false,
                error: error.message,
                timestamp: new Date().toISOString()
            });
        });

        // Set a timeout of 10 seconds
        req.setTimeout(10000, () => {
            req.destroy();
            reject({
                success: false,
                error: 'Request timed out after 10 seconds',
                timestamp: new Date().toISOString()
            });
        });
    });
}

// Serverless function handler
module.exports = async (req, res) => {
    try {
        // Set CORS headers
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

        // Handle OPTIONS request for CORS
        if (req.method === 'OPTIONS') {
            res.status(200).end();
            return;
        }

        // Perform the ping
        const result = await pingUrl();
        
        // Return the result
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
}; 
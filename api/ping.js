const fetch = require('node-fetch');

// The URL to ping
const TARGET_URL = 'https://discord-welcome-bot-4ssw.onrender.com/';

// Function to ping the URL
async function pingUrl() {
    try {
        const startTime = Date.now();
        const response = await fetch(TARGET_URL, {
            method: 'HEAD',
            headers: {
                'Cache-Control': 'no-cache'
            }
        });
        const endTime = Date.now();
        const responseTime = endTime - startTime;
        
        console.log(`Ping successful - Response time: ${responseTime}ms`);
        return { success: true, responseTime };
    } catch (error) {
        console.error(`Ping failed: ${error.message}`);
        return { success: false, error: error.message };
    }
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
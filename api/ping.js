const https = require('https');

// The URL to ping
const TARGET_URL = 'https://soumya-alt.github.io/portfolio/';

// Function to ping the URL
async function pingUrl() {
    console.log(`[${new Date().toISOString()}] Attempting to ping: ${TARGET_URL}`);
    
    const startTime = Date.now();
    
    https.get(TARGET_URL, (response) => {
        const endTime = Date.now();
        const responseTime = endTime - startTime;
        
        console.log(`[${new Date().toISOString()}] Ping successful!`);
        console.log(`Status: ${response.statusCode}`);
        console.log(`Response time: ${responseTime}ms`);
        
        return {
            success: true,
            status: response.statusCode,
            responseTime: `${responseTime}ms`,
            timestamp: new Date().toISOString()
        };
    }).on('error', (error) => {
        console.error(`[${new Date().toISOString()}] Ping failed:`, error.message);
        
        return {
            success: false,
            error: error.message,
            timestamp: new Date().toISOString()
        };
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
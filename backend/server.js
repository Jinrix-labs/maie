const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Proxy endpoint for Anthropic API
app.post('/api/chat', async (req, res) => {
    try {
        const { messages, system } = req.body;

        // Check if API key is set
        if (!process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY === 'your_api_key_here') {
            return res.status(500).json({
                error: 'API key not configured',
                details: 'Please set ANTHROPIC_API_KEY in Vercel environment variables'
            });
        }

        console.log('Making API request with messages:', messages.length);

        const response = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': process.env.ANTHROPIC_API_KEY,
                'anthropic-version': '2023-06-01'
            },
            body: JSON.stringify({
                model: 'claude-3-haiku-20240307',
                max_tokens: 1000,
                messages: messages,
                system: system
            })
        });

        console.log('API response status:', response.status);

        if (!response.ok) {
            const errorText = await response.text();
            console.error('API error response:', errorText);
            throw new Error(`API request failed: ${response.status} - ${errorText}`);
        }

        const data = await response.json();
        console.log('API response data:', JSON.stringify(data, null, 2));
        res.json(data);
    } catch (error) {
        console.error('Proxy error:', error);
        res.status(500).json({
            error: 'Failed to process request',
            details: error.message
        });
    }
});

// Export the app for Vercel
module.exports = app;
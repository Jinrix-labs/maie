const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Proxy endpoint for Anthropic API
app.post('/api/chat', async (req, res) => {
    try {
        const { messages, system, model } = req.body;

        // Format system prompt with caching for ~90% cost savings
        const systemWithCache = [
            {
                type: 'text',
                text: system || '',
                cache_control: { type: 'ephemeral' }
            }
        ];

        const response = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': process.env.ANTHROPIC_API_KEY,
                'anthropic-version': '2023-06-01'
            },
            body: JSON.stringify({
                model: model || 'claude-3-haiku-20240307', // Use provided model or fallback to default
                max_tokens: 300, // Reduced to keep responses concise and costs down
                messages: messages,
                system: systemWithCache // Now an array with cache_control for cost savings
            })
        });

        if (!response.ok) {
            throw new Error(`API request failed: ${response.status}`);
        }

        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error('Proxy error:', error);
        res.status(500).json({
            error: 'Failed to process request',
            details: error.message
        });
    }
});

app.listen(PORT, () => {
    console.log(`Proxy server running on port ${PORT}`);
});

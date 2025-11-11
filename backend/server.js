const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());

// Log all requests for debugging
app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`);
    next();
});

// JSON body parser with error handling
app.use(express.json({ limit: '10mb' }));

// Handle JSON parsing errors
app.use((err, req, res, next) => {
    if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
        console.error('JSON parsing error:', err.message);
        return res.status(400).json({
            error: 'Invalid JSON',
            details: err.message
        });
    }
    next(err);
});

// Proxy endpoint for Anthropic API
app.post('/api/chat', async (req, res) => {
    try {
        console.log('Received request body:', JSON.stringify(req.body, null, 2));
        console.log('Request headers:', req.headers);
        
        const { messages, system, model } = req.body;

        // Validate request body
        if (!messages || !Array.isArray(messages) || messages.length === 0) {
            console.error('Validation failed: messages is invalid', { messages });
            return res.status(400).json({
                error: 'Invalid request',
                details: 'Messages array is required and must not be empty'
            });
        }

        // Check if API key is set
        if (!process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY === 'your_api_key_here') {
            return res.status(500).json({
                error: 'API key not configured',
                details: 'Please set ANTHROPIC_API_KEY in environment variables'
            });
        }

        console.log('Making API request with messages:', messages.length);

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
                max_tokens: 400, // MVP limit: sweet spot for thoughtful 2-3 paragraph responses
                messages: messages,
                system: systemWithCache // Now an array with cache_control for cost savings
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
        // Ensure we always send JSON, even if there's an error
        if (!res.headersSent) {
            res.status(500).json({
                error: 'Failed to process request',
                details: error.message
            });
        }
    }
});

// Global error handler middleware
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    if (!res.headersSent) {
        res.status(500).json({
            error: 'Internal server error',
            details: err.message
        });
    }
});

// Export the app for Vercel
module.exports = app;

// Start server when run directly (for local development)
if (require.main === module) {
    const PORT = process.env.PORT || 3001;
    app.listen(PORT, () => {
        console.log(`Proxy server running on port ${PORT}`);
        console.log(`ANTHROPIC_API_KEY is ${process.env.ANTHROPIC_API_KEY ? 'set' : 'NOT set'}`);
    });
}
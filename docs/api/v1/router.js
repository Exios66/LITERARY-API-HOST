import { getQuestions } from './questions.js';
import API_CONFIG from './config.js';

// Router function to handle API requests
export async function handleRequest(request) {
    const url = new URL(request.url);
    const path = url.pathname;
    const params = Object.fromEntries(url.searchParams);

    // Add CORS headers
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
    };

    // Handle OPTIONS request for CORS
    if (request.method === 'OPTIONS') {
        return new Response(null, { headers });
    }

    try {
        // Route requests
        if (path.startsWith('/api/v1/questions')) {
            const category = path.split('/').pop();
            return new Response(
                JSON.stringify(await getQuestions(
                    category,
                    parseInt(params.limit) || API_CONFIG.defaultLimit,
                    params.random !== 'false',
                    params.difficulty ? parseInt(params.difficulty) : null
                )),
                { headers }
            );
        }

        // 404 for unknown endpoints
        return new Response(
            JSON.stringify({ 
                status: 'error', 
                message: 'Endpoint not found' 
            }),
            { 
                status: 404,
                headers 
            }
        );

    } catch (error) {
        return new Response(
            JSON.stringify({ 
                status: 'error', 
                message: error.message 
            }),
            { 
                status: 500,
                headers 
            }
        );
    }
} 
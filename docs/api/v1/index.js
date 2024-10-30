import { handleRequest } from './router.js';

// Entry point for API requests
addEventListener('fetch', event => {
    event.respondWith(handleRequest(event.request));
}); 
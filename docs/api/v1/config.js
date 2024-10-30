const API_CONFIG = {
    version: 'v1',
    baseUrl: 'https://exios66.github.io/LITERARY-API-HOST',
    endpoints: {
        questions: '/api/v1/questions',
        categories: '/api/v1/categories'
    },
    defaultLimit: 10,
    maxLimit: 50,
    categories: [
        'astronomy',
        'literature',
        'mathematics',
        'general-knowledge',
        'psychology',
        'american-history'
    ]
};

export default API_CONFIG; 
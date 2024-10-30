// Handle question retrieval requests
function getQuestions(category, limit = 10, random = true, difficulty = null) {
    const validCategories = [
        'astronomy',
        'literature',
        'mathematics',
        'general-knowledge',
        'psychology',
        'american-history'
    ];
    
    // Normalize category name
    category = category.toLowerCase().replace(' ', '-');
    
    if (!validCategories.includes(category)) {
        return {
            status: 'error',
            message: 'Invalid category'
        };
    }
    
    // Fetch questions from CSV/JSON file
    const questions = fetchQuestionsFromFile(category);
    
    // Apply filters
    let filteredQuestions = questions;
    if (difficulty !== null) {
        filteredQuestions = filteredQuestions.filter(q => q.difficulty === difficulty);
    }
    
    // Randomize if requested
    if (random) {
        filteredQuestions = shuffleArray(filteredQuestions);
    }
    
    // Apply limit
    filteredQuestions = filteredQuestions.slice(0, limit);
    
    return {
        status: 'success',
        data: {
            questions: filteredQuestions
        }
    };
}

// Helper function to shuffle array
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// Helper function to fetch questions from file
function fetchQuestionsFromFile(category) {
    // Implementation will depend on your hosting setup
    // For GitHub Pages, we'll need to fetch from the raw CSV/JSON files
    const baseUrl = 'https://exios66.github.io/LITERARY-API-HOST/docs/data';
    return fetch(`${baseUrl}/${category}-questions.json`)
        .then(response => response.json())
        .catch(error => {
            console.error('Error fetching questions:', error);
            return [];
        });
} 
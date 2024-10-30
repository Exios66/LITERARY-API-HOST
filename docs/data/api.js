// This file provides client-side routing for the static JSON files
class LiteraryVaultAPI {
    constructor(baseUrl = 'https://exios66.github.io/LITERARY-API-HOST/docs/data') {
        this.baseUrl = baseUrl;
    }

    async getQuestions(category, options = {}) {
        const { limit = 10, random = true, difficulty = null } = options;
        
        try {
            const response = await fetch(`${this.baseUrl}/${category}-questions.json`);
            if (!response.ok) throw new Error('Category not found');
            
            let { questions } = await response.json();
            
            // Apply filters
            if (difficulty !== null) {
                questions = questions.filter(q => q.difficulty === difficulty);
            }
            
            // Randomize if requested
            if (random) {
                questions = this.shuffleArray([...questions]);
            }
            
            // Apply limit
            questions = questions.slice(0, limit);
            
            // Convert to OpenAI API format
            const formattedQuestions = questions.map(q => ({
                category: q.knowledge_category,
                type: 'multiple',
                difficulty: ['easy', 'medium', 'hard', 'expert'][q.difficulty],
                question: q.question,
                correct_answer: q.correct_answer,
                incorrect_answers: [q.choice_1, q.choice_2, q.choice_3]
            }));
            
            return {
                response_code: 0,
                results: formattedQuestions
            };
            
        } catch (error) {
            return {
                response_code: 1,
                results: []
            };
        }
    }

    async getCategories() {
        try {
            const response = await fetch(`${this.baseUrl}/categories.json`);
            if (!response.ok) throw new Error('Categories not found');
            return await response.json();
        } catch (error) {
            return {
                status: 'error',
                message: error.message
            };
        }
    }

    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }
}

// Make API available globally
window.LiteraryVaultAPI = LiteraryVaultAPI; 
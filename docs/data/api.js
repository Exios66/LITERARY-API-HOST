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
            
            return {
                status: 'success',
                data: { questions }
            };
            
        } catch (error) {
            return {
                status: 'error',
                message: error.message
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
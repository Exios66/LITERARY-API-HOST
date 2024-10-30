// This file provides client-side routing for the static JSON files
class LiteraryVaultAPI {
    constructor(baseUrl = 'https://raw.githubusercontent.com/Exios66/LITERARY-API-HOST/main/docs/data') {
        this.baseUrl = baseUrl;
    }

    async getQuestions(category, options = {}) {
        const { limit = 10, random = true, difficulty = null } = options;
        
        try {
            const response = await fetch(`${this.baseUrl}/${category}-questions.csv`);
            if (!response.ok) throw new Error('Category not found');
            
            const csvText = await response.text();
            const questions = this.parseCSV(csvText);
            
            // Apply filters
            let filteredQuestions = questions;
            if (difficulty !== null) {
                filteredQuestions = filteredQuestions.filter(q => parseInt(q.Difficulty) === difficulty);
            }
            
            // Randomize if requested
            if (random) {
                filteredQuestions = this.shuffleArray([...filteredQuestions]);
            }
            
            // Apply limit
            filteredQuestions = filteredQuestions.slice(0, limit);
            
            // Convert to OpenAI format
            const formattedQuestions = filteredQuestions.map(q => ({
                category: q['Knowledge Category'],
                type: 'multiple',
                difficulty: ['easy', 'medium', 'hard', 'expert'][parseInt(q.Difficulty)],
                question: q.Question,
                correct_answer: q['Correct Answer'],
                incorrect_answers: [
                    q['Choice 1'],
                    q['Choice 2'],
                    q['Choice 3']
                ]
            }));
            
            return {
                response_code: 0,
                results: formattedQuestions
            };
            
        } catch (error) {
            console.error('Error fetching questions:', error);
            return {
                response_code: 1,
                results: []
            };
        }
    }

    parseCSV(csvText) {
        const lines = csvText.split('\n');
        const headers = lines[0].split(',').map(h => h.trim());
        
        return lines.slice(1)
            .filter(line => line.trim())
            .map(line => {
                const values = line.split(',').map(v => v.trim());
                const question = {};
                headers.forEach((header, index) => {
                    question[header] = values[index];
                });
                return question;
            });
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
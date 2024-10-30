import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, '../../data/csv');

export class DataLoader {
    constructor() {
        this.categories = [
            'astronomy',
            'literature',
            'mathematics',
            'general-knowledge',
            'psychology',
            'american-history'
        ];
        this.cache = new Map();
    }

    async loadQuestions(category) {
        if (!this.categories.includes(category.toLowerCase())) {
            throw new Error(`Invalid category: ${category}`);
        }

        const cacheKey = `${category}-questions`;
        if (this.cache.has(cacheKey)) {
            return this.cache.get(cacheKey);
        }

        const filePath = path.join(DATA_DIR, `${category}-questions.csv`);
        try {
            const data = await fs.promises.readFile(filePath, 'utf8');
            const questions = this._parseCSV(data);
            const formattedQuestions = this._formatQuestionsForAPI(questions);
            this.cache.set(cacheKey, formattedQuestions);
            return formattedQuestions;
        } catch (error) {
            console.error(`Error loading ${category} questions:`, error);
            throw new Error(`Failed to load ${category} questions`);
        }
    }

    _parseCSV(csvData) {
        // Simple CSV parsing (you might want to use a proper CSV parser)
        const lines = csvData.split('\n');
        const headers = lines[0].split(',');
        return lines.slice(1).map(line => {
            const values = line.split(',');
            return headers.reduce((obj, header, index) => {
                obj[header.trim()] = values[index]?.trim() || '';
                return obj;
            }, {});
        }).filter(obj => obj.question); // Filter out empty rows
    }

    _formatQuestionsForAPI(questions) {
        return questions.map(q => ({
            question: q.question,
            options: [
                q.correct_answer,
                q.choice_1,
                q.choice_2,
                q.choice_3
            ].filter(Boolean).sort(() => Math.random() - 0.5), // Randomize options
            answer: q.correct_answer
        }));
    }

    clearCache() {
        this.cache.clear();
    }
}

export const dataLoader = new DataLoader();
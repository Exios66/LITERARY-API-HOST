import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, '../../data');

export class DataLoader {
    constructor() {
        this.categories = [
            'Astronomy',
            'Literature',
            'Mathematics',
            'General-Knowledge',
            'Psychology',
            'American-History'
        ];
        this.cache = new Map();
    }

    async loadQuestions(category) {
        if (!this.categories.includes(category)) {
            throw new Error(`Invalid category: ${category}`);
        }

        const cacheKey = `${category}-questions`;
        if (this.cache.has(cacheKey)) {
            return this.cache.get(cacheKey);
        }

        const filePath = path.join(DATA_DIR, `${category}-questions.csv`);
        try {
            const data = await fs.promises.readFile(filePath, 'utf8');
            this.cache.set(cacheKey, data);
            return data;
        } catch (error) {
            console.error(`Error loading ${category} questions:`, error);
            throw new Error(`Failed to load ${category} questions`);
        }
    }

    clearCache() {
        this.cache.clear();
    }
}

export const dataLoader = new DataLoader(); 
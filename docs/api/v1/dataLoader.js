import { parse } from 'csv-parse/sync';
import { readFileSync } from 'fs';
import path from 'path';

export class QuestionDataLoader {
    constructor() {
        this.cache = new Map();
        this.dataDir = path.join(process.cwd(), 'docs/data');
    }

    loadQuestions(category) {
        // Check cache first
        if (this.cache.has(category)) {
            return this.cache.get(category);
        }

        try {
            // Load and parse CSV file
            const filePath = path.join(this.dataDir, `${category}-questions.csv`);
            const fileContent = readFileSync(filePath, 'utf-8');
            const records = parse(fileContent, {
                columns: true,
                skip_empty_lines: true
            });

            // Transform to standard format
            const questions = records.map(record => ({
                id: record.ID,
                question: record.Question,
                correct_answer: record['Correct Answer'],
                choices: [
                    record['Choice 1'],
                    record['Choice 2'],
                    record['Choice 3']
                ],
                difficulty: parseInt(record.Difficulty),
                knowledge_category: record['Knowledge Category'],
                topic_focus: record['Topic Focus']
            }));

            // Cache the results
            this.cache.set(category, questions);
            return questions;

        } catch (error) {
            console.error(`Error loading questions for ${category}:`, error);
            return [];
        }
    }
} 
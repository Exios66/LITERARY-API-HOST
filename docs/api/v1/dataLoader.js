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

            // Transform to QuizEngine compatible format
            const questions = records.map((record, index) => {
                // Destructure the choices to match the DataFrame format
                const [choice1, choice2, choice3] = this.shuffleChoices([
                    record['Choice 1'],
                    record['Choice 2'],
                    record['Choice 3']
                ]);

                return {
                    id: record.ID || `${category}-${index + 1}`,
                    question: record.Question,
                    correct_answer: record['Correct Answer'],
                    choice_1: choice1,
                    choice_2: choice2,
                    choice_3: choice3,
                    difficulty: parseInt(record.Difficulty),
                    knowledge_category: record['Knowledge Category'],
                    topic_focus: record['Topic Focus']
                };
            });

            // Cache the results
            this.cache.set(category, questions);
            return questions;

        } catch (error) {
            console.error(`Error loading questions for ${category}:`, error);
            return [];
        }
    }

    shuffleChoices(choices) {
        for (let i = choices.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [choices[i], choices[j]] = [choices[j], choices[i]];
        }
        return choices;
    }
} 
import { QuestionDataLoader } from '../docs/api/v1/dataLoader.js';
import fs from 'fs/promises';
import path from 'path';

async function generateStaticFiles() {
    const categories = [
        'astronomy',
        'literature',
        'mathematics',
        'general-knowledge',
        'psychology',
        'american-history'
    ];

    const loader = new QuestionDataLoader();
    const outputDir = path.join(process.cwd(), 'docs/data');

    // Ensure output directory exists
    await fs.mkdir(outputDir, { recursive: true });

    // Generate JSON files for each category
    for (const category of categories) {
        const questions = loader.loadQuestions(category);
        const jsonPath = path.join(outputDir, `${category}-questions.json`);
        await fs.writeFile(jsonPath, JSON.stringify({ questions }, null, 2));
        console.log(`Generated ${jsonPath}`);
    }

    // Generate categories index
    const categoriesJson = {
        categories: categories.map(cat => ({
            id: cat,
            name: cat.charAt(0).toUpperCase() + cat.slice(1).replace('-', ' '),
            endpoint: `/data/${cat}-questions.json`
        }))
    };
    
    await fs.writeFile(
        path.join(outputDir, 'categories.json'),
        JSON.stringify(categoriesJson, null, 2)
    );
}

generateStaticFiles().catch(console.error); 
const fs = require('fs');
const path = require('path');
const csv = require('csv-parse/sync');

const DATA_DIR = path.join(__dirname, '../docs/data');
const OUTPUT_DIR = path.join(__dirname, '../docs/data/json');

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

/**
 * Convert CSV data to JSON format
 * @param {string} csvContent - Raw CSV content
 * @returns {Array} Array of question objects
 */
function convertCsvToJson(csvContent) {
    const records = csv.parse(csvContent, {
        columns: true,
        skip_empty_lines: true,
        trim: true
    });

    return records.map(record => ({
        id: parseInt(record.id),
        question: record.question,
        correct_answer: record.correct_answer,
        choices: [
            record.choice_1,
            record.choice_2,
            record.choice_3,
            record.correct_answer
        ].filter(Boolean).sort(() => Math.random() - 0.5),
        difficulty: parseInt(record.difficulty),
        category: record.category,
        topic_focus: record.topic_focus
    }));
}

/**
 * Process a single CSV file
 * @param {string} filename - Name of the CSV file
 */
function processFile(filename) {
    if (!filename.endsWith('-questions.csv')) return;

    const inputPath = path.join(DATA_DIR, filename);
    const outputFilename = filename.replace('.csv', '.json');
    const outputPath = path.join(OUTPUT_DIR, outputFilename);

    try {
        const csvContent = fs.readFileSync(inputPath, 'utf-8');
        const jsonData = convertCsvToJson(csvContent);

        fs.writeFileSync(outputPath, JSON.stringify(jsonData, null, 2));
        console.log(`✓ Successfully converted ${filename} to JSON`);

    } catch (error) {
        console.error(`✗ Error processing ${filename}:`, error.message);
        process.exit(1);
    }
}

/**
 * Generate index file with metadata about all question sets
 * @param {Array} files - List of processed files
 */
function generateIndex(files) {
    const index = {
        categories: files.map(file => {
            const name = file.replace('-questions.csv', '');
            return {
                name: name,
                file: `json/${file.replace('.csv', '.json')}`,
                count: JSON.parse(fs.readFileSync(
                    path.join(OUTPUT_DIR, file.replace('.csv', '.json'))
                )).length
            };
        }),
        last_updated: new Date().toISOString()
    };

    fs.writeFileSync(
        path.join(OUTPUT_DIR, 'index.json'),
        JSON.stringify(index, null, 2)
    );
    console.log('✓ Generated index.json');
}

// Main execution
try {
    const files = fs.readdirSync(DATA_DIR)
        .filter(file => file.endsWith('-questions.csv'));

    if (files.length === 0) {
        console.error('No CSV files found in data directory');
        process.exit(1);
    }

    files.forEach(processFile);
    generateIndex(files);

    console.log('\n✓ All files processed successfully');

} catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
} 
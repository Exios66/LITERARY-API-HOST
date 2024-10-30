class MarkdownConverter {
    static csvToMarkdown(csvData) {
        const questions = this.parseCSV(csvData);
        return this.formatMarkdownTable(questions);
    }

    static parseCSV(csvData) {
        // Simple CSV parser (can be replaced with a more robust solution)
        const lines = csvData.split('\n');
        const headers = lines[0].split(',').map(h => h.trim());
        
        return lines.slice(1).map(line => {
            const values = line.split(',').map(v => v.trim());
            const question = {};
            headers.forEach((header, index) => {
                question[header] = values[index];
            });
            return question;
        });
    }

    static formatMarkdownTable(questions) {
        const headers = [
            '| ID | Question | Correct Answer | Options | Difficulty | Category | Topic |',
            '|-----|-----------|----------------|----------|------------|----------|--------|'
        ];

        const rows = questions.map(q => {
            const options = [q['Choice 1'], q['Choice 2'], q['Choice 3']].join(', ');
            return `| ${q.ID} | ${q.Question} | ${q['Correct Answer']} | ${options} | ${q.Difficulty} | ${q['Knowledge Category']} | ${q['Topic Focus']} |`;
        });

        return [...headers, ...rows].join('\n');
    }
}

// Make converter available globally
window.MarkdownConverter = MarkdownConverter; 
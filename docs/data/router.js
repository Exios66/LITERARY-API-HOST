class QuestionRouter {
    constructor(baseUrl = 'https://exios66.github.io/LITERARY-API-HOST/docs/data') {
        this.baseUrl = baseUrl;
    }

    async handleRequest(params) {
        const { category, limit = 10, random = true, format = 'json' } = params;

        try {
            // Fetch CSV data
            const response = await fetch(`${this.baseUrl}/${category}-questions.csv`);
            if (!response.ok) throw new Error('Category not found');
            
            const csvData = await response.text();
            
            // Convert based on requested format
            if (format === 'markdown') {
                return {
                    status: 'success',
                    data: MarkdownConverter.csvToMarkdown(csvData)
                };
            } else {
                // Default JSON format
                const questions = this.parseCSV(csvData);
                return {
                    status: 'success',
                    data: { questions }
                };
            }
            
        } catch (error) {
            return {
                status: 'error',
                message: error.message
            };
        }
    }

    parseCSV(csvData) {
        // Use the CSV parser from the converter
        return MarkdownConverter.parseCSV(csvData);
    }
}

// Make router available globally
window.QuestionRouter = QuestionRouter; 
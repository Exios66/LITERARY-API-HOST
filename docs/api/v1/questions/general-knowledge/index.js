import { dataLoader } from '../../dataLoader.js';

export async function getGeneralKnowledgeQuestions(req, res) {
    try {
        const questions = await dataLoader.loadQuestions('general-knowledge');
        res.json(questions);
    } catch (error) {
        res.status(500).json({
            error: 'Failed to load General Knowledge questions',
            details: error.message
        });
    }
}

export default getGeneralKnowledgeQuestions; 
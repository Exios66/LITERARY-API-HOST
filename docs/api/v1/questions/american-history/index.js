import { dataLoader } from '../../dataLoader.js';

export async function getAmericanHistoryQuestions(req, res) {
    try {
        const questions = await dataLoader.loadQuestions('american-history');
        res.json(questions);
    } catch (error) {
        res.status(500).json({
            error: 'Failed to load American History questions',
            details: error.message
        });
    }
}

export default getAmericanHistoryQuestions; 
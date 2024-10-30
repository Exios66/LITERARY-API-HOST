import { dataLoader } from '../../dataLoader.js';

export async function getLiteratureQuestions(req, res) {
    try {
        const questions = await dataLoader.loadQuestions('literature');
        res.json(questions);
    } catch (error) {
        res.status(500).json({
            error: 'Failed to load Literature questions',
            details: error.message
        });
    }
}

export default getLiteratureQuestions; 
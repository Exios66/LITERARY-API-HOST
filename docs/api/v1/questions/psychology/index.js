import { dataLoader } from '../../dataLoader.js';

export async function getPsychologyQuestions(req, res) {
    try {
        const questions = await dataLoader.loadQuestions('psychology');
        res.json(questions);
    } catch (error) {
        res.status(500).json({
            error: 'Failed to load Psychology questions',
            details: error.message
        });
    }
}

export default getPsychologyQuestions; 
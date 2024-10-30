import { dataLoader } from '../../dataLoader.js';

export async function getAstronomyQuestions(req, res) {
    try {
        const questions = await dataLoader.loadQuestions('astronomy');
        res.json(questions);
    } catch (error) {
        res.status(500).json({
            error: 'Failed to load Astronomy questions',
            details: error.message
        });
    }
}

export default getAstronomyQuestions; 
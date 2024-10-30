import { dataLoader } from '../../dataLoader.js';

export async function getMathematicsQuestions(req, res) {
    try {
        const questions = await dataLoader.loadQuestions('mathematics');
        res.json(questions);
    } catch (error) {
        res.status(500).json({
            error: 'Failed to load Mathematics questions',
            details: error.message
        });
    }
}

export default getMathematicsQuestions; 
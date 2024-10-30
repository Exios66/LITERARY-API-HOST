import express from 'express';
import { dataLoader } from './dataLoader.js';
import { handleError, APIError } from './errorHandler.js';

const router = express.Router();

router.get('/:category', async (req, res) => {
    try {
        const { category } = req.params;
        const data = await dataLoader.loadQuestions(category);
        
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename=${category}-questions.csv`);
        res.send(data);
    } catch (error) {
        handleError(error, res);
    }
});

export default router; 
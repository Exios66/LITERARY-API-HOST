import express from 'express';
import { getAstronomyQuestions } from './astronomy/index.js';
import { getLiteratureQuestions } from './literature/index.js';
import { getMathematicsQuestions } from './mathematics/index.js';
import { getGeneralKnowledgeQuestions } from './general-knowledge/index.js';
import { getPsychologyQuestions } from './psychology/index.js';
import { getAmericanHistoryQuestions } from './american-history/index.js';

const router = express.Router();

// Map category names to their handler functions
const categoryHandlers = {
    'astronomy': getAstronomyQuestions,
    'literature': getLiteratureQuestions,
    'mathematics': getMathematicsQuestions,
    'general-knowledge': getGeneralKnowledgeQuestions,
    'psychology': getPsychologyQuestions,
    'american-history': getAmericanHistoryQuestions
};

// Generic category handler
router.get('/:category', async (req, res) => {
    const category = req.params.category.toLowerCase();
    const handler = categoryHandlers[category];

    if (!handler) {
        return res.status(404).json({
            error: `Category not found: ${category}. Available categories: ${Object.keys(categoryHandlers).join(', ')}`
        });
    }

    res.setHeader('Content-Type', 'application/json');
    
    try {
        await handler(req, res);
    } catch (error) {
        res.status(500).json({
            error: error.message || 'Internal server error'
        });
    }
});

// List all available categories
router.get('/', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.json({
        categories: Object.keys(categoryHandlers),
        endpoints: Object.keys(categoryHandlers).map(category => ({
            category,
            url: `https://exios66.github.io/LITERARY-API-HOST/api/v1/questions/${category}`,
            method: 'GET'
        }))
    });
});

export default router; 
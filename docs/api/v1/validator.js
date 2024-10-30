export function validateQueryParams(params) {
    const errors = [];
    
    // Validate limit
    if (params.limit) {
        const limit = parseInt(params.limit);
        if (isNaN(limit) || limit < 1 || limit > 50) {
            errors.push('Limit must be between 1 and 50');
        }
    }

    // Validate difficulty
    if (params.difficulty) {
        const difficulty = parseInt(params.difficulty);
        if (isNaN(difficulty) || difficulty < 0 || difficulty > 3) {
            errors.push('Difficulty must be between 0 and 3');
        }
    }

    // Validate random parameter
    if (params.random && !['true', 'false'].includes(params.random)) {
        errors.push('Random must be true or false');
    }

    return errors;
} 
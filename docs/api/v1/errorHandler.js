export class APIError extends Error {
    constructor(message, status = 500) {
        super(message);
        this.status = status;
    }
}

export function handleError(error) {
    const status = error instanceof APIError ? error.status : 500;
    const message = error instanceof APIError ? error.message : 'Internal Server Error';
    
    return {
        status: 'error',
        message,
        code: status
    };
} 
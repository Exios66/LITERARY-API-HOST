import express from 'express';
import cors from 'cors';
import questionsRouter from './questions.js';

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/v1/questions', questionsRouter);

// Health check endpoint
app.get('/api/v1/health', (req, res) => {
    res.json({ status: 'ok' });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        error: {
            message: 'Internal Server Error',
            status: 500
        }
    });
});

export default app; 
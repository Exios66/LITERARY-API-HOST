# Literary Vault API Reference

## Base URL
`https://exios66.github.io/LITERARY-API-HOST/docs/data/`

## Authentication
No authentication is required for read-only access to the question database.

## Endpoints

### Get Questions by Category
Retrieves questions from a specific category.

**URL**: `/{category}-questions.csv`

**Method**: `GET`

**Categories**:

- Astronomy
- Literature  
- Mathematics
- General Knowledge
- Psychology
- American History

**Query Parameters**:

- `limit` (optional): Number of questions to return (default: 10, max: 50)
- `difficulty` (optional): Filter by difficulty level (0-3)
- `topic` (optional): Filter by specific topic focus
- `random` (optional): Return random questions (true/false)

**Example Request**:
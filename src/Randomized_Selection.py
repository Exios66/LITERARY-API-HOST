import random
import requests
import pandas as pd
from typing import List, Dict, Optional, Union

class QuizEngine:
    def __init__(self, 
                 api_url: str = "https://opentdb.com/api.php", 
                 amount: int = 10, 
                 category: Optional[int] = None, 
                 difficulty: Optional[str] = None, 
                 q_type: Optional[str] = "multiple",
                 questions_df: Optional[pd.DataFrame] = None):
        """
        Initialize the quiz engine with either API parameters or custom questions.
        
        Parameters:
        - api_url (str): The OpenTrivia API URL
        - amount (int): Number of questions to fetch
        - category (int): Category ID for filtering questions
        - difficulty (str): Difficulty level ('easy', 'medium', 'hard')
        - q_type (str): Type of questions ('multiple' or 'boolean')
        - questions_df (pd.DataFrame): Optional custom questions DataFrame
        """
        self.api_url = api_url
        self.amount = amount
        self.category = category
        self.difficulty = difficulty
        self.q_type = q_type
        self.asked_questions = []
        
        # Initialize questions from DataFrame or API
        self.questions_df = questions_df if questions_df is not None else self.fetch_questions_from_api()

    def fetch_questions_from_api(self) -> pd.DataFrame:
        """
        Fetch questions from the OpenTrivia API and transform to DataFrame.
        """
        params = {
            "amount": self.amount,
            "type": self.q_type
        }
        
        # Add optional parameters if specified
        if self.category:
            params["category"] = self.category
        if self.difficulty:
            params["difficulty"] = self.difficulty

        try:
            response = requests.get(self.api_url, params=params)
            response.raise_for_status()
            data = response.json()
            
            if data["response_code"] == 0:
                return self._transform_api_data(data["results"])
            else:
                raise ValueError("API returned a non-zero response code")
                
        except Exception as e:
            print(f"API Error: {str(e)}")
            return pd.DataFrame()

    def _transform_api_data(self, questions_data: List[Dict]) -> pd.DataFrame:
        """
        Transform API response data into the required DataFrame format.
        """
        rows = []
        for i, question in enumerate(questions_data):
            difficulty_map = {'easy': 0, 'medium': 1, 'hard': 2}
            
            row = {
                "id": i,
                "question": question['question'],
                "difficulty": difficulty_map.get(question['difficulty'], 1),
                "correct_answer": question['correct_answer'],
                "choice_1": question['incorrect_answers'][0],
                "choice_2": question['incorrect_answers'][1] if len(question['incorrect_answers']) > 1 else "",
                "choice_3": question['incorrect_answers'][2] if len(question['incorrect_answers']) > 2 else "",
                "category": question['category'],
                "type": question['type']
            }
            rows.append(row)
        
        return pd.DataFrame(rows)

    def refresh_questions(self) -> None:
        """
        Fetch a new set of questions from the API.
        """
        new_questions = self.fetch_questions_from_api()
        if not new_questions.empty:
            self.questions_df = new_questions
            self.asked_questions = []

    def get_next_question(self, 
                         user_previous_answer: Optional[str] = None, 
                         user_correct: Optional[bool] = None) -> Optional[Dict]:
        """
        Select the next question based on user's previous performance.
        """
        # Check if we need to refresh questions
        if len(self.asked_questions) >= len(self.questions_df) * 0.8:
            self.refresh_questions()

        if user_previous_answer is None:
            available_questions = self.questions_df[~self.questions_df['id'].isin(self.asked_questions)]
        else:
            if user_correct:
                current_difficulty = min(self.get_difficulty_of_last_question() + 1, 2)
            else:
                current_difficulty = max(self.get_difficulty_of_last_question() - 1, 0)
                
            available_questions = self.questions_df[
                (~self.questions_df['id'].isin(self.asked_questions)) &
                (self.questions_df['difficulty'] == current_difficulty)
            ]

        if available_questions.empty:
            available_questions = self.questions_df[~self.questions_df['id'].isin(self.asked_questions)]

        if available_questions.empty:
            return None

        selected_question = available_questions.sample().iloc[0]
        self.asked_questions.append(selected_question['id'])
        
        return {
            'question': selected_question['question'],
            'choices': self.randomize_choices(selected_question),
            'correct_answer': selected_question['correct_answer'],
            'difficulty': selected_question['difficulty'],
            'category': selected_question['category']
        }

    def randomize_choices(self, question_row: pd.Series) -> List[str]:
        """
        Randomize the order of answer choices.
        """
        choices = [
            question_row['correct_answer'],
            question_row['choice_1'],
            question_row['choice_2'],
            question_row['choice_3']
        ]
        # Filter out empty choices for boolean questions
        choices = [c for c in choices if c]
        random.shuffle(choices)
        return choices

    def get_difficulty_of_last_question(self) -> int:
        """
        Get the difficulty level of the last asked question.
        """
        if self.asked_questions:
            last_question_id = self.asked_questions[-1]
            last_question_row = self.questions_df[self.questions_df['id'] == last_question_id]
            return int(last_question_row['difficulty'].values[0])
        return 0

def main():
    """
    Example usage of the QuizEngine with API integration.
    """
    # Initialize quiz engine with specific category and difficulty
    quiz = QuizEngine(
        amount=10,
        category=9,  # General Knowledge
        difficulty='medium'
    )
    
    # Start quiz loop
    question = quiz.get_next_question()
    while question:
        print(f"\nCategory: {question['category']}")
        print(f"Question: {question['question']}")
        print("\nChoices:")
        for i, choice in enumerate(question['choices'], 1):
            print(f"{i}. {choice}")
            
        try:
            user_choice = int(input("\nEnter your choice (1-4): ")) - 1
            user_answer = question['choices'][user_choice]
            user_correct = user_answer == question['correct_answer']
            
            print("\n" + ("Correct!" if user_correct else f"Wrong! The correct answer was: {question['correct_answer']}"))
            
            question = quiz.get_next_question(user_answer, user_correct)
            
        except (ValueError, IndexError):
            print("\nInvalid input! Please enter a number between 1 and 4.")
            continue
        except KeyboardInterrupt:
            print("\nQuiz ended by user.")
            break

if __name__ == "__main__":
    main()

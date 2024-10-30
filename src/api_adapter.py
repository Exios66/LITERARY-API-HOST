import pandas as pd
import requests
import tabulate

class LiteraryVaultAdapter:
    def __init__(self, base_url="https://raw.githubusercontent.com/Exios66/LITERARY-API-HOST/main/docs/data"):
        self.base_url = base_url

    def get_questions_markdown(self, category, limit=10, random=True):
        """
        Fetch questions and return them in Markdown table format
        """
        df = self.get_questions_df(category, limit, random)
        if df.empty:
            return "No questions found."
        
        # Convert DataFrame to Markdown table
        return df.to_markdown(index=False)

    def get_questions_df(self, category, limit=10, random=True, difficulty=None):
        """
        Fetch questions and convert to pandas DataFrame
        """
        try:
            # Use raw GitHub content URL
            url = f"{self.base_url}/{category}-questions.csv"
            print(f"Fetching from URL: {url}")  # Debug print
            
            response = requests.get(url)
            response.raise_for_status()  # Raise exception for bad status codes
            
            # Save content to temporary file (pandas read_csv works better with files)
            with open('temp.csv', 'w', encoding='utf-8') as f:
                f.write(response.text)
            
            df = pd.read_csv('temp.csv')
            
            # Apply filters
            if difficulty is not None:
                df = df[df['Difficulty'] == difficulty]
            
            # Randomize if requested
            if random:
                df = df.sample(n=min(limit, len(df)))
            else:
                df = df.head(limit)
            
            return df
                
        except Exception as e:
            print(f"Error fetching questions: {str(e)}")
            return pd.DataFrame()

    def format_for_openai(self, questions_df):
        """
        Convert DataFrame to OpenAI API format
        """
        questions = []
        for _, row in questions_df.iterrows():
            question = {
                'category': row['Knowledge Category'],
                'type': 'multiple',
                'difficulty': ['easy', 'medium', 'hard', 'expert'][int(row['Difficulty'])],
                'question': row['Question'],
                'correct_answer': row['Correct Answer'],
                'incorrect_answers': [
                    row['Choice 1'],
                    row['Choice 2'],
                    row['Choice 3']
                ]
            }
            questions.append(question)
        
        return {
            'response_code': 0,
            'results': questions
        }

    def get_categories(self):
        """
        Fetch available categories
        """
        try:
            response = requests.get(f"{self.base_url}/categories.json")
            response.raise_for_status()
            return response.json()['categories']
        except Exception as e:
            print(f"Error fetching categories: {str(e)}")
            return [] 
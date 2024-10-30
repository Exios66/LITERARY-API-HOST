import pandas as pd
import os
from typing import List, Dict

class CSVStandardizer:
    """Standardizes CSV files for the Literary Vault question repository."""
    
    REQUIRED_COLUMNS = [
        'id', 'question', 'correct_answer', 'choice_1', 
        'choice_2', 'choice_3', 'difficulty', 'category', 'topic_focus'
    ]
    
    def __init__(self, data_dir: str = "docs/data"):
        self.data_dir = data_dir
        
    def standardize_all_files(self):
        """Standardize all CSV files in the data directory."""
        csv_files = [f for f in os.listdir(self.data_dir) if f.endswith('-questions.csv')]
        
        for csv_file in csv_files:
            file_path = os.path.join(self.data_dir, csv_file)
            category = csv_file.replace('-questions.csv', '')
            self.standardize_file(file_path, category)
            print(f"✓ Standardized {csv_file}")
    
    def standardize_file(self, file_path: str, category: str):
        """
        Standardize a single CSV file.
        
        Args:
            file_path (str): Path to the CSV file
            category (str): Category name for the questions
        """
        try:
            # Read CSV with flexible parsing
            df = pd.read_csv(file_path, on_bad_lines='skip')
            
            # Standardize column names
            df.columns = [col.lower().strip() for col in df.columns]
            
            # Map existing columns to required columns
            column_mapping = {
                'question_text': 'question',
                'answer': 'correct_answer',
                'incorrect_answer_1': 'choice_1',
                'incorrect_answer_2': 'choice_2',
                'incorrect_answer_3': 'choice_3',
                'difficulty_level': 'difficulty'
            }
            
            df = df.rename(columns=column_mapping)
            
            # Add missing columns
            if 'id' not in df.columns:
                df['id'] = range(1, len(df) + 1)
            
            if 'category' not in df.columns:
                df['category'] = category
            
            if 'topic_focus' not in df.columns:
                df['topic_focus'] = f'{category} General'
            
            if 'difficulty' not in df.columns:
                df['difficulty'] = 1
            
            # Ensure all required columns exist
            for col in self.REQUIRED_COLUMNS:
                if col not in df.columns:
                    df[col] = ''
            
            # Standardize difficulty values
            df['difficulty'] = pd.to_numeric(df['difficulty'], errors='coerce').fillna(1)
            df['difficulty'] = df['difficulty'].astype(int).clip(0, 3)
            
            # Reorder columns to match required format
            df = df[self.REQUIRED_COLUMNS]
            
            # Remove any duplicate rows
            df = df.drop_duplicates(subset=['question'])
            
            # Save standardized CSV
            df.to_csv(file_path, index=False)
            
        except Exception as e:
            print(f"Error standardizing {file_path}: {str(e)}")

def main():
    """Main function to run the CSV standardizer."""
    standardizer = CSVStandardizer()
    standardizer.standardize_all_files()
    print("\nStandardization complete!")

if __name__ == "__main__":
    main() 
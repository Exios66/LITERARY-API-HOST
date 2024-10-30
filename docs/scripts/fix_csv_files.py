import pandas as pd
import os
import sys
from typing import List, Dict, Optional

class CSVFixer:
    """Fixes CSV files for the Literary Vault question repository."""
    
    REQUIRED_COLUMNS = [
        'id', 'question', 'correct_answer', 'choice_1', 
        'choice_2', 'choice_3', 'difficulty', 'category', 'topic_focus'
    ]
    
    def __init__(self, data_dir: str = "docs/data"):
        """Initialize the CSV fixer."""
        self.data_dir = data_dir
        self.fixed_files = []
        self.errors = []

    def fix_all_files(self) -> bool:
        """Fix all CSV files in the data directory."""
        csv_files = [f for f in os.listdir(self.data_dir) if f.endswith('-questions.csv')]
        
        if not csv_files:
            print("No CSV files found.")
            return False
        
        for csv_file in csv_files:
            try:
                file_path = os.path.join(self.data_dir, csv_file)
                category = csv_file.replace('-questions.csv', '').replace('-', ' ')
                self.fix_file(file_path, category)
                self.fixed_files.append(csv_file)
                print(f"✓ Fixed {csv_file}")
            except Exception as e:
                self.errors.append(f"Error fixing {csv_file}: {str(e)}")
                print(f"✗ Failed to fix {csv_file}: {str(e)}")
        
        return len(self.errors) == 0

    def fix_file(self, file_path: str, category: str) -> None:
        """Fix a single CSV file."""
        try:
            # Read CSV with more flexible parsing
            df = pd.read_csv(file_path, on_bad_lines='warn', encoding='utf-8')
            
            # Fix column names
            df.columns = [col.lower().strip().replace(' ', '_') for col in df.columns]
            
            # Map common column variations
            column_mapping = {
                'question_text': 'question',
                'answer': 'correct_answer',
                'correct': 'correct_answer',
                'wrong_1': 'choice_1',
                'wrong_2': 'choice_2',
                'wrong_3': 'choice_3',
                'incorrect_1': 'choice_1',
                'incorrect_2': 'choice_2',
                'incorrect_3': 'choice_3',
                'difficulty_level': 'difficulty',
                'topic': 'topic_focus',
                'subject': 'category'
            }
            
            df = df.rename(columns=column_mapping)
            
            # Add missing columns with default values
            if 'id' not in df.columns:
                df['id'] = range(1, len(df) + 1)
            
            if 'category' not in df.columns:
                df['category'] = category
            
            if 'topic_focus' not in df.columns:
                df['topic_focus'] = df['category'].apply(lambda x: f"{x} General")
            
            if 'difficulty' not in df.columns:
                df['difficulty'] = 1
            
            # Ensure all required columns exist
            for col in self.REQUIRED_COLUMNS:
                if col not in df.columns:
                    df[col] = ''
            
            # Clean and standardize data
            df = self._clean_data(df)
            
            # Reorder columns
            df = df[self.REQUIRED_COLUMNS]
            
            # Save fixed CSV
            df.to_csv(file_path, index=False, encoding='utf-8')
            
        except Exception as e:
            raise Exception(f"Failed to fix {file_path}: {str(e)}")

    def _clean_data(self, df: pd.DataFrame) -> pd.DataFrame:
        """Clean and standardize the data."""
        # Convert ID to integer
        df['id'] = pd.to_numeric(df['id'], errors='coerce').fillna(0).astype(int)
        
        # Clean text fields
        text_columns = ['question', 'correct_answer', 'choice_1', 'choice_2', 'choice_3', 'category', 'topic_focus']
        for col in text_columns:
            df[col] = df[col].astype(str).apply(lambda x: x.strip())
        
        # Standardize difficulty (0-3)
        df['difficulty'] = pd.to_numeric(df['difficulty'], errors='coerce').fillna(1)
        df['difficulty'] = df['difficulty'].astype(int).clip(0, 3)
        
        # Remove duplicate questions
        df = df.drop_duplicates(subset=['question'], keep='first')
        
        # Reset index after removing duplicates
        df = df.reset_index(drop=True)
        
        return df

    def print_report(self) -> None:
        """Print a report of the fixing process."""
        print("\nCSV Fixing Report:")
        print(f"Total files processed: {len(self.fixed_files)}")
        print(f"Successfully fixed: {len(self.fixed_files) - len(self.errors)}")
        print(f"Failed: {len(self.errors)}")
        
        if self.errors:
            print("\nErrors encountered:")
            for error in self.errors:
                print(f"- {error}")
        else:
            print("\nAll files fixed successfully!")

def main():
    """Main function to run the CSV fixer."""
    fixer = CSVFixer()
    success = fixer.fix_all_files()
    fixer.print_report()
    
    # Exit with appropriate status code
    sys.exit(0 if success else 1)

if __name__ == "__main__":
    main() 
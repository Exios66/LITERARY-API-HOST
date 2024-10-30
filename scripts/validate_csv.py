import pandas as pd
import os
import sys
from typing import List, Dict, Optional

class CSVValidator:
    """Validates CSV files for the Literary Vault question repository."""
    
    REQUIRED_COLUMNS = [
        'id', 'question', 'correct_answer', 'choice_1', 
        'choice_2', 'choice_3', 'difficulty', 'category', 'topic_focus'
    ]
    
    DIFFICULTY_RANGE = [0, 1, 2, 3]  # Valid difficulty levels
    
    def __init__(self, data_dir: str = "docs/data"):
        """
        Initialize the validator with the data directory path.
        
        Args:
            data_dir (str): Path to the directory containing CSV files
        """
        self.data_dir = data_dir
        self.errors = []

    def validate_all_files(self) -> bool:
        """
        Validate all CSV files in the data directory.
        
        Returns:
            bool: True if all files are valid, False otherwise
        """
        csv_files = [f for f in os.listdir(self.data_dir) if f.endswith('-questions.csv')]
        
        if not csv_files:
            self.errors.append(f"No CSV files found in {self.data_dir}")
            return False
        
        all_valid = True
        for csv_file in csv_files:
            file_path = os.path.join(self.data_dir, csv_file)
            if not self.validate_file(file_path):
                all_valid = False
        
        return all_valid

    def validate_file(self, file_path: str) -> bool:
        """
        Validate a single CSV file.
        
        Args:
            file_path (str): Path to the CSV file
            
        Returns:
            bool: True if file is valid, False otherwise
        """
        try:
            df = pd.read_csv(file_path)
            file_name = os.path.basename(file_path)
            
            # Check required columns
            missing_cols = [col for col in self.REQUIRED_COLUMNS if col not in df.columns]
            if missing_cols:
                self.errors.append(f"{file_name}: Missing required columns: {', '.join(missing_cols)}")
                return False
            
            # Validate each row
            for index, row in df.iterrows():
                self._validate_row(row, file_name, index)
            
            # Check for duplicate IDs
            if df['id'].duplicated().any():
                duplicate_ids = df[df['id'].duplicated()]['id'].tolist()
                self.errors.append(f"{file_name}: Duplicate IDs found: {duplicate_ids}")
                return False
            
            return len(self.errors) == 0
            
        except Exception as e:
            self.errors.append(f"{file_path}: Failed to validate - {str(e)}")
            return False

    def _validate_row(self, row: pd.Series, file_name: str, index: int) -> None:
        """
        Validate a single row of data.
        
        Args:
            row (pd.Series): Row data
            file_name (str): Name of the CSV file
            index (int): Row index
        """
        # Check for empty required fields
        for col in ['question', 'correct_answer', 'choice_1', 'choice_2', 'choice_3']:
            if pd.isna(row[col]) or str(row[col]).strip() == '':
                self.errors.append(f"{file_name}: Row {index + 1} has empty {col}")
        
        # Validate difficulty
        try:
            difficulty = int(row['difficulty'])
            if difficulty not in self.DIFFICULTY_RANGE:
                self.errors.append(
                    f"{file_name}: Row {index + 1} has invalid difficulty level: {difficulty}"
                )
        except (ValueError, TypeError):
            self.errors.append(
                f"{file_name}: Row {index + 1} has non-integer difficulty: {row['difficulty']}"
            )
        
        # Validate choices are different from correct answer
        correct_answer = str(row['correct_answer']).strip()
        choices = [str(row[f'choice_{i}']).strip() for i in range(1, 4)]
        
        if correct_answer in choices:
            self.errors.append(
                f"{file_name}: Row {index + 1} has correct answer duplicated in choices"
            )
        
        # Check for duplicate choices
        if len(set(choices)) != len(choices):
            self.errors.append(
                f"{file_name}: Row {index + 1} has duplicate choices"
            )

    def print_errors(self) -> None:
        """Print all validation errors."""
        if self.errors:
            print("\nValidation Errors:")
            for error in self.errors:
                print(f"- {error}")
        else:
            print("\nNo validation errors found.")

def main():
    """Main function to run the CSV validator."""
    # Get data directory from command line argument or use default
    data_dir = sys.argv[1] if len(sys.argv) > 1 else "docs/data"
    
    validator = CSVValidator(data_dir)
    is_valid = validator.validate_all_files()
    
    validator.print_errors()
    
    # Exit with appropriate status code
    sys.exit(0 if is_valid else 1)

if __name__ == "__main__":
    main() 
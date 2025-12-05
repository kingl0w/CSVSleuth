import pandas as pd
import os
from werkzeug.utils import secure_filename
from backend.config.config import Config

class CSVValidator:
    """Validates and sanitizes CSV files for security"""

    @staticmethod
    def allowed_file(filename):
        """Check if file has allowed extension"""
        return '.' in filename and \
               filename.rsplit('.', 1)[1].lower() in Config.ALLOWED_EXTENSIONS

    @staticmethod
    def validate_csv(file_path):
        """
        Validate CSV file for security and integrity
        Returns: (is_valid, error_message, dataframe)
        """
        try:
            #read csv with security limits
            df = pd.read_csv(
                file_path,
                nrows=Config.MAX_ROWS,
                on_bad_lines='skip',  #skip malformed lines
                engine='python',  #more secure than c engine
                encoding='utf-8'
            )

            #check column count
            if len(df.columns) > Config.MAX_COLUMNS:
                return False, f"Too many columns. Maximum allowed: {Config.MAX_COLUMNS}", None

            #check for empty dataframe
            if df.empty:
                return False, "CSV file is empty", None

            #sanitize column names
            df.columns = [CSVValidator.sanitize_column_name(col) for col in df.columns]

            return True, None, df

        except pd.errors.EmptyDataError:
            return False, "CSV file is empty or corrupted", None
        except pd.errors.ParserError:
            return False, "CSV file is malformed", None
        except Exception as e:
            return False, f"Error reading CSV: {str(e)}", None

    @staticmethod
    def sanitize_column_name(column_name):
        """Sanitize column names to prevent injection attacks"""
        #remove any potentially dangerous characters
        import re
        #keep only alphanumeric, spaces, underscores, and hyphens
        sanitized = re.sub(r'[^a-zA-Z0-9\s_-]', '', str(column_name))
        #limit length
        sanitized = sanitized[:100]
        #replace multiple spaces with single underscore
        sanitized = re.sub(r'\s+', '_', sanitized)
        return sanitized or 'unnamed_column'

    @staticmethod
    def secure_filename_upload(filename):
        """Create a secure filename"""
        return secure_filename(filename)

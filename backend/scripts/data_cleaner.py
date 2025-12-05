import pandas as pd
import numpy as np
from datetime import datetime

class DataCleaner:
    """Cleans and preprocesses CSV data"""

    def __init__(self, df):
        self.df = df.copy()
        self.cleaning_report = {
            'original_shape': df.shape,
            'actions_taken': [],
            'warnings': []
        }

    def clean(self):
        """Perform comprehensive data cleaning"""
        self._remove_duplicates()
        self._handle_missing_values()
        self._detect_and_convert_types()
        self._remove_empty_columns()
        self._standardize_text()

        self.cleaning_report['final_shape'] = self.df.shape

        return self.df, self.cleaning_report

    def _remove_duplicates(self):
        """Remove duplicate rows"""
        initial_rows = len(self.df)
        self.df = self.df.drop_duplicates()
        duplicates_removed = initial_rows - len(self.df)

        if duplicates_removed > 0:
            self.cleaning_report['actions_taken'].append({
                'action': 'remove_duplicates',
                'count': duplicates_removed,
                'message': f'Removed {duplicates_removed} duplicate rows'
            })

    def _handle_missing_values(self):
        """Handle missing values intelligently"""
        missing_info = []

        for column in self.df.columns:
            missing_count = self.df[column].isnull().sum()
            if missing_count > 0:
                missing_percentage = (missing_count / len(self.df)) * 100

                #if more than 70% missing, consider dropping the column
                if missing_percentage > 70:
                    missing_info.append({
                        'column': column,
                        'action': 'flagged_for_review',
                        'missing_percentage': round(missing_percentage, 2),
                        'message': f'{column}: {missing_percentage:.1f}% missing (consider removing)'
                    })
                    self.cleaning_report['warnings'].append(
                        f'{column} has {missing_percentage:.1f}% missing values'
                    )
                else:
                    #fill missing values based on data type
                    if pd.api.types.is_numeric_dtype(self.df[column]):
                        self.df[column].fillna(self.df[column].median(), inplace=True)
                        missing_info.append({
                            'column': column,
                            'action': 'filled_with_median',
                            'count': missing_count
                        })
                    else:
                        self.df[column].fillna('Unknown', inplace=True)
                        missing_info.append({
                            'column': column,
                            'action': 'filled_with_unknown',
                            'count': missing_count
                        })

        if missing_info:
            self.cleaning_report['actions_taken'].append({
                'action': 'handle_missing_values',
                'details': missing_info
            })

    def _detect_and_convert_types(self):
        """Detect and convert column data types"""
        conversions = []

        for column in self.df.columns:
            #try to convert to datetime
            if self._is_datetime_column(column):
                try:
                    self.df[column] = pd.to_datetime(self.df[column], errors='coerce')
                    conversions.append({
                        'column': column,
                        'from': 'object',
                        'to': 'datetime'
                    })
                except:
                    pass

            #try to convert to numeric
            elif self.df[column].dtype == 'object':
                try:
                    #remove common non-numeric characters
                    cleaned = self.df[column].astype(str).str.replace('$', '').str.replace(',', '')
                    numeric_series = pd.to_numeric(cleaned, errors='coerce')

                    #if at least 80% successfully converted, use it
                    if numeric_series.notna().sum() / len(numeric_series) > 0.8:
                        self.df[column] = numeric_series
                        conversions.append({
                            'column': column,
                            'from': 'object',
                            'to': 'numeric'
                        })
                except:
                    pass

        if conversions:
            self.cleaning_report['actions_taken'].append({
                'action': 'type_conversion',
                'details': conversions
            })

    def _is_datetime_column(self, column):
        """Check if column might contain datetime data"""
        datetime_keywords = ['date', 'time', 'timestamp', 'created', 'updated', 'modified']
        return any(keyword in column.lower() for keyword in datetime_keywords)

    def _remove_empty_columns(self):
        """Remove completely empty columns"""
        empty_cols = [col for col in self.df.columns if self.df[col].isnull().all()]

        if empty_cols:
            self.df = self.df.drop(columns=empty_cols)
            self.cleaning_report['actions_taken'].append({
                'action': 'remove_empty_columns',
                'columns': empty_cols,
                'count': len(empty_cols)
            })

    def _standardize_text(self):
        """Standardize text columns"""
        text_standardizations = []

        for column in self.df.columns:
            if self.df[column].dtype == 'object':
                #strip whitespace
                original_sample = self.df[column].iloc[0] if len(self.df) > 0 else None
                self.df[column] = self.df[column].astype(str).str.strip()

                if original_sample != self.df[column].iloc[0]:
                    text_standardizations.append(column)

        if text_standardizations:
            self.cleaning_report['actions_taken'].append({
                'action': 'standardize_text',
                'columns': text_standardizations,
                'message': 'Removed leading/trailing whitespace'
            })

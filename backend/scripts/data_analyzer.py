import pandas as pd
import numpy as np
from scipy import stats
from collections import Counter

class DataAnalyzer:
    """Comprehensive data analysis for CSV files"""

    def __init__(self, df):
        self.df = df

    def analyze(self):
        """Perform complete analysis"""
        return {
            'data_quality': self._analyze_data_quality(),
            'statistics': self._calculate_statistics(),
            'correlations': self._analyze_correlations(),
            'insights': self._generate_insights(),
            'column_info': self._get_column_info()
        }

    def _analyze_data_quality(self):
        """Analyze data quality metrics"""
        total_cells = self.df.shape[0] * self.df.shape[1]
        missing_cells = self.df.isnull().sum().sum()

        quality_report = {
            'total_rows': int(self.df.shape[0]),
            'total_columns': int(self.df.shape[1]),
            'total_cells': int(total_cells),
            'missing_cells': int(missing_cells),
            'completeness_score': round((1 - missing_cells / total_cells) * 100, 2) if total_cells > 0 else 0,
            'duplicate_rows': int(self.df.duplicated().sum()),
            'column_quality': []
        }

        #Per-column quality metrics
        for column in self.df.columns:
            col_data = self.df[column]
            missing_count = col_data.isnull().sum()
            total_count = len(col_data)

            col_quality = {
                'column': column,
                'data_type': str(col_data.dtype),
                'missing_count': int(missing_count),
                'missing_percentage': round((missing_count / total_count) * 100, 2) if total_count > 0 else 0,
                'unique_values': int(col_data.nunique()),
                'uniqueness_ratio': round(col_data.nunique() / total_count, 3) if total_count > 0 else 0
            }

            #Detect potential issues
            if missing_count > total_count * 0.5:
                col_quality['warning'] = 'High missing value rate'
            elif col_data.nunique() == 1:
                col_quality['warning'] = 'All values are identical'
            elif col_data.nunique() == total_count:
                col_quality['info'] = 'All values are unique (potential ID column)'

            quality_report['column_quality'].append(col_quality)

        return quality_report

    def _calculate_statistics(self):
        """Calculate statistical summaries"""
        stats_summary = {
            'numeric_columns': [],
            'categorical_columns': []
        }

        for column in self.df.columns:
            col_data = self.df[column]

            if pd.api.types.is_numeric_dtype(col_data):
                #Numeric statistics
                stats_summary['numeric_columns'].append({
                    'column': column,
                    'count': int(col_data.count()),
                    'mean': float(col_data.mean()) if not col_data.empty else None,
                    'median': float(col_data.median()) if not col_data.empty else None,
                    'std': float(col_data.std()) if not col_data.empty else None,
                    'min': float(col_data.min()) if not col_data.empty else None,
                    'max': float(col_data.max()) if not col_data.empty else None,
                    'q25': float(col_data.quantile(0.25)) if not col_data.empty else None,
                    'q75': float(col_data.quantile(0.75)) if not col_data.empty else None,
                    'skewness': float(col_data.skew()) if not col_data.empty else None,
                    'kurtosis': float(col_data.kurtosis()) if not col_data.empty else None,
                    'outliers_count': int(self._count_outliers(col_data))
                })
            else:
                #Categorical statistics
                value_counts = col_data.value_counts().head(10)
                stats_summary['categorical_columns'].append({
                    'column': column,
                    'count': int(col_data.count()),
                    'unique_values': int(col_data.nunique()),
                    'most_common': value_counts.index.tolist(),
                    'most_common_counts': value_counts.values.tolist(),
                    'mode': col_data.mode().iloc[0] if not col_data.mode().empty else None
                })

        return stats_summary

    def _analyze_correlations(self):
        """Analyze correlations and patterns"""
        correlations = {
            'correlation_matrix': None,
            'strong_correlations': [],
            'patterns': []
        }

        #Get numeric columns
        numeric_df = self.df.select_dtypes(include=[np.number])

        if len(numeric_df.columns) >= 2:
            #Calculate correlation matrix
            corr_matrix = numeric_df.corr()

            #Convert to serializable format
            correlations['correlation_matrix'] = {
                'columns': corr_matrix.columns.tolist(),
                'values': corr_matrix.values.tolist()
            }

            #Find strong correlations
            strong_corr = []
            for i in range(len(corr_matrix.columns)):
                for j in range(i + 1, len(corr_matrix.columns)):
                    corr_value = corr_matrix.iloc[i, j]
                    if abs(corr_value) > 0.7:  #Strong correlation threshold
                        strong_corr.append({
                            'column1': corr_matrix.columns[i],
                            'column2': corr_matrix.columns[j],
                            'correlation': round(float(corr_value), 3),
                            'strength': 'strong positive' if corr_value > 0 else 'strong negative'
                        })

            correlations['strong_correlations'] = strong_corr

        #Detect patterns
        patterns = []

        #Check for time series data
        date_columns = self.df.select_dtypes(include=['datetime64']).columns
        if len(date_columns) > 0:
            patterns.append({
                'type': 'time_series',
                'columns': date_columns.tolist(),
                'message': 'Time series data detected'
            })

        #Check for categorical relationships
        categorical_cols = self.df.select_dtypes(include=['object']).columns
        if len(categorical_cols) >= 2:
            patterns.append({
                'type': 'categorical_data',
                'count': len(categorical_cols),
                'message': f'{len(categorical_cols)} categorical columns found for relationship analysis'
            })

        correlations['patterns'] = patterns

        return correlations

    def _generate_insights(self):
        """Generate AI-powered insights about the data"""
        insights = []

        #Data completeness insight
        missing_percentage = (self.df.isnull().sum().sum() / (self.df.shape[0] * self.df.shape[1])) * 100
        if missing_percentage < 5:
            insights.append({
                'category': 'data_quality',
                'severity': 'positive',
                'message': f'Excellent data quality: only {missing_percentage:.1f}% missing values',
                'recommendation': 'Data is ready for analysis'
            })
        elif missing_percentage > 20:
            insights.append({
                'category': 'data_quality',
                'severity': 'warning',
                'message': f'High missing value rate: {missing_percentage:.1f}%',
                'recommendation': 'Consider imputation strategies or removing incomplete records'
            })

        #Duplicate detection
        duplicate_count = self.df.duplicated().sum()
        if duplicate_count > 0:
            insights.append({
                'category': 'data_quality',
                'severity': 'warning',
                'message': f'Found {duplicate_count} duplicate rows',
                'recommendation': 'Review and remove duplicates if they are not intentional'
            })

        #Data type insights
        numeric_cols = self.df.select_dtypes(include=[np.number]).columns
        if len(numeric_cols) > 0:
            insights.append({
                'category': 'analysis_ready',
                'severity': 'info',
                'message': f'{len(numeric_cols)} numeric columns available for statistical analysis',
                'recommendation': 'Explore correlations and distributions'
            })

        #Outlier detection
        for column in numeric_cols:
            outlier_count = self._count_outliers(self.df[column])
            if outlier_count > len(self.df) * 0.1:  #More than 10% outliers
                insights.append({
                    'category': 'outliers',
                    'severity': 'info',
                    'message': f'{column}: {outlier_count} potential outliers detected',
                    'recommendation': 'Investigate outliers - they may indicate data issues or interesting patterns'
                })

        #Uniqueness insights
        for column in self.df.columns:
            unique_ratio = self.df[column].nunique() / len(self.df)
            if unique_ratio == 1:
                insights.append({
                    'category': 'data_structure',
                    'severity': 'info',
                    'message': f'{column} appears to be a unique identifier',
                    'recommendation': 'Can be used as a primary key'
                })
            elif unique_ratio < 0.01 and len(self.df) > 100:
                insights.append({
                    'category': 'data_structure',
                    'severity': 'info',
                    'message': f'{column} has very low cardinality',
                    'recommendation': 'Good candidate for categorical analysis'
                })

        #Imbalance detection for categorical variables
        categorical_cols = self.df.select_dtypes(include=['object']).columns
        for column in categorical_cols:
            if self.df[column].nunique() < 10:  #Only check small categorical variables
                value_counts = self.df[column].value_counts()
                if len(value_counts) > 0:
                    max_freq = value_counts.iloc[0] / len(self.df)
                    if max_freq > 0.9:
                        insights.append({
                            'category': 'imbalance',
                            'severity': 'warning',
                            'message': f'{column} is highly imbalanced ({max_freq * 100:.1f}% in one category)',
                            'recommendation': 'Consider this imbalance in any predictive modeling'
                        })

        return insights

    def _get_column_info(self):
        """Get detailed information about each column"""
        column_info = []

        for column in self.df.columns:
            col_data = self.df[column]
            info = {
                'name': column,
                'dtype': str(col_data.dtype),
                'non_null_count': int(col_data.count()),
                'null_count': int(col_data.isnull().sum()),
                'unique_count': int(col_data.nunique())
            }

            #Add sample values (first 5 unique values)
            sample_values = col_data.dropna().unique()[:5].tolist()
            info['sample_values'] = [str(v) for v in sample_values]

            column_info.append(info)

        return column_info

    def _count_outliers(self, series):
        """Count outliers using IQR method"""
        if len(series) == 0 or not pd.api.types.is_numeric_dtype(series):
            return 0

        Q1 = series.quantile(0.25)
        Q3 = series.quantile(0.75)
        IQR = Q3 - Q1

        lower_bound = Q1 - 1.5 * IQR
        upper_bound = Q3 + 1.5 * IQR

        outliers = series[(series < lower_bound) | (series > upper_bound)]
        return len(outliers)

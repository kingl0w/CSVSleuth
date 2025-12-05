import pandas as pd
import numpy as np
import matplotlib
matplotlib.use('Agg')  #Non-interactive backend
import matplotlib.pyplot as plt
import seaborn as sns
import io
import base64
from datetime import datetime

class DataVisualizer:
    """Generate visualizations for CSV data"""

    def __init__(self, df):
        self.df = df
        #Set style
        sns.set_style("whitegrid")
        plt.rcParams['figure.figsize'] = (10, 6)

    def generate_visualizations(self):
        """Generate all relevant visualizations"""
        visualizations = {
            'distribution_charts': self._create_distribution_charts(),
            'correlation_heatmap': self._create_correlation_heatmap(),
            'categorical_charts': self._create_categorical_charts(),
            'time_series_charts': self._create_time_series_charts(),
            'relationship_charts': self._create_relationship_charts()
        }

        return visualizations

    def _create_distribution_charts(self):
        """Create histograms and box plots for numeric columns"""
        charts = []
        numeric_cols = self.df.select_dtypes(include=[np.number]).columns

        for column in numeric_cols[:6]:  #Limit to first 6 numeric columns
            try:
                #Histogram
                fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(14, 5))

                #Histogram
                ax1.hist(self.df[column].dropna(), bins=30, color='skyblue', edgecolor='black', alpha=0.7)
                ax1.set_xlabel(column)
                ax1.set_ylabel('Frequency')
                ax1.set_title(f'Distribution of {column}')
                ax1.grid(True, alpha=0.3)

                #Box plot
                ax2.boxplot(self.df[column].dropna(), vert=True)
                ax2.set_ylabel(column)
                ax2.set_title(f'Box Plot of {column}')
                ax2.grid(True, alpha=0.3)

                plt.tight_layout()

                charts.append({
                    'column': column,
                    'type': 'distribution',
                    'image': self._fig_to_base64(fig),
                    'description': f'Distribution and box plot for {column}'
                })

                plt.close(fig)

            except Exception as e:
                print(f"Error creating distribution chart for {column}: {e}")

        return charts

    def _create_correlation_heatmap(self):
        """Create correlation heatmap for numeric columns"""
        numeric_df = self.df.select_dtypes(include=[np.number])

        if len(numeric_df.columns) < 2:
            return None

        try:
            fig, ax = plt.subplots(figsize=(12, 10))

            #Calculate correlation matrix
            corr_matrix = numeric_df.corr()

            #Create heatmap
            sns.heatmap(
                corr_matrix,
                annot=True,
                fmt='.2f',
                cmap='coolwarm',
                center=0,
                square=True,
                linewidths=1,
                cbar_kws={"shrink": 0.8},
                ax=ax
            )

            ax.set_title('Correlation Heatmap', fontsize=16, fontweight='bold')
            plt.tight_layout()

            result = {
                'type': 'correlation_heatmap',
                'image': self._fig_to_base64(fig),
                'description': 'Correlation matrix showing relationships between numeric variables'
            }

            plt.close(fig)
            return result

        except Exception as e:
            print(f"Error creating correlation heatmap: {e}")
            return None

    def _create_categorical_charts(self):
        """Create bar charts and pie charts for categorical columns"""
        charts = []
        categorical_cols = self.df.select_dtypes(include=['object']).columns

        for column in categorical_cols[:4]:  #Limit to first 4 categorical columns
            unique_count = self.df[column].nunique()

            #Only visualize if reasonable number of categories
            if unique_count <= 15:
                try:
                    value_counts = self.df[column].value_counts().head(10)

                    fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(16, 6))

                    #Bar chart
                    value_counts.plot(kind='bar', ax=ax1, color='steelblue', edgecolor='black')
                    ax1.set_xlabel(column)
                    ax1.set_ylabel('Count')
                    ax1.set_title(f'Top Categories in {column}')
                    ax1.tick_params(axis='x', rotation=45)
                    ax1.grid(True, alpha=0.3)

                    #Pie chart (top 8 only for readability)
                    top_8 = value_counts.head(8)
                    if len(value_counts) > 8:
                        other_sum = value_counts.iloc[8:].sum()
                        top_8['Other'] = other_sum

                    colors = sns.color_palette('pastel')[0:len(top_8)]
                    ax2.pie(
                        top_8.values,
                        labels=top_8.index,
                        autopct='%1.1f%%',
                        startangle=90,
                        colors=colors
                    )
                    ax2.set_title(f'Distribution of {column}')

                    plt.tight_layout()

                    charts.append({
                        'column': column,
                        'type': 'categorical',
                        'image': self._fig_to_base64(fig),
                        'description': f'Category distribution for {column}'
                    })

                    plt.close(fig)

                except Exception as e:
                    print(f"Error creating categorical chart for {column}: {e}")

        return charts

    def _create_time_series_charts(self):
        """Create time series charts if datetime columns exist"""
        charts = []
        date_columns = self.df.select_dtypes(include=['datetime64']).columns

        if len(date_columns) == 0:
            return charts

        numeric_cols = self.df.select_dtypes(include=[np.number]).columns

        for date_col in date_columns[:2]:  #Limit to first 2 date columns
            for num_col in numeric_cols[:3]:  #Plot first 3 numeric columns
                try:
                    #Sort by date
                    sorted_df = self.df.sort_values(by=date_col)

                    fig, ax = plt.subplots(figsize=(14, 6))

                    ax.plot(
                        sorted_df[date_col],
                        sorted_df[num_col],
                        marker='o',
                        linestyle='-',
                        linewidth=2,
                        markersize=4,
                        color='steelblue'
                    )

                    ax.set_xlabel(date_col, fontsize=12)
                    ax.set_ylabel(num_col, fontsize=12)
                    ax.set_title(f'{num_col} over {date_col}', fontsize=14, fontweight='bold')
                    ax.grid(True, alpha=0.3)
                    plt.xticks(rotation=45)
                    plt.tight_layout()

                    charts.append({
                        'columns': [date_col, num_col],
                        'type': 'time_series',
                        'image': self._fig_to_base64(fig),
                        'description': f'Time series: {num_col} over {date_col}'
                    })

                    plt.close(fig)

                except Exception as e:
                    print(f"Error creating time series chart for {date_col} vs {num_col}: {e}")

        return charts

    def _create_relationship_charts(self):
        """Create scatter plots showing relationships between numeric variables"""
        charts = []
        numeric_cols = self.df.select_dtypes(include=[np.number]).columns

        if len(numeric_cols) < 2:
            return charts

        #Calculate correlations to find interesting pairs
        corr_matrix = self.df[numeric_cols].corr()

        #Find pairs with strong correlations
        strong_pairs = []
        for i in range(len(numeric_cols)):
            for j in range(i + 1, len(numeric_cols)):
                corr_value = abs(corr_matrix.iloc[i, j])
                if corr_value > 0.3:  #Moderate to strong correlation
                    strong_pairs.append({
                        'col1': numeric_cols[i],
                        'col2': numeric_cols[j],
                        'corr': corr_value
                    })

        #Sort by correlation strength and take top 4
        strong_pairs.sort(key=lambda x: x['corr'], reverse=True)

        for pair in strong_pairs[:4]:
            try:
                fig, ax = plt.subplots(figsize=(10, 8))

                #Scatter plot
                ax.scatter(
                    self.df[pair['col1']],
                    self.df[pair['col2']],
                    alpha=0.5,
                    color='steelblue',
                    edgecolors='black',
                    linewidth=0.5
                )

                #Add trend line
                z = np.polyfit(
                    self.df[pair['col1']].dropna(),
                    self.df[pair['col2']].dropna(),
                    1
                )
                p = np.poly1d(z)
                ax.plot(
                    self.df[pair['col1']],
                    p(self.df[pair['col1']]),
                    "r--",
                    alpha=0.8,
                    linewidth=2,
                    label='Trend line'
                )

                ax.set_xlabel(pair['col1'], fontsize=12)
                ax.set_ylabel(pair['col2'], fontsize=12)
                ax.set_title(
                    f'{pair["col1"]} vs {pair["col2"]} (r={pair["corr"]:.2f})',
                    fontsize=14,
                    fontweight='bold'
                )
                ax.legend()
                ax.grid(True, alpha=0.3)
                plt.tight_layout()

                charts.append({
                    'columns': [pair['col1'], pair['col2']],
                    'type': 'scatter',
                    'correlation': round(pair['corr'], 3),
                    'image': self._fig_to_base64(fig),
                    'description': f'Relationship between {pair["col1"]} and {pair["col2"]}'
                })

                plt.close(fig)

            except Exception as e:
                print(f"Error creating scatter plot for {pair['col1']} vs {pair['col2']}: {e}")

        return charts

    def _fig_to_base64(self, fig):
        """Convert matplotlib figure to base64 encoded string"""
        buffer = io.BytesIO()
        fig.savefig(buffer, format='png', dpi=100, bbox_inches='tight')
        buffer.seek(0)
        image_base64 = base64.b64encode(buffer.read()).decode('utf-8')
        buffer.close()
        return image_base64

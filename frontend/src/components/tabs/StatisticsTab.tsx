import { Calculator, Tags } from 'lucide-react';
import type { Analysis } from '@/lib/api';

interface StatisticsTabProps {
  analysis: Analysis;
}

export const StatisticsTab = ({ analysis }: StatisticsTabProps) => {
  const { statistics } = analysis;

  if (!statistics) {
    return (
      <div className="card-elevated p-8 text-center animate-fade-in">
        <p className="text-muted-foreground">No statistics available</p>
      </div>
    );
  }

  const numericColumns = statistics.numeric_columns || [];
  const categoricalColumns = statistics.categorical_columns || [];

  const formatNumber = (num: number): string => {
    if (Math.abs(num) >= 1000000) {
      return (num / 1000000).toFixed(2) + 'M';
    }
    if (Math.abs(num) >= 1000) {
      return (num / 1000).toFixed(2) + 'K';
    }
    return num.toFixed(2);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {numericColumns.length > 0 && (
        <div className="card-elevated overflow-hidden">
          <div className="p-4 border-b border-border flex items-center gap-2">
            <Calculator className="w-5 h-5 text-primary" />
            <h3 className="font-semibold text-foreground">Numeric Columns</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Column</th>
                  <th>Mean</th>
                  <th>Median</th>
                  <th>Std Dev</th>
                  <th>Min</th>
                  <th>Max</th>
                  <th>Outliers</th>
                </tr>
              </thead>
              <tbody>
                {numericColumns.map((stat: any) => (
                  <tr key={stat.column}>
                    <td className="font-medium text-foreground">{stat.column}</td>
                    <td className="font-mono text-sm">{formatNumber(stat.mean)}</td>
                    <td className="font-mono text-sm">{formatNumber(stat.median)}</td>
                    <td className="font-mono text-sm">{formatNumber(stat.std)}</td>
                    <td className="font-mono text-sm">{formatNumber(stat.min)}</td>
                    <td className="font-mono text-sm">{formatNumber(stat.max)}</td>
                    <td>
                      {stat.outliers_count > 0 ? (
                        <span className="px-2 py-1 bg-warning/20 text-warning rounded text-xs font-medium">
                          {stat.outliers_count}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">0</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {categoricalColumns.length > 0 && (
        <div className="card-elevated overflow-hidden">
          <div className="p-4 border-b border-border flex items-center gap-2">
            <Tags className="w-5 h-5 text-accent" />
            <h3 className="font-semibold text-foreground">Categorical Columns</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Column</th>
                  <th>Unique Values</th>
                  <th>Most Common</th>
                </tr>
              </thead>
              <tbody>
                {categoricalColumns.map((stat: any) => (
                  <tr key={stat.column}>
                    <td className="font-medium text-foreground">{stat.column}</td>
                    <td>{stat.unique_values.toLocaleString()}</td>
                    <td>
                      <div className="flex flex-wrap gap-1">
                        {stat.most_common.slice(0, 3).map((value, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-1 bg-secondary rounded text-xs truncate max-w-[150px]"
                          >
                            {value}
                          </span>
                        ))}
                        {stat.most_common.length > 3 && (
                          <span className="text-muted-foreground text-xs">
                            +{stat.most_common.length - 3} more
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {numericColumns.length === 0 && categoricalColumns.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          No statistics available for this dataset
        </div>
      )}
    </div>
  );
};

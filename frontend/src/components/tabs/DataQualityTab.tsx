import { useState } from 'react';
import { Rows, Columns, CheckCircle, Copy, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import type { Analysis } from '@/lib/api';

interface DataQualityTabProps {
  analysis: Analysis;
}

type SortField = 'column' | 'data_type' | 'missing_percentage' | 'unique_values';
type SortDirection = 'asc' | 'desc' | null;

export const DataQualityTab = ({ analysis }: DataQualityTabProps) => {
  const { data_quality } = analysis;
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);
  const [hoveredRow, setHoveredRow] = useState<number | null>(null);

  if (!data_quality) {
    return (
      <div className="card-elevated p-8 text-center animate-fade-in">
        <p className="text-muted-foreground">No data quality information available</p>
      </div>
    );
  }

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      if (sortDirection === 'asc') {
        setSortDirection('desc');
      } else if (sortDirection === 'desc') {
        setSortField(null);
        setSortDirection(null);
      }
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="w-4 h-4 opacity-30 group-hover:opacity-60 transition-opacity" />;
    }
    return sortDirection === 'asc'
      ? <ArrowUp className="w-4 h-4 text-primary" />
      : <ArrowDown className="w-4 h-4 text-primary" />;
  };

  const sortedColumns = [...(data_quality.column_quality || [])].sort((a, b) => {
    if (!sortField || !sortDirection) return 0;

    let aVal = a[sortField];
    let bVal = b[sortField];

    if (typeof aVal === 'string') aVal = aVal.toLowerCase();
    if (typeof bVal === 'string') bVal = bVal.toLowerCase();

    if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
    if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  const stats = [
    {
      label: 'Total Rows',
      value: data_quality.total_rows.toLocaleString(),
      icon: Rows,
      gradient: 'from-primary to-accent',
    },
    {
      label: 'Total Columns',
      value: data_quality.total_columns,
      icon: Columns,
      gradient: 'from-accent to-primary',
    },
    {
      label: 'Completeness',
      value: `${data_quality.completeness_score.toFixed(1)}%`,
      icon: CheckCircle,
      gradient: 'from-success to-emerald-400',
    },
    {
      label: 'Duplicate Rows',
      value: data_quality.duplicate_rows.toLocaleString(),
      icon: Copy,
      gradient: 'from-warning to-orange-400',
    },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <div 
            key={stat.label} 
            className="stat-card group"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <div className="flex items-center gap-2 mb-3">
              <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${stat.gradient} flex items-center justify-center`}>
                <stat.icon className="w-4 h-4 text-primary-foreground" />
              </div>
            </div>
            <p className="text-sm text-muted-foreground font-medium">{stat.label}</p>
            <p className="text-2xl font-bold text-foreground mt-1">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="card-elevated overflow-hidden">
        <div className="p-5 border-b border-border/50 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
            <Rows className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-foreground">Column Quality Overview</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Click column headers to sort</p>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th
                  className="cursor-pointer select-none group hover:bg-secondary/50 transition-colors"
                  onClick={() => handleSort('column')}
                >
                  <div className="flex items-center gap-2">
                    <span>Column</span>
                    {getSortIcon('column')}
                  </div>
                </th>
                <th
                  className="cursor-pointer select-none group hover:bg-secondary/50 transition-colors"
                  onClick={() => handleSort('data_type')}
                >
                  <div className="flex items-center gap-2">
                    <span>Data Type</span>
                    {getSortIcon('data_type')}
                  </div>
                </th>
                <th
                  className="cursor-pointer select-none group hover:bg-secondary/50 transition-colors"
                  onClick={() => handleSort('missing_percentage')}
                >
                  <div className="flex items-center gap-2">
                    <span>Missing %</span>
                    {getSortIcon('missing_percentage')}
                  </div>
                </th>
                <th
                  className="cursor-pointer select-none group hover:bg-secondary/50 transition-colors"
                  onClick={() => handleSort('unique_values')}
                >
                  <div className="flex items-center gap-2">
                    <span>Unique Values</span>
                    {getSortIcon('unique_values')}
                  </div>
                </th>
                <th>Notes</th>
              </tr>
            </thead>
            <tbody>
              {sortedColumns.map((col: any, idx: number) => (
                <tr
                  key={col.column}
                  className={`transition-all duration-200 ${hoveredRow === idx ? 'bg-primary/5 scale-[1.01]' : ''}`}
                  onMouseEnter={() => setHoveredRow(idx)}
                  onMouseLeave={() => setHoveredRow(null)}
                >
                  <td className="font-semibold text-foreground">{col.column}</td>
                  <td>
                    <span className="px-2.5 py-1 bg-secondary rounded-lg text-xs font-mono font-medium inline-block transition-transform hover:scale-105">
                      {col.data_type}
                    </span>
                  </td>
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="w-20 h-2 bg-secondary rounded-full overflow-hidden group">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            col.missing_percentage > 20 ? 'bg-destructive' : col.missing_percentage > 5 ? 'bg-warning' : 'bg-success'
                          }`}
                          style={{ width: `${Math.min(col.missing_percentage, 100)}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium tabular-nums">{col.missing_percentage.toFixed(1)}%</span>
                    </div>
                  </td>
                  <td className="font-medium">{col.unique_values.toLocaleString()}</td>
                  <td className="text-muted-foreground text-sm">{col.warning || col.info || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

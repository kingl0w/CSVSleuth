import { useState } from 'react';
import { ChevronLeft, ChevronRight, Table, Rows } from 'lucide-react';

interface DataPreviewTableProps {
  data: Record<string, unknown>[];
  columns: string[];
  totalRows: number;
}

const ROWS_PER_PAGE = 20;
const MAX_PREVIEW_ROWS = 100;

export const DataPreviewTable = ({ data, columns, totalRows }: DataPreviewTableProps) => {
  const [currentPage, setCurrentPage] = useState(1);
  
  const previewData = data.slice(0, MAX_PREVIEW_ROWS);
  const totalPages = Math.ceil(Math.min(previewData.length, MAX_PREVIEW_ROWS) / ROWS_PER_PAGE);
  
  const startIndex = (currentPage - 1) * ROWS_PER_PAGE;
  const endIndex = startIndex + ROWS_PER_PAGE;
  const currentData = previewData.slice(startIndex, endIndex);

  const formatValue = (value: unknown): string => {
    if (value === null || value === undefined) return '—';
    if (typeof value === 'number') {
      return Number.isInteger(value) ? value.toLocaleString() : value.toFixed(4);
    }
    return String(value);
  };

  return (
    <div className="card-elevated overflow-hidden animate-slide-up">
      <div className="p-5 border-b border-border/50 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
            <Table className="w-5 h-5 text-primary" />
          </div>
          <h3 className="text-lg font-semibold text-foreground">Data Preview</h3>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-secondary/60 rounded-lg">
          <Rows className="w-4 h-4 text-muted-foreground" />
          <p className="text-sm text-muted-foreground font-medium">
            {Math.min(MAX_PREVIEW_ROWS, totalRows).toLocaleString()} of {totalRows.toLocaleString()} rows
          </p>
        </div>
      </div>

      <div className="overflow-x-auto overflow-y-auto max-h-[600px]">
        <table className="data-table">
          <thead>
            <tr>
              <th className="w-16 text-center">#</th>
              {columns.map((col) => (
                <th key={col} className="min-w-[140px]">{col}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {currentData.map((row, rowIndex) => (
              <tr key={rowIndex}>
                <td className="text-muted-foreground font-mono text-xs text-center">
                  {startIndex + rowIndex + 1}
                </td>
                {columns.map((col) => (
                  <td key={col} className="text-foreground truncate max-w-[200px]">
                    {formatValue(row[col])}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="p-4 border-t border-border/50 flex items-center justify-between">
          <p className="text-sm text-muted-foreground font-medium">
            Page {currentPage} of {totalPages}
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-2.5 rounded-xl hover:bg-secondary disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 hover:scale-105 active:scale-95"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const pageNum = i + 1;
              return (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`w-10 h-10 rounded-xl font-medium text-sm transition-all duration-200 ${
                    currentPage === pageNum
                      ? 'gradient-header text-primary-foreground'
                      : 'hover:bg-secondary text-muted-foreground'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-2.5 rounded-xl hover:bg-secondary disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 hover:scale-105 active:scale-95"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

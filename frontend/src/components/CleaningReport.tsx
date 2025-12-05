import { CheckCircle, AlertTriangle, Info, ArrowRight } from 'lucide-react';
import type { CleaningReport as CleaningReportType } from '@/lib/api';

interface CleaningReportProps {
  report: CleaningReportType;
}

export const CleaningReport = ({ report }: CleaningReportProps) => {
  const rowChange = report.original_shape[0] - report.final_shape[0];
  const colChange = report.original_shape[1] - report.final_shape[1];

  return (
    <div className="card-elevated p-6 animate-slide-up">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl gradient-header flex items-center justify-center">
          <Info className="w-5 h-5 text-primary-foreground" />
        </div>
        <h3 className="text-lg font-semibold text-foreground">Cleaning Report</h3>
      </div>

      <div className="flex flex-col md:flex-row items-stretch gap-4 mb-6">
        <div className="flex-1 bg-secondary/50 rounded-xl p-5 border border-border/30">
          <p className="text-sm text-muted-foreground font-medium mb-1">Original Shape</p>
          <p className="text-2xl font-bold text-foreground">
            {report.original_shape[0].toLocaleString()} <span className="text-muted-foreground">×</span> {report.original_shape[1]}
          </p>
          <p className="text-xs text-muted-foreground mt-1">rows × columns</p>
        </div>

        <div className="flex items-center justify-center px-4">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <ArrowRight className="w-5 h-5 text-primary" />
          </div>
        </div>

        <div className="flex-1 bg-success/5 rounded-xl p-5 border border-success/20">
          <p className="text-sm text-success font-medium mb-1">Cleaned Shape</p>
          <p className="text-2xl font-bold text-foreground">
            {report.final_shape[0].toLocaleString()} <span className="text-muted-foreground">×</span> {report.final_shape[1]}
          </p>
          <div className="flex gap-3 mt-1">
            {rowChange !== 0 && (
              <span className="text-xs text-success font-medium">
                {rowChange > 0 ? `-${rowChange}` : `+${Math.abs(rowChange)}`} rows
              </span>
            )}
            {colChange !== 0 && (
              <span className="text-xs text-success font-medium">
                {colChange > 0 ? `-${colChange}` : `+${Math.abs(colChange)}`} cols
              </span>
            )}
          </div>
        </div>
      </div>

      {report.actions_taken && report.actions_taken.length > 0 && (
        <div className="mb-5">
          <h4 className="text-sm font-semibold text-foreground mb-3">Actions Taken</h4>
          <div className="space-y-2">
            {report.actions_taken.map((action: any, index: number) => (
              <div key={index} className="flex items-start gap-3 p-3 bg-success/5 rounded-lg border border-success/10">
                <CheckCircle className="w-4 h-4 text-success flex-shrink-0 mt-0.5" />
                <div className="text-sm text-foreground">
                  <p className="font-medium capitalize">{action.action?.replace(/_/g, ' ')}</p>
                  {action.message && <p className="text-muted-foreground text-xs mt-1">{action.message}</p>}
                  {action.count !== undefined && <p className="text-muted-foreground text-xs mt-1">Count: {action.count}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {report.warnings && report.warnings.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-foreground mb-3">Warnings</h4>
          <div className="space-y-2">
            {report.warnings.map((warning, index) => (
              <div key={index} className="flex items-start gap-3 p-3 bg-warning/5 rounded-lg border border-warning/10">
                <AlertTriangle className="w-4 h-4 text-warning flex-shrink-0 mt-0.5" />
                <span className="text-sm text-foreground">{warning}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

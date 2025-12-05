import { Link2, TrendingUp, TrendingDown, AlertCircle } from 'lucide-react';
import type { Analysis } from '@/lib/api';

interface CorrelationsTabProps {
  analysis: Analysis;
}

export const CorrelationsTab = ({ analysis }: CorrelationsTabProps) => {
  const { correlations } = analysis;

  const getCorrelationColor = (value: number): string => {
    if (value > 0) return 'text-success';
    if (value < 0) return 'text-destructive';
    return 'text-muted-foreground';
  };

  const getCorrelationBg = (value: number): string => {
    if (value > 0) return 'bg-success/10';
    if (value < 0) return 'bg-destructive/10';
    return 'bg-secondary/10';
  };

  const getCorrelationIcon = (value: number) => {
    return value > 0 ? TrendingUp : TrendingDown;
  };

  const strongCorrelations = correlations?.strong_correlations || [];
  const patterns = correlations?.patterns || [];

  return (
    <div className="space-y-6 animate-fade-in">
      {strongCorrelations.length > 0 ? (
        <div className="card-elevated overflow-hidden">
          <div className="p-4 border-b border-border flex items-center gap-2">
            <Link2 className="w-5 h-5 text-primary" />
            <h3 className="font-semibold text-foreground">Strong Correlations</h3>
          </div>
          <div className="p-4 space-y-3">
            {strongCorrelations.map((corr: any, idx: number) => {
              const CorrelationIcon = getCorrelationIcon(corr.correlation);
              return (
                <div
                  key={idx}
                  className={`p-4 rounded-lg ${getCorrelationBg(corr.correlation)} flex items-center justify-between transition-all duration-200 hover:scale-[1.02]`}
                >
                  <div className="flex items-center gap-3">
                    <CorrelationIcon className={`w-5 h-5 ${getCorrelationColor(corr.correlation)}`} />
                    <div>
                      <p className="font-medium text-foreground">
                        {corr.column1} ↔ {corr.column2}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {corr.correlation > 0 ? 'Positive' : 'Negative'} correlation
                      </p>
                    </div>
                  </div>
                  <span className={`text-2xl font-bold ${getCorrelationColor(corr.correlation)}`}>
                    {corr.correlation.toFixed(3)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="card-elevated p-8 text-center">
          <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">No strong correlations found in this dataset</p>
        </div>
      )}

      {patterns.length > 0 && (
        <div className="card-elevated overflow-hidden">
          <div className="p-4 border-b border-border flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-accent" />
            <h3 className="font-semibold text-foreground">Detected Patterns</h3>
          </div>
          <div className="p-4 space-y-3">
            {patterns.map((pattern: any, idx: number) => (
              <div key={idx} className="p-4 bg-secondary/50 rounded-lg">
                <span className="px-2 py-1 bg-accent/20 text-accent rounded text-xs font-medium mb-2 inline-block">
                  {pattern.type}
                </span>
                <p className="text-foreground">{pattern.message || pattern.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

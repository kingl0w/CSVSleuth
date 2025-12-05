import { useState } from 'react';
import { Lightbulb, TrendingUp, AlertTriangle, Info, Filter, X } from 'lucide-react';
import type { Insight } from '@/lib/api';

interface InsightsTabProps {
  insights: Insight[];
}

export const InsightsTab = ({ insights }: InsightsTabProps) => {
  const [filterSeverity, setFilterSeverity] = useState<string | null>(null);
  const [expandedInsight, setExpandedInsight] = useState<number | null>(null);

  if (!insights || !Array.isArray(insights)) {
    return (
      <div className="card-elevated p-8 text-center animate-fade-in">
        <Lightbulb className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
        <p className="text-muted-foreground">No insights available</p>
      </div>
    );
  }

  const getInsightIcon = (severity: Insight['severity']) => {
    switch (severity) {
      case 'positive':
        return TrendingUp;
      case 'warning':
        return AlertTriangle;
      default:
        return Info;
    }
  };

  const getInsightClass = (severity: Insight['severity']): string => {
    switch (severity) {
      case 'positive':
        return 'insight-card-positive';
      case 'warning':
        return 'insight-card-warning';
      default:
        return 'insight-card-info';
    }
  };

  const getIconColor = (severity: Insight['severity']): string => {
    switch (severity) {
      case 'positive':
        return 'text-success';
      case 'warning':
        return 'text-warning';
      default:
        return 'text-info';
    }
  };

  if (insights.length === 0) {
    return (
      <div className="card-elevated p-8 text-center animate-fade-in">
        <Lightbulb className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
        <p className="text-muted-foreground">No insights generated for this dataset</p>
      </div>
    );
  }

  const severityCounts = insights.reduce((acc: any, insight) => {
    acc[insight.severity] = (acc[insight.severity] || 0) + 1;
    return acc;
  }, {});

  const filteredInsights = filterSeverity
    ? insights.filter(insight => insight.severity === filterSeverity)
    : insights;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Filter className="w-4 h-4" />
          <span className="font-medium">Filter by:</span>
        </div>
        <button
          onClick={() => setFilterSeverity(null)}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
            filterSeverity === null
              ? 'bg-primary text-primary-foreground shadow-md'
              : 'bg-secondary hover:bg-secondary/80 text-secondary-foreground'
          }`}
        >
          All ({insights.length})
        </button>
        <button
          onClick={() => setFilterSeverity('positive')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
            filterSeverity === 'positive'
              ? 'bg-success text-success-foreground shadow-md'
              : 'bg-secondary hover:bg-secondary/80 text-secondary-foreground'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          Positive ({severityCounts.positive || 0})
        </button>
        <button
          onClick={() => setFilterSeverity('warning')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
            filterSeverity === 'warning'
              ? 'bg-warning text-warning-foreground shadow-md'
              : 'bg-secondary hover:bg-secondary/80 text-secondary-foreground'
          }`}
        >
          <AlertTriangle className="w-4 h-4" />
          Warnings ({severityCounts.warning || 0})
        </button>
        <button
          onClick={() => setFilterSeverity('info')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
            filterSeverity === 'info'
              ? 'bg-info text-info-foreground shadow-md'
              : 'bg-secondary hover:bg-secondary/80 text-secondary-foreground'
          }`}
        >
          <Info className="w-4 h-4" />
          Info ({severityCounts.info || 0})
        </button>
        {filterSeverity && (
          <button
            onClick={() => setFilterSeverity(null)}
            className="ml-auto px-3 py-2 rounded-lg text-sm font-medium bg-secondary/50 hover:bg-secondary text-secondary-foreground transition-all duration-200 flex items-center gap-1"
          >
            <X className="w-4 h-4" />
            Clear
          </button>
        )}
      </div>

      {filteredInsights.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredInsights.map((insight, idx) => {
            const Icon = getInsightIcon(insight.severity);
            const isExpanded = expandedInsight === idx;
            return (
              <div
                key={idx}
                className={`card-elevated p-5 ${getInsightClass(insight.severity)} cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-lg`}
                onClick={() => setExpandedInsight(isExpanded ? null : idx)}
              >
                <div className="flex items-start gap-3">
                  <Icon className={`w-5 h-5 ${getIconColor(insight.severity)} flex-shrink-0 mt-0.5 transition-transform ${isExpanded ? 'scale-110' : ''}`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-2 py-0.5 bg-secondary rounded text-xs font-medium text-muted-foreground uppercase">
                        {insight.category}
                      </span>
                    </div>
                    <p className="text-foreground font-medium mb-2">{insight.message}</p>
                    {insight.recommendation && (
                      <div className={`text-sm text-muted-foreground transition-all duration-300 overflow-hidden ${isExpanded ? 'max-h-96' : 'max-h-0'}`}>
                        <p className={`${isExpanded ? 'opacity-100 mt-2' : 'opacity-0'} transition-opacity duration-300 p-3 bg-secondary/30 rounded-lg`}>
                          <span className="font-medium">Recommendation:</span> {insight.recommendation}
                        </p>
                      </div>
                    )}
                    {!isExpanded && insight.recommendation && (
                      <p className="text-xs text-muted-foreground/60 mt-1">Click to see recommendation</p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="card-elevated p-8 text-center">
          <p className="text-muted-foreground">No insights match the selected filter</p>
        </div>
      )}
    </div>
  );
};

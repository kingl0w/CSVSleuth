import { useState } from 'react';
import { BarChart3, Calculator, Link2, Lightbulb, Image } from 'lucide-react';
import type { Analysis, Visualization } from '@/lib/api';
import { DataQualityTab } from './tabs/DataQualityTab';
import { StatisticsTab } from './tabs/StatisticsTab';
import { CorrelationsTab } from './tabs/CorrelationsTab';
import { InsightsTab } from './tabs/InsightsTab';
import { VisualizationsTab } from './tabs/VisualizationsTab';

interface AnalysisTabsProps {
  analysis: Analysis;
  visualizations: {
    distribution_charts: any[];
    correlation_heatmap: any;
    categorical_charts: any[];
    time_series_charts: any[];
    relationship_charts: any[];
  };
}

const tabs = [
  { id: 'quality', label: 'Data Quality', icon: BarChart3 },
  { id: 'statistics', label: 'Statistics', icon: Calculator },
  { id: 'correlations', label: 'Correlations', icon: Link2 },
  { id: 'insights', label: 'Insights', icon: Lightbulb },
  { id: 'visualizations', label: 'Visualizations', icon: Image },
] as const;

type TabId = typeof tabs[number]['id'];

export const AnalysisTabs = ({ analysis, visualizations }: AnalysisTabsProps) => {
  const [activeTab, setActiveTab] = useState<TabId>('quality');

  const renderTabContent = () => {
    switch (activeTab) {
      case 'quality':
        return <DataQualityTab analysis={analysis} />;
      case 'statistics':
        return <StatisticsTab analysis={analysis} />;
      case 'correlations':
        return <CorrelationsTab analysis={analysis} />;
      case 'insights':
        return <InsightsTab insights={analysis.insights} />;
      case 'visualizations':
        return <VisualizationsTab visualizations={visualizations} />;
      default:
        return null;
    }
  };

  return (
    <div className="animate-slide-up">
      <div className="flex flex-wrap gap-2 mb-8 p-1.5 bg-card rounded-2xl border border-border/50 shadow-sm">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`tab-button flex items-center gap-2.5 ${
              activeTab === tab.id ? 'tab-button-active' : 'tab-button-inactive'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            <span className="hidden sm:inline font-medium">{tab.label}</span>
          </button>
        ))}
      </div>

      <div>{renderTabContent()}</div>
    </div>
  );
};

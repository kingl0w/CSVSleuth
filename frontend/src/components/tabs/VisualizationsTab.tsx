import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { BarChart2, PieChart, LineChart, ScatterChart, Grid3X3, X, ZoomIn, ZoomOut, Download, Maximize2, ChevronLeft, ChevronRight, AlertTriangle } from 'lucide-react';
import type { Visualization } from '@/lib/api';

interface VisualizationsTabProps {
  visualizations: {
    distribution_charts: any[];
    correlation_heatmap: any;
    categorical_charts: any[];
    time_series_charts: any[];
    relationship_charts: any[];
  };
}

interface VisualizationSectionProps {
  title: string;
  icon: React.ElementType;
  charts: Visualization[];
  onChartClick: (chart: any, index: number, allCharts: any[]) => void;
}

interface FullScreenModalProps {
  chart: any;
  onClose: () => void;
  onNext: () => void;
  onPrev: () => void;
  hasNext: boolean;
  hasPrev: boolean;
  currentIndex: number;
  totalCharts: number;
}

const FullScreenModal = ({ chart, onClose, onNext, onPrev, hasNext, hasPrev, currentIndex, totalCharts }: FullScreenModalProps) => {
  const [zoom, setZoom] = useState(1);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const chartTitle = chart.title || chart.column || chart.columns?.join(' vs ') || 'Chart';
  const chartDescription = chart.description || '';

  useEffect(() => {
    setImageLoaded(false);
    setImageError(false);
    setZoom(1);
  }, [chart]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight' && hasNext) onNext();
      if (e.key === 'ArrowLeft' && hasPrev) onPrev();
      if (e.key === '+' || e.key === '=') setZoom(prev => Math.min(prev + 0.25, 3));
      if (e.key === '-' || e.key === '_') setZoom(prev => Math.max(prev - 0.25, 0.5));
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, onNext, onPrev, hasNext, hasPrev]);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = `data:image/png;base64,${chart.image}`;
    link.download = `${chartTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.png`;
    link.click();
  };

  const modalContent = (
    <div
      className="fixed inset-0 z-[9999] animate-fade-in"
      onClick={onClose}
      style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}
    >
      <div
        className="fixed inset-0 bg-black/85 backdrop-blur-sm"
        style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}
      />

      {hasPrev && (
        <button
          onClick={(e) => { e.stopPropagation(); onPrev(); }}
          className="fixed left-4 z-[10000] p-3 bg-white hover:bg-gray-100 rounded-xl shadow-lg transition-all text-gray-900"
          style={{ position: 'fixed', top: '50%', left: '1rem', transform: 'translateY(-50%)' }}
          title="Previous (←)"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
      )}
      {hasNext && (
        <button
          onClick={(e) => { e.stopPropagation(); onNext(); }}
          className="fixed right-4 z-[10000] p-3 bg-white hover:bg-gray-100 rounded-xl shadow-lg transition-all text-gray-900"
          style={{ position: 'fixed', top: '50%', right: '1rem', transform: 'translateY(-50%)' }}
          title="Next (→)"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      )}

      <div
        className="bg-white rounded-2xl shadow-2xl flex flex-col z-[10000]"
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '90vw',
          height: '90vh'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-200 flex-shrink-0">
          <div className="flex-1 min-w-0 mr-4">
            <h3 className="text-lg font-bold text-gray-900 truncate">{chartTitle}</h3>
            {chartDescription && (
              <p className="text-sm text-gray-600 mt-0.5">{chartDescription}</p>
            )}
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="text-sm text-gray-700 px-3 py-1.5 bg-gray-100 rounded-lg font-medium">
              {currentIndex + 1} / {totalCharts}
            </span>
            <button
              onClick={() => setZoom(prev => Math.max(prev - 0.25, 0.5))}
              className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-all text-gray-700"
              title="Zoom Out (-)"
            >
              <ZoomOut className="w-5 h-5" />
            </button>
            <button
              onClick={() => setZoom(prev => Math.min(prev + 0.25, 3))}
              className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-all text-gray-700"
              title="Zoom In (+)"
            >
              <ZoomIn className="w-5 h-5" />
            </button>
            <button
              onClick={() => setZoom(1)}
              className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-all text-gray-700"
              title="Reset Zoom"
            >
              <Maximize2 className="w-5 h-5" />
            </button>
            <button
              onClick={handleDownload}
              className="p-2 bg-primary hover:bg-primary/90 rounded-lg transition-all text-white"
              title="Download Chart"
            >
              <Download className="w-5 h-5" />
            </button>
            <button
              onClick={onClose}
              className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-all text-gray-700"
              title="Close (Esc)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center overflow-hidden p-4 bg-white">
          <div
            className="relative flex items-center justify-center transition-transform duration-300 ease-out"
            style={{
              transform: `scale(${zoom})`,
              transformOrigin: 'center center'
            }}
          >
            {!imageLoaded && !imageError && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              </div>
            )}

            {imageError && (
              <div className="text-center p-8">
                <AlertTriangle className="w-12 h-12 text-destructive mx-auto mb-3" />
                <p className="text-gray-600">Failed to load chart image</p>
                <p className="text-sm text-gray-400 mt-1">Please try another chart</p>
              </div>
            )}

            <img
              src={`data:image/png;base64,${chart.image}`}
              alt={chartTitle}
              className="max-w-full max-h-full object-contain"
              style={{
                display: imageLoaded ? 'block' : 'none',
                maxWidth: 'calc(90vw - 8rem)',
                maxHeight: 'calc(90vh - 10rem)'
              }}
              draggable={false}
              onLoad={() => {
                console.log('Chart loaded successfully:', chartTitle);
                setImageLoaded(true);
              }}
              onError={() => {
                console.error('Chart failed to load:', chartTitle);
                setImageError(true);
              }}
            />
          </div>
        </div>

        <div className="flex items-center justify-center gap-6 p-3 border-t border-gray-200 text-sm text-gray-600 flex-shrink-0">
          <span className="flex items-center gap-1">
            <kbd className="px-2 py-1 bg-gray-100 rounded text-xs font-mono">←</kbd>
            <kbd className="px-2 py-1 bg-gray-100 rounded text-xs font-mono">→</kbd>
            Navigate
          </span>
          <span className="flex items-center gap-1">
            <kbd className="px-2 py-1 bg-gray-100 rounded text-xs font-mono">+</kbd>
            <kbd className="px-2 py-1 bg-gray-100 rounded text-xs font-mono">-</kbd>
            Zoom
          </span>
          <span className="flex items-center gap-1">
            <kbd className="px-2 py-1 bg-gray-100 rounded text-xs font-mono">ESC</kbd>
            Close
          </span>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

const VisualizationSection = ({ title, icon: Icon, charts, onChartClick }: VisualizationSectionProps) => {
  if (!charts || charts.length === 0) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Icon className="w-5 h-5 text-primary" />
        <h3 className="font-semibold text-foreground">{title}</h3>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {charts.map((chart: any, idx: number) => {
          const chartTitle = chart.title || chart.column || chart.columns?.join(' vs ') || `Chart ${idx + 1}`;
          const chartDescription = chart.description || '';

          return (
            <div
              key={idx}
              className="card-elevated overflow-hidden cursor-pointer group transition-all duration-300 hover:scale-[1.02]"
              onClick={() => onChartClick(chart, idx, charts)}
            >
              <div className="p-4 border-b border-border flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-foreground">{chartTitle}</h4>
                  {chartDescription && (
                    <p className="text-sm text-muted-foreground mt-1">{chartDescription}</p>
                  )}
                </div>
                <Maximize2 className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors ml-2 flex-shrink-0" />
              </div>
              <div className="p-4 bg-secondary/30 relative overflow-hidden">
                <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/5 transition-colors duration-300" />
                <img
                  src={`data:image/png;base64,${chart.image}`}
                  alt={chartTitle}
                  className="w-full h-auto rounded relative z-10"
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export const VisualizationsTab = ({ visualizations }: VisualizationsTabProps) => {
  const [selectedChart, setSelectedChart] = useState<any>(null);
  const [allCharts, setAllCharts] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const hasVisualizations =
    visualizations.distribution_charts?.length > 0 ||
    visualizations.correlation_heatmap ||
    visualizations.categorical_charts?.length > 0 ||
    visualizations.time_series_charts?.length > 0 ||
    visualizations.relationship_charts?.length > 0;

  if (!hasVisualizations) {
    return (
      <div className="card-elevated p-8 text-center animate-fade-in">
        <BarChart2 className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
        <p className="text-muted-foreground">No visualizations available for this dataset</p>
      </div>
    );
  }

  const handleChartClick = (chart: any, sectionIndex: number, sectionCharts: any[]) => {
    const flattened = [
      ...(visualizations.distribution_charts || []),
      ...(visualizations.correlation_heatmap ? [visualizations.correlation_heatmap] : []),
      ...(visualizations.categorical_charts || []),
      ...(visualizations.time_series_charts || []),
      ...(visualizations.relationship_charts || []),
    ];

    setAllCharts(flattened);
    const globalIndex = flattened.findIndex(c => c === chart);
    setCurrentIndex(globalIndex);
    setSelectedChart(chart);
  };

  const handleNext = () => {
    if (currentIndex < allCharts.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setSelectedChart(allCharts[currentIndex + 1]);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setSelectedChart(allCharts[currentIndex - 1]);
    }
  };

  return (
    <>
      <div className="space-y-8 animate-fade-in">
        <VisualizationSection
          title="Distribution Charts"
          icon={BarChart2}
          charts={visualizations.distribution_charts || []}
          onChartClick={handleChartClick}
        />
        <VisualizationSection
          title="Correlation Heatmap"
          icon={Grid3X3}
          charts={visualizations.correlation_heatmap ? [visualizations.correlation_heatmap] : []}
          onChartClick={handleChartClick}
        />
        <VisualizationSection
          title="Categorical Charts"
          icon={PieChart}
          charts={visualizations.categorical_charts || []}
          onChartClick={handleChartClick}
        />
        <VisualizationSection
          title="Time Series"
          icon={LineChart}
          charts={visualizations.time_series_charts || []}
          onChartClick={handleChartClick}
        />
        <VisualizationSection
          title="Relationship Charts"
          icon={ScatterChart}
          charts={visualizations.relationship_charts || []}
          onChartClick={handleChartClick}
        />
      </div>

      {selectedChart && (
        <FullScreenModal
          chart={selectedChart}
          onClose={() => setSelectedChart(null)}
          onNext={handleNext}
          onPrev={handlePrev}
          hasNext={currentIndex < allCharts.length - 1}
          hasPrev={currentIndex > 0}
          currentIndex={currentIndex}
          totalCharts={allCharts.length}
        />
      )}
    </>
  );
};

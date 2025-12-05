import { useState, useCallback } from 'react';
import { Download, RefreshCw, FileSearch, AlertCircle, Sparkles, BarChart3, PieChart, Brush, TrendingUp } from 'lucide-react';
import { FileUpload } from '@/components/FileUpload';
import { CleaningReport } from '@/components/CleaningReport';
import { DataPreviewTable } from '@/components/DataPreviewTable';
import { AnalysisTabs } from '@/components/AnalysisTabs';
import { uploadFile, downloadFile, cleanupSession, type UploadResponse } from '@/lib/api';

const Index = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<UploadResponse | null>(null);

  const handleFileSelect = useCallback(async (file: File) => {
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      console.log('Uploading file:', file.name);
      const response = await uploadFile(file);
      console.log('Upload response:', response);
      setResult(response);
    } catch (err) {
      console.error('Upload error:', err);
      const message = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleDownload = useCallback(async () => {
    if (!result) return;

    try {
      await downloadFile(result.session_id, result.original_filename);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to download file';
      setError(message);
    }
  }, [result]);

  const handleReset = useCallback(async () => {
    if (result?.session_id) {
      try {
        await cleanupSession(result.session_id);
      } catch {
        //ignore cleanup errors
      }
    }
    setResult(null);
    setError(null);
  }, [result]);

  return (
    <div className="min-h-screen">
      {/*header*/}
      <header className="gradient-header py-10 px-4 relative">
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-primary-foreground/20 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-primary-foreground/10">
                <FileSearch className="w-8 h-8 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-primary-foreground tracking-tight">CSVSleuth</h1>
                <p className="text-primary-foreground/70 font-medium">Intelligent CSV Analysis & Cleaning</p>
              </div>
            </div>
            <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-primary-foreground/10 backdrop-blur-sm rounded-xl border border-primary-foreground/10">
              <Sparkles className="w-4 h-4 text-primary-foreground/80" />
              <span className="text-sm text-primary-foreground/80 font-medium">AI-Powered</span>
            </div>
          </div>
        </div>
      </header>

      {/*main Content*/}
      <main className="max-w-6xl mx-auto px-4 py-10">
        {/*error alert*/}
        {error && (
          <div className="mb-8 p-5 card-elevated border-destructive/20 flex items-start gap-4 animate-fade-in">
            <div className="w-10 h-10 rounded-xl bg-destructive/10 flex items-center justify-center flex-shrink-0">
              <AlertCircle className="w-5 h-5 text-destructive" />
            </div>
            <div>
              <p className="font-semibold text-destructive">Something went wrong</p>
              <p className="text-sm text-muted-foreground mt-1">{error}</p>
            </div>
          </div>
        )}

        {!result ? (
          /*upload state*/
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-10 animate-fade-in">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full mb-6">
                <BarChart3 className="w-4 h-4 text-primary" />
                <span className="text-sm font-semibold text-primary">Powerful Data Analysis</span>
              </div>
              <h2 className="text-3xl font-bold text-foreground mb-4">
                Analyze Your CSV Data
              </h2>
              <p className="text-lg text-muted-foreground max-w-md mx-auto">
                Upload a CSV file to get instant insights, cleaning reports, and beautiful visualizations
              </p>
            </div>
            <FileUpload onFileSelect={handleFileSelect} isLoading={isLoading} />
            
            {/*features*/}
            <div className="grid grid-cols-3 gap-4 mt-10 animate-fade-in" style={{ animationDelay: '0.2s' }}>
              {[
                { icon: PieChart, label: 'Smart Analysis' },
                { icon: Brush, label: 'Auto Cleaning' },
                { icon: TrendingUp, label: 'Visualizations' },
              ].map((feature, i) => (
                <div key={i} className="text-center p-4 rounded-xl bg-card border border-border/50 hover:border-primary/30 transition-colors">
                  <div className="w-10 h-10 mx-auto mb-3 rounded-lg bg-primary/10 flex items-center justify-center">
                    <feature.icon className="w-5 h-5 text-primary" />
                  </div>
                  <p className="text-sm font-medium text-muted-foreground">{feature.label}</p>
                </div>
              ))}
            </div>
          </div>
        ) : (
          /*results state*/
          <div className="space-y-8">
            {/*action buttons*/}
            <div className="flex flex-wrap items-center gap-4 animate-fade-in">
              <button onClick={handleDownload} className="btn-success flex items-center gap-2">
                <Download className="w-5 h-5" />
                Download Cleaned CSV
              </button>
              <button onClick={handleReset} className="btn-secondary flex items-center gap-2">
                <RefreshCw className="w-5 h-5" />
                Analyze New File
              </button>
              <div className="ml-auto flex items-center gap-2 px-4 py-2 bg-secondary/60 rounded-xl">
                <FileSearch className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground font-medium">
                  {result.original_filename}
                </span>
              </div>
            </div>

            {/*cleaning report*/}
            <CleaningReport report={result.cleaning_report} />

            {/*data preview*/}
            <DataPreviewTable
              data={result.preview_data}
              columns={result.preview_columns}
              totalRows={result.total_rows}
            />

            {/*analysis tabs*/}
            <div className="pt-6 animate-slide-up" style={{ animationDelay: '0.2s' }}>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl gradient-header flex items-center justify-center">
                  <BarChart3 className="w-5 h-5 text-primary-foreground" />
                </div>
                <h2 className="text-xl font-bold text-foreground">Detailed Analysis</h2>
              </div>
              <AnalysisTabs
                analysis={result.analysis}
                visualizations={result.visualizations}
              />
            </div>
          </div>
        )}
      </main>

      {/*footer*/}
      <footer className="py-8 px-4 border-t border-border/50 mt-16">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg gradient-header flex items-center justify-center">
              <FileSearch className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="text-sm font-semibold text-foreground">CSVSleuth</span>
          </div>
          <p className="text-sm text-muted-foreground">
            Fast, intelligent CSV analysis
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;

import { useCallback, useState } from 'react';
import { Upload, FileText, AlertCircle, Sparkles } from 'lucide-react';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  isLoading: boolean;
}

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

export const FileUpload = ({ onFileSelect, isLoading }: FileUploadProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateFile = (file: File): string | null => {
    if (!file.name.toLowerCase().endsWith('.csv')) {
      return 'Please upload a CSV file only';
    }
    if (file.size > MAX_FILE_SIZE) {
      return 'File size must be less than 50MB';
    }
    return null;
  };

  const handleFile = useCallback((file: File) => {
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }
    setError(null);
    onFileSelect(file);
  }, [onFileSelect]);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFile(file);
    }
  }, [handleFile]);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFile(file);
    }
  }, [handleFile]);

  if (isLoading) {
    return (
      <div className="card-elevated p-16 animate-fade-in">
        <div className="flex flex-col items-center gap-6">
          <div className="relative">
            <div className="w-20 h-20 rounded-2xl gradient-header flex items-center justify-center animate-pulse-glow">
              <FileText className="w-10 h-10 text-primary-foreground" />
            </div>
            <div className="absolute -top-1 -right-1 w-6 h-6 bg-accent rounded-lg flex items-center justify-center animate-float">
              <Sparkles className="w-4 h-4 text-accent-foreground" />
            </div>
          </div>
          <div className="text-center">
            <h3 className="text-xl font-semibold text-foreground">Processing your CSV...</h3>
            <p className="text-muted-foreground mt-2">Analyzing data patterns and generating insights</p>
          </div>
          <div className="flex gap-1.5">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-2.5 h-2.5 rounded-full bg-primary animate-bounce"
                style={{ animationDelay: `${i * 0.15}s` }}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div
        className={`upload-zone ${isDragging ? 'upload-zone-active' : ''}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => document.getElementById('file-input')?.click()}
      >
        <input
          id="file-input"
          type="file"
          accept=".csv"
          onChange={handleInputChange}
          className="hidden"
        />
        
        <div className="flex flex-col items-center gap-6 relative z-10">
          <div className="relative">
            <div className="w-24 h-24 rounded-2xl bg-primary/10 flex items-center justify-center transition-transform duration-500 group-hover:scale-110">
              <Upload className="w-12 h-12 text-primary" />
            </div>
            <div className="absolute -bottom-2 -right-2 w-10 h-10 rounded-xl gradient-header flex items-center justify-center shadow-lg">
              <Sparkles className="w-5 h-5 text-primary-foreground" />
            </div>
          </div>
          
          <div className="text-center">
            <h3 className="text-2xl font-semibold text-foreground">
              Drop your CSV file here
            </h3>
            <p className="text-muted-foreground mt-3 text-lg">
              or <span className="text-gradient font-semibold cursor-pointer hover:underline">browse</span> to select
            </p>
          </div>
          
          <div className="flex items-center gap-3 px-5 py-2.5 bg-secondary/60 rounded-full">
            <FileText className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground font-medium">CSV files only, max 50MB</span>
          </div>
        </div>
      </div>

      {error && (
        <div className="mt-6 p-5 bg-destructive/10 border border-destructive/20 rounded-xl flex items-center gap-4 animate-fade-in">
          <div className="w-10 h-10 rounded-lg bg-destructive/20 flex items-center justify-center flex-shrink-0">
            <AlertCircle className="w-5 h-5 text-destructive" />
          </div>
          <p className="text-destructive font-medium">{error}</p>
        </div>
      )}
    </div>
  );
};

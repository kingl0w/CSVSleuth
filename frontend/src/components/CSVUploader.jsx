import { useState, useRef } from 'react';

export default function CSVUploader({ onFileUpload }) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFile(files[0]);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      handleFile(file);
    }
  };

  const handleFile = (file) => {
    if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
      alert('Please select a CSV file');
      return;
    }

    if (file.size > 50 * 1024 * 1024) {
      alert('File too large. Please select a file smaller than 50MB');
      return;
    }

    setSelectedFile(file);
    if (onFileUpload) {
      onFileUpload(file);
    }
  };

  const handleBrowseClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div style={{ width: '100%', maxWidth: '500px', margin: '0 auto' }}>
      <div
        style={{
          border: `2px dashed ${isDragOver ? '#007bff' : '#ccc'}`,
          borderRadius: '12px',
          padding: '40px 20px',
          textAlign: 'center',
          cursor: 'pointer',
          backgroundColor: isDragOver ? '#e6f3ff' : selectedFile ? '#f8fff9' : '#fafafa',
          minHeight: '200px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.3s ease'
        }}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleBrowseClick}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelect}
          accept=".csv"
          style={{ display: 'none' }}
        />
        
        {!selectedFile ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
            <div style={{ fontSize: '48px', opacity: 0.7 }}>📊</div>
            <h3 style={{ margin: 0, color: '#333', fontSize: '20px' }}>Drop your CSV file here</h3>
            <p style={{ margin: 0, color: '#666', fontSize: '16px' }}>or click to browse your files</p>
            <small style={{ color: '#888', fontSize: '14px' }}>Supports CSV files up to 50MB</small>
          </div>
        ) : (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            background: 'white',
            padding: '20px',
            borderRadius: '8px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            width: '100%',
            maxWidth: '400px'
          }}>
            <div style={{ fontSize: '32px' }}>✅</div>
            <div style={{ flex: 1, textAlign: 'left' }}>
              <h4 style={{ margin: '0 0 4px 0', color: '#333', fontSize: '16px', fontWeight: 600 }}>
                {selectedFile.name}
              </h4>
              <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>
                {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
            <button 
              style={{
                background: '#ff4757',
                color: 'white',
                border: 'none',
                borderRadius: '50%',
                width: '32px',
                height: '32px',
                cursor: 'pointer',
                fontSize: '18px',
                fontWeight: 'bold'
              }}
              onClick={(e) => {
                e.stopPropagation();
                handleRemoveFile();
              }}
            >
              ×
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
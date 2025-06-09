import './App.css'
import CSVUploader from './components/CSVUploader';


function App() {
  const handleFileUpload = (file) => {
    console.log('File uploaded:', file);
  }

  return (
    <>
    <h1>CSV Analyzer</h1>
    
      <div>
        <CSVUploader onFileUpload={handleFileUpload} />  
      </div>
    </>
  )
}

export default App

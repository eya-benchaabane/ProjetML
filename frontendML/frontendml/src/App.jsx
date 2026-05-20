import { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ToastProvider } from './context/ToastContext';
import Sidebar from './components/Sidebar';
import ToastContainer from './components/ToastContainer';
import Dashboard from './pages/Dashboard';
import ModelSelection from './pages/ModelSelection';
import Hyperparameters from './pages/Hyperparameters';
import ResultsViz from './pages/ResultsViz';
import DataExplorer from './pages/DataExplorer';
import UploadData from './pages/UploadData';
import MLOpsRegistry from './pages/MLOpsRegistry';
import Experiments from './pages/Experiments';

export default function App() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <BrowserRouter>
      <ToastProvider>
        <div className="app-layout">
          <Sidebar
            collapsed={sidebarCollapsed}
            onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
          />
          <main className={`main-content ${sidebarCollapsed ? 'collapsed' : ''}`}>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/models" element={<ModelSelection />} />
              <Route path="/hyperparams" element={<Hyperparameters />} />
              <Route path="/results" element={<ResultsViz />} />
              <Route path="/data" element={<DataExplorer />} />
              <Route path="/upload" element={<UploadData />} />
              <Route path="/mlops" element={<MLOpsRegistry />} />
              <Route path="/experiments" element={<Experiments />} />
            </Routes>
          </main>
          <ToastContainer />
        </div>
      </ToastProvider>
    </BrowserRouter>
  );
}

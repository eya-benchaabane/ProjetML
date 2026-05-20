import { useState, useRef } from 'react';
import { Upload as UploadIcon, FileText, X, CheckCircle, AlertCircle } from 'lucide-react';
import { useToast } from '../context/ToastContext';

export default function UploadData() {
    const { addToast } = useToast();
    const fileInputRef = useRef(null);
    const [dragActive, setDragActive] = useState(false);
    const [uploadedFile, setUploadedFile] = useState(null);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [uploadStatus, setUploadStatus] = useState(null); // null | 'uploading' | 'success' | 'error'
    const [preview, setPreview] = useState(null);

    const handleFile = (file) => {
        if (!file) return;

        const validTypes = ['text/csv', 'application/vnd.ms-excel', 'text/plain'];
        const isCSV = file.name.endsWith('.csv') || validTypes.includes(file.type);

        if (!isCSV) {
            addToast('Please upload a CSV file.', 'error');
            return;
        }

        setUploadedFile(file);
        setUploadStatus('uploading');
        setUploadProgress(0);

        // Simulate upload progress
        let progress = 0;
        const interval = setInterval(() => {
            progress += Math.random() * 20 + 5;
            if (progress >= 100) {
                progress = 100;
                clearInterval(interval);
                setUploadProgress(100);

                // Read file preview
                const reader = new FileReader();
                reader.onload = (e) => {
                    const text = e.target.result;
                    const lines = text.split('\n').slice(0, 6);
                    const headers = lines[0].split(',');
                    const rows = lines.slice(1).map(l => l.split(','));
                    setPreview({ headers, rows, totalLines: text.split('\n').length - 1 });
                    setUploadStatus('success');
                    addToast(`"${file.name}" uploaded successfully! ${text.split('\n').length - 1} records detected.`, 'success');
                };
                reader.onerror = () => {
                    setUploadStatus('error');
                    addToast('Error reading file.', 'error');
                };
                reader.readAsText(file);
            }
            setUploadProgress(Math.min(progress, 100));
        }, 200);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setDragActive(false);
        if (e.dataTransfer.files?.length) {
            handleFile(e.dataTransfer.files[0]);
        }
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        setDragActive(true);
    };

    const handleDragLeave = () => setDragActive(false);

    const reset = () => {
        setUploadedFile(null);
        setUploadProgress(0);
        setUploadStatus(null);
        setPreview(null);
    };

    return (
        <div className="page-container">
            {/* Header */}
            <div className="top-bar">
                <div>
                    <h1 className="page-title">Upload Data</h1>
                    <p className="page-subtitle">Upload new datasets to test or retrain your models</p>
                </div>
            </div>

            <div className="grid-2" style={{ alignItems: 'start' }}>
                {/* Upload Area */}
                <div className="card">
                    <div className="card-header">
                        <div className="card-title"><UploadIcon /> Upload Dataset</div>
                    </div>

                    {!uploadedFile ? (
                        <div
                            className={`upload-area ${dragActive ? 'dragging' : ''}`}
                            onDrop={handleDrop}
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <div className="upload-icon">
                                <UploadIcon size={48} />
                            </div>
                            <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--gray-200)', marginBottom: 'var(--space-2)' }}>
                                Drop your CSV file here
                            </h3>
                            <p style={{ fontSize: '0.85rem', color: 'var(--gray-500)', marginBottom: 'var(--space-4)' }}>
                                or click to browse files
                            </p>
                            <span className="badge badge-primary" style={{ padding: '4px 12px' }}>
                                Supported: .csv files
                            </span>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept=".csv"
                                style={{ display: 'none' }}
                                onChange={(e) => handleFile(e.target.files?.[0])}
                            />
                        </div>
                    ) : (
                        <div>
                            {/* File Info */}
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                padding: 'var(--space-4)',
                                background: 'var(--surface-1)',
                                borderRadius: 'var(--radius-lg)',
                                border: '1px solid var(--glass-border)',
                                marginBottom: 'var(--space-4)',
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                                    <div style={{
                                        width: 40, height: 40,
                                        borderRadius: 'var(--radius-md)',
                                        background: uploadStatus === 'success' ? 'rgba(34,197,94,0.15)' : uploadStatus === 'error' ? 'rgba(239,68,68,0.15)' : 'rgba(99,102,241,0.15)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    }}>
                                        {uploadStatus === 'success' ? <CheckCircle size={20} style={{ color: 'var(--success-400)' }} /> :
                                            uploadStatus === 'error' ? <AlertCircle size={20} style={{ color: 'var(--danger-400)' }} /> :
                                                <FileText size={20} style={{ color: 'var(--primary-400)' }} />}
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--gray-200)' }}>
                                            {uploadedFile.name}
                                        </div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--gray-500)' }}>
                                            {(uploadedFile.size / 1024).toFixed(1)} KB
                                            {preview && ` · ${preview.totalLines} records · ${preview.headers.length} columns`}
                                        </div>
                                    </div>
                                </div>
                                <button className="btn btn-ghost btn-icon" onClick={reset}>
                                    <X size={16} />
                                </button>
                            </div>

                            {/* Progress Bar */}
                            {uploadStatus === 'uploading' && (
                                <div style={{ marginBottom: 'var(--space-4)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-1)' }}>
                                        <span style={{ fontSize: '0.78rem', color: 'var(--gray-400)' }}>Uploading…</span>
                                        <span style={{ fontSize: '0.78rem', color: 'var(--primary-400)', fontWeight: 600 }}>{Math.round(uploadProgress)}%</span>
                                    </div>
                                    <div className="progress-bar">
                                        <div className="progress-fill" style={{ width: `${uploadProgress}%` }} />
                                    </div>
                                </div>
                            )}

                            {/* Preview Table */}
                            {preview && uploadStatus === 'success' && (
                                <div>
                                    <h4 style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--gray-300)', marginBottom: 'var(--space-3)' }}>
                                        Data Preview (first 5 rows)
                                    </h4>
                                    <div className="data-table-wrapper">
                                        <table className="data-table">
                                            <thead>
                                                <tr>
                                                    {preview.headers.map((h, i) => <th key={i}>{h.trim()}</th>)}
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {preview.rows.map((row, i) => (
                                                    <tr key={i}>
                                                        {row.map((cell, j) => <td key={j}>{cell.trim()}</td>)}
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>

                                    <div style={{ display: 'flex', gap: 'var(--space-3)', marginTop: 'var(--space-4)' }}>
                                        <button className="btn btn-primary" onClick={() => addToast('Dataset submitted for model testing!', 'success')}>
                                            Use for Testing
                                        </button>
                                        <button className="btn btn-secondary" onClick={reset}>
                                            Upload Different File
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Instructions */}
                <div className="card">
                    <div className="card-header">
                        <div className="card-title">📋 Upload Guidelines</div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                        <div style={{
                            padding: 'var(--space-4)',
                            background: 'rgba(99, 102, 241, 0.05)',
                            border: '1px solid rgba(99, 102, 241, 0.1)',
                            borderRadius: 'var(--radius-lg)',
                        }}>
                            <h4 style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--primary-300)', marginBottom: 'var(--space-2)' }}>
                                Expected Format
                            </h4>
                            <p style={{ fontSize: '0.8rem', color: 'var(--gray-400)', lineHeight: 1.6 }}>
                                CSV file with headers matching the Telco Customer Churn dataset schema.
                                The file should include columns like <code style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-400)' }}>customerID</code>, <code style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-400)' }}>tenure</code>, <code style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-400)' }}>MonthlyCharges</code>, etc.
                            </p>
                        </div>

                        <div>
                            <h4 style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--gray-300)', marginBottom: 'var(--space-3)' }}>
                                Required Columns
                            </h4>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
                                {['customerID', 'gender', 'tenure', 'Contract', 'MonthlyCharges', 'TotalCharges', 'Churn'].map(col => (
                                    <span key={col} className="chip">
                                        <code style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem' }}>{col}</code>
                                    </span>
                                ))}
                            </div>
                        </div>

                        <div>
                            <h4 style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--gray-300)', marginBottom: 'var(--space-3)' }}>
                                Tips
                            </h4>
                            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                                {[
                                    'Ensure no missing values in key columns',
                                    'Numeric columns should not contain text',
                                    'Target column (Churn) should be Yes/No',
                                    'Maximum file size: 50 MB',
                                    'UTF-8 encoding recommended',
                                ].map((tip, i) => (
                                    <li key={i} style={{ fontSize: '0.8rem', color: 'var(--gray-400)', display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                                        <span style={{ color: 'var(--accent-500)', fontSize: '0.6rem' }}>●</span> {tip}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

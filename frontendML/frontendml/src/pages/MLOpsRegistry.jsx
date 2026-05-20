import { useState } from 'react';
import {
    GitBranch, Tag, Clock, ArrowLeftRight, Trash2,
    Download, Shield, Server, Archive, CheckCircle
} from 'lucide-react';
import { MODEL_VERSIONS, ALGORITHMS } from '../data/mockData';
import { useToast } from '../context/ToastContext';

const statusConfig = {
    production: { label: 'Production', badge: 'badge-success', icon: <Shield size={14} /> },
    staging: { label: 'Staging', badge: 'badge-warning', icon: <Server size={14} /> },
    archived: { label: 'Archived', badge: 'badge-primary', icon: <Archive size={14} /> },
};

export default function MLOpsRegistry() {
    const { addToast } = useToast();
    const [versions, setVersions] = useState(MODEL_VERSIONS);
    const [selectedVersion, setSelectedVersion] = useState(versions[0]);
    const [showRollbackModal, setShowRollbackModal] = useState(false);
    const [rollbackTarget, setRollbackTarget] = useState(null);

    const handlePromote = (version) => {
        setVersions(prev => prev.map(v => ({
            ...v,
            status: v.id === version.id ? 'production' : (v.status === 'production' ? 'staging' : v.status),
        })));
        addToast(`Model ${version.id} promoted to Production!`, 'success');
    };

    const handleRollback = () => {
        if (!rollbackTarget) return;
        setVersions(prev => prev.map(v => ({
            ...v,
            status: v.id === rollbackTarget.id ? 'production' : (v.status === 'production' ? 'archived' : v.status),
        })));
        addToast(`Rolled back to ${rollbackTarget.id} (${rollbackTarget.model}).`, 'warning');
        setShowRollbackModal(false);
        setRollbackTarget(null);
    };

    const handleExportModel = (version) => {
        addToast(`Exporting model ${version.id} as .pkl file…`, 'info');
        setTimeout(() => addToast(`Model ${version.id} exported successfully!`, 'success'), 1000);
    };

    return (
        <div className="page-container">
            {/* Header */}
            <div className="top-bar">
                <div>
                    <h1 className="page-title">Model Registry</h1>
                    <p className="page-subtitle">MLOps model versioning, deployment, and rollback management</p>
                </div>
                <div className="top-bar-actions">
                    <span className="badge badge-accent" style={{ padding: '4px 12px' }}>
                        <GitBranch size={12} /> MLflow Compatible
                    </span>
                </div>
            </div>

            {/* Stats */}
            <div className="stats-grid">
                <div className="stat-card primary">
                    <div className="stat-icon"><GitBranch size={20} /></div>
                    <div className="stat-value">{versions.length}</div>
                    <div className="stat-label">Total Versions</div>
                </div>
                <div className="stat-card success">
                    <div className="stat-icon"><Shield size={20} /></div>
                    <div className="stat-value">{versions.filter(v => v.status === 'production').length}</div>
                    <div className="stat-label">In Production</div>
                </div>
                <div className="stat-card warning">
                    <div className="stat-icon"><Server size={20} /></div>
                    <div className="stat-value">{versions.filter(v => v.status === 'staging').length}</div>
                    <div className="stat-label">In Staging</div>
                </div>
                <div className="stat-card accent">
                    <div className="stat-icon"><Archive size={20} /></div>
                    <div className="stat-value">{versions.filter(v => v.status === 'archived').length}</div>
                    <div className="stat-label">Archived</div>
                </div>
            </div>

            <div className="grid-2" style={{ gridTemplateColumns: '1fr 380px', alignItems: 'start' }}>
                {/* Versions List */}
                <div className="card">
                    <div className="card-header">
                        <div className="card-title"><Tag /> Model Versions</div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                        {versions.map((v) => {
                            const st = statusConfig[v.status];
                            const isSelected = selectedVersion?.id === v.id;
                            return (
                                <div
                                    key={v.id}
                                    onClick={() => setSelectedVersion(v)}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        padding: 'var(--space-4)',
                                        background: isSelected ? 'rgba(99, 102, 241, 0.08)' : 'var(--surface-1)',
                                        borderRadius: 'var(--radius-lg)',
                                        border: isSelected ? '1px solid rgba(99, 102, 241, 0.3)' : '1px solid var(--glass-border)',
                                        cursor: 'pointer',
                                        transition: 'all var(--transition-fast)',
                                    }}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                                        <div style={{
                                            width: 40, height: 40,
                                            borderRadius: 'var(--radius-md)',
                                            background: v.status === 'production' ? 'rgba(34,197,94,0.15)' :
                                                v.status === 'staging' ? 'rgba(245,158,11,0.15)' :
                                                    'rgba(99,102,241,0.1)',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            color: v.status === 'production' ? 'var(--success-400)' :
                                                v.status === 'staging' ? 'var(--warning-400)' :
                                                    'var(--primary-400)',
                                        }}>
                                            {st.icon}
                                        </div>
                                        <div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                                                <span style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--gray-100)', fontFamily: 'var(--font-mono)' }}>
                                                    {v.id}
                                                </span>
                                                <span className={`badge ${st.badge}`}>{st.label}</span>
                                                {v.tag && (
                                                    <span className="badge badge-accent">{v.tag}</span>
                                                )}
                                            </div>
                                            <div style={{ fontSize: '0.78rem', color: 'var(--gray-500)', marginTop: 2 }}>
                                                {v.model} · {v.date}
                                            </div>
                                        </div>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--gray-200)' }}>
                                            {(v.accuracy * 100).toFixed(1)}%
                                        </div>
                                        <div style={{ fontSize: '0.7rem', color: 'var(--gray-500)' }}>accuracy</div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Version Details Panel */}
                <div className="card" style={{ position: 'sticky', top: 'var(--space-4)' }}>
                    <div className="card-header">
                        <div className="card-title">Version Details</div>
                    </div>
                    {selectedVersion ? (
                        <div>
                            <div style={{
                                textAlign: 'center',
                                padding: 'var(--space-4)',
                                background: 'var(--surface-1)',
                                borderRadius: 'var(--radius-lg)',
                                marginBottom: 'var(--space-4)',
                            }}>
                                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.5rem', fontWeight: 800, color: 'var(--primary-300)' }}>
                                    {selectedVersion.id}
                                </div>
                                <div style={{ fontSize: '0.85rem', color: 'var(--gray-400)', marginTop: 'var(--space-1)' }}>
                                    {selectedVersion.model}
                                </div>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', marginBottom: 'var(--space-4)' }}>
                                {[
                                    { label: 'Status', value: statusConfig[selectedVersion.status].label },
                                    { label: 'Accuracy', value: `${(selectedVersion.accuracy * 100).toFixed(2)}%` },
                                    { label: 'Date', value: selectedVersion.date },
                                    { label: 'Tag', value: selectedVersion.tag || '—' },
                                    { label: 'Dataset', value: 'telco_churn_v2.csv' },
                                    { label: 'Framework', value: 'scikit-learn 1.4.0' },
                                ].map((item) => (
                                    <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                                        <span style={{ color: 'var(--gray-500)' }}>{item.label}</span>
                                        <span style={{ color: 'var(--gray-200)', fontWeight: 500 }}>{item.value}</span>
                                    </div>
                                ))}
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                                {selectedVersion.status !== 'production' && (
                                    <button className="btn btn-success" style={{ width: '100%' }} onClick={() => handlePromote(selectedVersion)}>
                                        <Shield size={14} /> Promote to Production
                                    </button>
                                )}
                                <button className="btn btn-secondary" style={{ width: '100%' }} onClick={() => handleExportModel(selectedVersion)}>
                                    <Download size={14} /> Export Model (.pkl)
                                </button>
                                {selectedVersion.status === 'production' && (
                                    <button
                                        className="btn btn-danger" style={{ width: '100%' }}
                                        onClick={() => {
                                            const others = versions.filter(v => v.id !== selectedVersion.id);
                                            if (others.length) {
                                                setRollbackTarget(others[0]);
                                                setShowRollbackModal(true);
                                            }
                                        }}
                                    >
                                        <ArrowLeftRight size={14} /> Rollback
                                    </button>
                                )}
                            </div>
                        </div>
                    ) : (
                        <p style={{ fontSize: '0.85rem', color: 'var(--gray-500)', textAlign: 'center' }}>
                            Select a version to view details.
                        </p>
                    )}
                </div>
            </div>

            {/* Rollback Modal */}
            {showRollbackModal && (
                <div className="modal-overlay" onClick={() => setShowRollbackModal(false)}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3 className="modal-title">⚠️ Confirm Rollback</h3>
                            <button className="btn btn-ghost btn-icon" onClick={() => setShowRollbackModal(false)}>
                                <span>✕</span>
                            </button>
                        </div>
                        <div className="modal-body">
                            <p style={{ fontSize: '0.9rem', color: 'var(--gray-300)', marginBottom: 'var(--space-4)' }}>
                                Are you sure you want to rollback to a previous model version? The current production model will be archived.
                            </p>
                            <div style={{ marginBottom: 'var(--space-4)' }}>
                                <label className="input-label" style={{ marginBottom: 'var(--space-2)' }}>Roll back to:</label>
                                <select
                                    className="select"
                                    style={{ width: '100%' }}
                                    value={rollbackTarget?.id || ''}
                                    onChange={(e) => setRollbackTarget(versions.find(v => v.id === e.target.value))}
                                >
                                    {versions.filter(v => v.status !== 'production').map(v => (
                                        <option key={v.id} value={v.id}>
                                            {v.id} — {v.model} ({(v.accuracy * 100).toFixed(1)}%)
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-secondary" onClick={() => setShowRollbackModal(false)}>Cancel</button>
                            <button className="btn btn-danger" onClick={handleRollback}>
                                <ArrowLeftRight size={14} /> Confirm Rollback
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

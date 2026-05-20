import { useState, useMemo, useEffect } from 'react';
import {
    History, Search, Filter, Eye, ArrowUpRight,
    Clock, GitCompare, ChevronDown
} from 'lucide-react';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { EXPERIMENT_HISTORY, ALGORITHMS } from '../data/mockData';
import { useToast } from '../context/ToastContext';

const tooltipStyle = {
    background: 'var(--surface-3)',
    border: '1px solid var(--glass-border)',
    borderRadius: '8px',
    color: 'var(--gray-200)',
    fontSize: '0.8rem',
};

export default function Experiments() {
    const { addToast } = useToast();
    const [experiments, setExperiments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterModel, setFilterModel] = useState('all');
    const [filterStatus, setFilterStatus] = useState('all');
    const [selectedExps, setSelectedExps] = useState([]);
    const [expandedExp, setExpandedExp] = useState(null);

    useEffect(() => {
        fetch('http://localhost:8000/api/experiments')
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) {
                    setExperiments(data);
                } else {
                    console.error('API Error:', data);
                    addToast('Failed to load experiments from API', 'error');
                }
            })
            .catch(err => {
                console.error(err);
                addToast('Failed to connect to backend ML API', 'error');
            })
            .finally(() => setLoading(false));
    }, [addToast]);

    const filteredExps = useMemo(() => {
        return experiments.filter(e => {
            if (filterModel !== 'all' && e.model !== filterModel) return false;
            if (filterStatus !== 'all' && e.status !== filterStatus) return false;
            return true;
        });
    }, [experiments, filterModel, filterStatus]);

    const toggleSelect = (id) => {
        setSelectedExps(prev =>
            prev.includes(id) ? prev.filter(e => e !== id) : [...prev, id]
        );
    };

    // Chart data - accuracy over experiments
    const chartData = useMemo(() => {
        return [...experiments].reverse().map((e, idx) => ({
            name: `Exp ${idx + 1}`,
            accuracy: +(e.accuracy * 100).toFixed(1),
            f1: +(e.f1 * 100).toFixed(1),
            auc: +(e.auc * 100).toFixed(1),
            model: e.modelName,
        }));
    }, [experiments]);

    const compareExps = selectedExps.length >= 2 ? experiments.filter(e => selectedExps.includes(e.id)) : null;

    return (
        <div className="page-container">
            {/* Header */}
            <div className="top-bar">
                <div>
                    <h1 className="page-title">Experiments History</h1>
                    <p className="page-subtitle">Track, compare, and analyze past training runs</p>
                </div>
                <div className="top-bar-actions">
                    {selectedExps.length >= 2 && (
                        <span className="badge badge-accent" style={{ padding: '4px 12px' }}>
                            <GitCompare size={12} /> {selectedExps.length} selected for comparison
                        </span>
                    )}
                </div>
            </div>

            {/* Accuracy Trend Chart */}
            <div className="card" style={{ marginBottom: 'var(--space-6)' }}>
                <div className="card-header">
                    <div className="card-title"><ArrowUpRight /> Performance Trend Over Experiments</div>
                </div>
                <ResponsiveContainer width="100%" height={280}>
                    <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(99,102,241,0.1)" />
                        <XAxis dataKey="name" stroke="var(--gray-500)" fontSize={12} />
                        <YAxis stroke="var(--gray-500)" fontSize={12} domain={[55, 95]} />
                        <Tooltip
                            contentStyle={tooltipStyle}
                            labelFormatter={(value, payload) => {
                                const d = payload?.[0]?.payload;
                                return d ? `${value} — ${d.model}` : value;
                            }}
                        />
                        <Legend />
                        <Line type="monotone" dataKey="accuracy" name="Accuracy" stroke="#6366f1" strokeWidth={2} dot={{ r: 5 }} />
                        <Line type="monotone" dataKey="f1" name="F1-Score" stroke="#06b6d4" strokeWidth={2} dot={{ r: 4 }} />
                        <Line type="monotone" dataKey="auc" name="AUC-ROC" stroke="#8b5cf6" strokeWidth={2} dot={{ r: 4 }} />
                    </LineChart>
                </ResponsiveContainer>
            </div>

            {/* Filters */}
            <div className="card" style={{ marginBottom: 'var(--space-4)' }}>
                <div style={{ display: 'flex', gap: 'var(--space-4)', alignItems: 'center', flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                        <Filter size={14} style={{ color: 'var(--gray-500)' }} />
                        <select className="select" value={filterModel} onChange={(e) => setFilterModel(e.target.value)}>
                            <option value="all">All Models</option>
                            {ALGORITHMS.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                        </select>
                    </div>
                    <select className="select" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                        <option value="all">All Statuses</option>
                        <option value="success">Success</option>
                        <option value="warning">Warning</option>
                    </select>
                    <div style={{ flex: 1 }} />
                    <span style={{ fontSize: '0.8rem', color: 'var(--gray-500)' }}>
                        {filteredExps.length} experiment(s)
                    </span>
                </div>
            </div>

            {/* Comparison Panel */}
            {compareExps && (
                <div className="card" style={{ marginBottom: 'var(--space-4)', borderColor: 'rgba(6, 182, 212, 0.3)' }}>
                    <div className="card-header">
                        <div className="card-title" style={{ color: 'var(--accent-400)' }}>
                            <GitCompare /> Side-by-Side Comparison
                        </div>
                    </div>
                    <div className="data-table-wrapper">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Metric</th>
                                    {compareExps.map(e => <th key={e.id}>{e.modelName} ({e.version})</th>)}
                                </tr>
                            </thead>
                            <tbody>
                                {['accuracy', 'f1', 'auc'].map(metric => {
                                    const values = compareExps.map(e => e[metric]);
                                    const best = Math.max(...values);
                                    return (
                                        <tr key={metric}>
                                            <td style={{ fontWeight: 600, textTransform: 'uppercase', fontSize: '0.75rem' }}>{metric === 'auc' ? 'AUC-ROC' : metric}</td>
                                            {compareExps.map(e => (
                                                <td key={e.id} style={{ fontWeight: e[metric] === best ? 700 : 400, color: e[metric] === best ? 'var(--success-400)' : 'var(--gray-300)' }}>
                                                    {(e[metric] * 100).toFixed(2)}%
                                                    {e[metric] === best && ' 🏆'}
                                                </td>
                                            ))}
                                        </tr>
                                    );
                                })}
                                <tr>
                                    <td style={{ fontWeight: 600, textTransform: 'uppercase', fontSize: '0.75rem' }}>Training Time</td>
                                    {compareExps.map(e => (
                                        <td key={e.id} style={{ fontFamily: 'var(--font-mono)' }}>—</td>
                                    ))}
                                </tr>
                                <tr>
                                    <td style={{ fontWeight: 600, textTransform: 'uppercase', fontSize: '0.75rem' }}>Dataset</td>
                                    {compareExps.map(e => (
                                        <td key={e.id}>{e.datasetVersion}</td>
                                    ))}
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Experiments List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                {filteredExps.map((exp) => {
                    const isExpanded = expandedExp === exp.id;
                    const isChecked = selectedExps.includes(exp.id);
                    return (
                        <div
                            key={exp.id}
                            className="card"
                            style={{
                                padding: 0,
                                borderColor: isChecked ? 'rgba(6, 182, 212, 0.3)' : undefined,
                            }}
                        >
                            {/* Main Row */}
                            <div
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    padding: 'var(--space-4) var(--space-5)',
                                    cursor: 'pointer',
                                }}
                                onClick={() => setExpandedExp(isExpanded ? null : exp.id)}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
                                    {/* Checkbox */}
                                    <div
                                        onClick={(e) => { e.stopPropagation(); toggleSelect(exp.id); }}
                                        style={{
                                            width: 20, height: 20,
                                            borderRadius: 'var(--radius-sm)',
                                            border: isChecked ? '2px solid var(--accent-400)' : '2px solid var(--gray-600)',
                                            background: isChecked ? 'var(--accent-500)' : 'transparent',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            cursor: 'pointer', transition: 'all var(--transition-fast)',
                                            flexShrink: 0,
                                        }}
                                    >
                                        {isChecked && <span style={{ color: 'white', fontSize: '0.7rem', fontWeight: 700 }}>✓</span>}
                                    </div>

                                    {/* Status Icon */}
                                    <div style={{
                                        width: 36, height: 36,
                                        borderRadius: 'var(--radius-md)',
                                        background: exp.status === 'success' ? 'rgba(34,197,94,0.15)' : 'rgba(245,158,11,0.15)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontSize: '1rem',
                                    }}>
                                        {exp.status === 'success' ? '✓' : '⚠'}
                                    </div>

                                    {/* Info */}
                                    <div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                                            <span style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--gray-100)' }}>
                                                {exp.modelName}
                                            </span>
                                            <span className="badge badge-primary">{exp.version}</span>
                                            <span className="badge badge-accent">{exp.datasetVersion}</span>
                                        </div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--gray-500)', display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginTop: 2 }}>
                                            <Clock size={12} />
                                            {new Date(exp.timestamp).toLocaleString()}
                                            <span style={{ color: 'var(--gray-600)' }}>·</span>
                                            {exp.id}
                                        </div>
                                    </div>
                                </div>

                                {/* Metrics */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-6)' }}>
                                    <div style={{ textAlign: 'center' }}>
                                        <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--gray-100)' }}>{(exp.accuracy * 100).toFixed(1)}%</div>
                                        <div style={{ fontSize: '0.65rem', color: 'var(--gray-500)' }}>Accuracy</div>
                                    </div>
                                    <div style={{ textAlign: 'center' }}>
                                        <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--accent-400)' }}>{(exp.f1 * 100).toFixed(1)}%</div>
                                        <div style={{ fontSize: '0.65rem', color: 'var(--gray-500)' }}>F1</div>
                                    </div>
                                    <div style={{ textAlign: 'center' }}>
                                        <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--primary-300)' }}>{(exp.auc * 100).toFixed(1)}%</div>
                                        <div style={{ fontSize: '0.65rem', color: 'var(--gray-500)' }}>AUC</div>
                                    </div>
                                    <ChevronDown size={18} style={{
                                        color: 'var(--gray-500)',
                                        transition: 'transform var(--transition-fast)',
                                        transform: isExpanded ? 'rotate(180deg)' : 'rotate(0)',
                                    }} />
                                </div>
                            </div>

                            {/* Expanded Panel */}
                            {isExpanded && (
                                <div style={{
                                    padding: 'var(--space-4) var(--space-5)',
                                    borderTop: '1px solid var(--glass-border)',
                                    background: 'var(--surface-1)',
                                }}>
                                    <div className="grid-2" style={{ gap: 'var(--space-6)' }}>
                                        {/* Parameters */}
                                        <div>
                                            <h4 style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--gray-400)', marginBottom: 'var(--space-3)' }}>
                                                Hyperparameters
                                            </h4>
                                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
                                                {Object.entries(exp.params).map(([k, v]) => (
                                                    <span key={k} style={{
                                                        fontFamily: 'var(--font-mono)',
                                                        fontSize: '0.75rem',
                                                        background: 'var(--surface-3)',
                                                        padding: '3px 10px',
                                                        borderRadius: 'var(--radius-sm)',
                                                        color: 'var(--gray-300)',
                                                        border: '1px solid var(--glass-border)',
                                                    }}>
                                                        <span style={{ color: 'var(--primary-400)' }}>{k}</span>
                                                        <span style={{ color: 'var(--gray-500)' }}>=</span>
                                                        {v}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Notes */}
                                        <div>
                                            <h4 style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--gray-400)', marginBottom: 'var(--space-3)' }}>
                                                Notes
                                            </h4>
                                            <p style={{ fontSize: '0.85rem', color: 'var(--gray-300)', lineHeight: 1.6 }}>
                                                {exp.notes}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

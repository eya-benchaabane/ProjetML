import { useState, useMemo } from 'react';
import {
    BarChart3, Download, Image, FileSpreadsheet, Maximize2
} from 'lucide-react';
import {
    LineChart, Line, BarChart, Bar, XAxis, YAxis,
    CartesianGrid, Tooltip, ResponsiveContainer, Legend,
    RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from 'recharts';
import { ALGORITHMS, MOCK_RESULTS } from '../data/mockData';
import { useToast } from '../context/ToastContext';

const CHART_COLORS = ['#6366f1', '#06b6d4', '#8b5cf6', '#f43f5e', '#f59e0b', '#22c55e'];

const tooltipStyle = {
    background: 'var(--surface-3)',
    border: '1px solid var(--glass-border)',
    borderRadius: '8px',
    color: 'var(--gray-200)',
    fontSize: '0.8rem',
};

export default function ResultsViz() {
    const { addToast } = useToast();
    const [selectedModels, setSelectedModels] = useState(['gradient_boosting', 'random_forest']);
    const [activeTab, setActiveTab] = useState('metrics');
    const [fullscreenChart, setFullscreenChart] = useState(null);

    const toggleModel = (id) => {
        setSelectedModels(prev =>
            prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id]
        );
    };

    const comparisonData = useMemo(() => {
        return selectedModels.map(id => {
            const algo = ALGORITHMS.find(a => a.id === id);
            const res = MOCK_RESULTS[id];
            return {
                name: algo?.name?.replace(' (MLP)', '') || id,
                shortName: algo?.name?.split(' ')[0] || id,
                accuracy: +(res.accuracy * 100).toFixed(1),
                precision: +(res.precision * 100).toFixed(1),
                recall: +(res.recall * 100).toFixed(1),
                f1: +(res.f1 * 100).toFixed(1),
                auc: +(res.auc_roc * 100).toFixed(1),
                time: res.training_time,
                ...res,
            };
        });
    }, [selectedModels]);

    const radarData = useMemo(() => {
        const metrics = ['accuracy', 'precision', 'recall', 'f1', 'auc'];
        return metrics.map(metric => {
            const point = { metric: metric.toUpperCase() };
            selectedModels.forEach(id => {
                const algo = ALGORITHMS.find(a => a.id === id);
                const res = MOCK_RESULTS[id];
                point[algo?.name?.split(' ')[0] || id] = +(res[metric === 'auc' ? 'auc_roc' : metric] * 100).toFixed(1);
            });
            return point;
        });
    }, [selectedModels]);

    const handleExport = (format) => {
        addToast(`Exporting results as ${format.toUpperCase()}…`, 'info');
        setTimeout(() => addToast(`Results exported as ${format.toUpperCase()} successfully!`, 'success'), 800);
    };

    return (
        <div className="page-container">
            {/* Header */}
            <div className="top-bar">
                <div>
                    <h1 className="page-title">Results & Visualization</h1>
                    <p className="page-subtitle">Analyze and compare model performance metrics</p>
                </div>
                <div className="top-bar-actions">
                    <button className="btn btn-secondary" onClick={() => handleExport('png')}>
                        <Image size={14} /> PNG
                    </button>
                    <button className="btn btn-secondary" onClick={() => handleExport('csv')}>
                        <FileSpreadsheet size={14} /> CSV
                    </button>
                </div>
            </div>

            {/* Model Selector */}
            <div className="card" style={{ marginBottom: 'var(--space-6)' }}>
                <div className="card-header">
                    <div className="card-title">Select models to compare</div>
                    <span className="badge badge-primary">{selectedModels.length} selected</span>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
                    {ALGORITHMS.map((algo, idx) => (
                        <div
                            key={algo.id}
                            className={`chip ${selectedModels.includes(algo.id) ? 'selected' : ''}`}
                            onClick={() => toggleModel(algo.id)}
                            style={selectedModels.includes(algo.id) ? {
                                borderColor: CHART_COLORS[idx % CHART_COLORS.length],
                                color: CHART_COLORS[idx % CHART_COLORS.length],
                                background: `${CHART_COLORS[idx % CHART_COLORS.length]}15`,
                            } : {}}
                        >
                            {algo.icon} {algo.name}
                        </div>
                    ))}
                </div>
            </div>

            {/* Tabs */}
            <div className="tabs" style={{ marginBottom: 'var(--space-6)' }}>
                {[
                    { key: 'metrics', label: 'Performance Metrics' },
                    { key: 'confusion', label: 'Confusion Matrix' },
                    { key: 'roc', label: 'ROC Curves' },
                    { key: 'pr', label: 'PR Curves' },
                    { key: 'features', label: 'Feature Importance' },
                    { key: 'radar', label: 'Radar Chart' },
                ].map(t => (
                    <button
                        key={t.key}
                        className={`tab ${activeTab === t.key ? 'active' : ''}`}
                        onClick={() => setActiveTab(t.key)}
                    >
                        {t.label}
                    </button>
                ))}
            </div>

            {/* ===== METRICS TAB ===== */}
            {activeTab === 'metrics' && (
                <div>
                    {/* Summary Table */}
                    <div className="card" style={{ marginBottom: 'var(--space-6)' }}>
                        <div className="card-header">
                            <div className="card-title"><BarChart3 /> Performance Comparison</div>
                        </div>
                        <div className="data-table-wrapper">
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th>Model</th>
                                        <th>Accuracy</th>
                                        <th>Precision</th>
                                        <th>Recall</th>
                                        <th>F1-Score</th>
                                        <th>AUC-ROC</th>
                                        <th>Time</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {comparisonData.map((d, idx) => (
                                        <tr key={d.name}>
                                            <td>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                                                    <span style={{ width: 10, height: 10, borderRadius: '50%', background: CHART_COLORS[idx], display: 'inline-block' }} />
                                                    <strong style={{ color: 'var(--gray-200)' }}>{d.name}</strong>
                                                </div>
                                            </td>
                                            <td>
                                                <span style={{ fontWeight: 700, color: d.accuracy >= 83 ? 'var(--success-400)' : 'var(--gray-200)' }}>
                                                    {d.accuracy}%
                                                </span>
                                            </td>
                                            <td>{d.precision}%</td>
                                            <td>{d.recall}%</td>
                                            <td>{d.f1}%</td>
                                            <td>{d.auc}%</td>
                                            <td><span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>{d.time}</span></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Bar Chart Comparison */}
                    <div className="card">
                        <div className="card-header">
                            <div className="card-title">Visual Comparison</div>
                        </div>
                        <ResponsiveContainer width="100%" height={350}>
                            <BarChart data={comparisonData} barGap={6}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(99,102,241,0.1)" />
                                <XAxis dataKey="shortName" stroke="var(--gray-500)" fontSize={12} />
                                <YAxis stroke="var(--gray-500)" fontSize={12} domain={[40, 100]} />
                                <Tooltip contentStyle={tooltipStyle} />
                                <Legend />
                                <Bar dataKey="accuracy" name="Accuracy" fill="#6366f1" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="precision" name="Precision" fill="#06b6d4" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="recall" name="Recall" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="f1" name="F1" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            )}

            {/* ===== CONFUSION MATRIX TAB ===== */}
            {activeTab === 'confusion' && (
                <div className={selectedModels.length > 1 ? 'grid-2' : ''} style={{ alignItems: 'start' }}>
                    {comparisonData.map((d, idx) => {
                        const cm = d.confusion_matrix;
                        const total = cm.tp + cm.fp + cm.fn + cm.tn;
                        return (
                            <div className="card" key={d.name}>
                                <div className="card-header">
                                    <div className="card-title" style={{ color: CHART_COLORS[idx] }}>
                                        {d.name}
                                    </div>
                                    <span className="badge badge-primary">Accuracy: {d.accuracy}%</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'center', padding: 'var(--space-4)' }}>
                                    <div className="confusion-matrix">
                                        <div className="cm-label"></div>
                                        <div className="cm-label" style={{ fontWeight: 700, color: 'var(--gray-300)' }}>Predicted Churn</div>
                                        <div className="cm-label" style={{ fontWeight: 700, color: 'var(--gray-300)' }}>Predicted Stay</div>

                                        <div className="cm-label" style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)', fontWeight: 700, color: 'var(--gray-300)' }}>Actual Churn</div>
                                        <div className="cm-cell tp">
                                            {cm.tp}
                                            <span className="cm-percent">TP ({((cm.tp / total) * 100).toFixed(1)}%)</span>
                                        </div>
                                        <div className="cm-cell fn">
                                            {cm.fn}
                                            <span className="cm-percent">FN ({((cm.fn / total) * 100).toFixed(1)}%)</span>
                                        </div>

                                        <div className="cm-label" style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)', fontWeight: 700, color: 'var(--gray-300)' }}>Actual Stay</div>
                                        <div className="cm-cell fp">
                                            {cm.fp}
                                            <span className="cm-percent">FP ({((cm.fp / total) * 100).toFixed(1)}%)</span>
                                        </div>
                                        <div className="cm-cell tn">
                                            {cm.tn}
                                            <span className="cm-percent">TN ({((cm.tn / total) * 100).toFixed(1)}%)</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* ===== ROC CURVES TAB ===== */}
            {activeTab === 'roc' && (
                <div className="card">
                    <div className="card-header">
                        <div className="card-title">ROC Curves (Receiver Operating Characteristic)</div>
                    </div>
                    <ResponsiveContainer width="100%" height={420}>
                        <LineChart>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(99,102,241,0.1)" />
                            <XAxis
                                dataKey="fpr"
                                type="number"
                                domain={[0, 1]}
                                stroke="var(--gray-500)"
                                fontSize={12}
                                label={{ value: 'False Positive Rate', position: 'insideBottom', offset: -5, fill: 'var(--gray-400)', fontSize: 12 }}
                            />
                            <YAxis
                                dataKey="tpr"
                                domain={[0, 1]}
                                stroke="var(--gray-500)"
                                fontSize={12}
                                label={{ value: 'True Positive Rate', angle: -90, position: 'insideLeft', offset: 10, fill: 'var(--gray-400)', fontSize: 12 }}
                            />
                            <Tooltip contentStyle={tooltipStyle} />
                            <Legend />
                            {/* Diagonal reference line */}
                            <Line
                                data={[{ fpr: 0, tpr: 0 }, { fpr: 1, tpr: 1 }]}
                                dataKey="tpr"
                                stroke="var(--gray-600)"
                                strokeDasharray="5 5"
                                dot={false}
                                name="Random (AUC=0.5)"
                            />
                            {comparisonData.map((d, idx) => (
                                <Line
                                    key={d.name}
                                    data={d.roc_curve}
                                    dataKey="tpr"
                                    stroke={CHART_COLORS[idx]}
                                    strokeWidth={2}
                                    dot={false}
                                    name={`${d.shortName} (AUC=${(d.auc / 100).toFixed(3)})`}
                                />
                            ))}
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            )}

            {/* ===== PR CURVES TAB ===== */}
            {activeTab === 'pr' && (
                <div className="card">
                    <div className="card-header">
                        <div className="card-title">Precision-Recall Curves</div>
                    </div>
                    <ResponsiveContainer width="100%" height={420}>
                        <LineChart>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(99,102,241,0.1)" />
                            <XAxis
                                dataKey="recall"
                                type="number"
                                domain={[0, 1]}
                                stroke="var(--gray-500)"
                                fontSize={12}
                                label={{ value: 'Recall', position: 'insideBottom', offset: -5, fill: 'var(--gray-400)', fontSize: 12 }}
                            />
                            <YAxis
                                dataKey="precision"
                                domain={[0, 1]}
                                stroke="var(--gray-500)"
                                fontSize={12}
                                label={{ value: 'Precision', angle: -90, position: 'insideLeft', offset: 10, fill: 'var(--gray-400)', fontSize: 12 }}
                            />
                            <Tooltip contentStyle={tooltipStyle} />
                            <Legend />
                            {comparisonData.map((d, idx) => (
                                <Line
                                    key={d.name}
                                    data={d.pr_curve}
                                    dataKey="precision"
                                    stroke={CHART_COLORS[idx]}
                                    strokeWidth={2}
                                    dot={false}
                                    name={d.shortName}
                                />
                            ))}
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            )}

            {/* ===== FEATURE IMPORTANCE TAB ===== */}
            {activeTab === 'features' && (
                <div className={selectedModels.length > 1 ? 'grid-2' : ''} style={{ alignItems: 'start' }}>
                    {comparisonData.map((d, idx) => (
                        <div className="card" key={d.name}>
                            <div className="card-header">
                                <div className="card-title" style={{ color: CHART_COLORS[idx] }}>
                                    {d.name} — Feature Importance
                                </div>
                            </div>
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart
                                    data={d.feature_importance}
                                    layout="vertical"
                                    margin={{ left: 80 }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(99,102,241,0.1)" />
                                    <XAxis type="number" domain={[0, 0.35]} stroke="var(--gray-500)" fontSize={11} />
                                    <YAxis type="category" dataKey="feature" stroke="var(--gray-400)" fontSize={11} width={80} />
                                    <Tooltip contentStyle={tooltipStyle} />
                                    <Bar
                                        dataKey="importance"
                                        name="Importance"
                                        fill={CHART_COLORS[idx]}
                                        radius={[0, 4, 4, 0]}
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    ))}
                </div>
            )}

            {/* ===== RADAR CHART TAB ===== */}
            {activeTab === 'radar' && (
                <div className="card">
                    <div className="card-header">
                        <div className="card-title">Multi-Metric Radar Comparison</div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                        <ResponsiveContainer width="100%" height={450}>
                            <RadarChart data={radarData}>
                                <PolarGrid stroke="rgba(99,102,241,0.15)" />
                                <PolarAngleAxis dataKey="metric" stroke="var(--gray-400)" fontSize={12} />
                                <PolarRadiusAxis domain={[50, 100]} stroke="var(--gray-600)" fontSize={10} />
                                {selectedModels.map((id, idx) => {
                                    const algo = ALGORITHMS.find(a => a.id === id);
                                    const key = algo?.name?.split(' ')[0] || id;
                                    return (
                                        <Radar
                                            key={id}
                                            name={key}
                                            dataKey={key}
                                            stroke={CHART_COLORS[idx]}
                                            fill={CHART_COLORS[idx]}
                                            fillOpacity={0.15}
                                            strokeWidth={2}
                                        />
                                    );
                                })}
                                <Legend />
                                <Tooltip contentStyle={tooltipStyle} />
                            </RadarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            )}
        </div>
    );
}

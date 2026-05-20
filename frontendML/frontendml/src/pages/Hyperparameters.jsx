import { useState } from 'react';
import {
    SlidersHorizontal, Save, RotateCcw, Wand2, HelpCircle,
    Settings2, Download, Upload
} from 'lucide-react';
import { ALGORITHMS } from '../data/mockData';
import { useToast } from '../context/ToastContext';

export default function Hyperparameters() {
    const { addToast } = useToast();
    const [selectedAlgo, setSelectedAlgo] = useState('gradient_boosting');
    const [params, setParams] = useState({});
    const [tuningMethod, setTuningMethod] = useState('grid');
    const [savedConfigs, setSavedConfigs] = useState([
        { name: 'Best GB Config', algo: 'gradient_boosting', params: { n_estimators: 200, learning_rate: 0.05, max_depth: 5, subsample: 0.8, min_samples_leaf: 2 } },
        { name: 'Fast RF Config', algo: 'random_forest', params: { n_estimators: 50, max_depth: 8, min_samples_split: 5, min_samples_leaf: 2, criterion: 'gini' } },
    ]);
    const [showTooltip, setShowTooltip] = useState(null);

    const algo = ALGORITHMS.find(a => a.id === selectedAlgo);

    const getParamValue = (hp) => {
        return params[hp.key] !== undefined ? params[hp.key] : hp.default;
    };

    const setParamValue = (key, value) => {
        setParams(prev => ({ ...prev, [key]: value }));
    };

    const resetParams = () => {
        setParams({});
        addToast('Parameters reset to defaults.', 'info');
    };

    const saveConfig = () => {
        const configName = `Config ${savedConfigs.length + 1} — ${algo.name}`;
        const currentParams = {};
        algo.hyperparams.forEach(hp => {
            currentParams[hp.key] = getParamValue(hp);
        });
        setSavedConfigs(prev => [...prev, { name: configName, algo: selectedAlgo, params: currentParams }]);
        addToast(`Configuration saved as "${configName}"`, 'success');
    };

    const loadConfig = (config) => {
        setSelectedAlgo(config.algo);
        setParams(config.params);
        addToast(`Loaded configuration: ${config.name}`, 'info');
    };

    const autoTune = () => {
        addToast(`Auto-tuning with ${tuningMethod === 'grid' ? 'GridSearch' : tuningMethod === 'random' ? 'RandomSearch' : 'Optuna'}…`, 'info');
        // Simulate auto-tuning
        setTimeout(() => {
            const autoParams = {};
            algo.hyperparams.forEach(hp => {
                if (hp.type === 'number') {
                    const range = hp.max - hp.min;
                    autoParams[hp.key] = +(hp.min + Math.random() * range).toFixed(hp.step < 1 ? 4 : 0);
                } else if (hp.type === 'select') {
                    const options = hp.options;
                    autoParams[hp.key] = options[Math.floor(Math.random() * options.length)];
                }
            });
            setParams(autoParams);
            addToast('Auto-tuning complete! Optimal parameters found.', 'success');
        }, 1500);
    };

    return (
        <div className="page-container">
            {/* Header */}
            <div className="top-bar">
                <div>
                    <h1 className="page-title">Hyperparameters</h1>
                    <p className="page-subtitle">Fine-tune model parameters for optimal performance</p>
                </div>
                <div className="top-bar-actions">
                    <button className="btn btn-secondary" onClick={resetParams}>
                        <RotateCcw size={14} /> Reset
                    </button>
                    <button className="btn btn-accent" onClick={saveConfig}>
                        <Save size={14} /> Save Config
                    </button>
                </div>
            </div>

            <div className="grid-3" style={{ gridTemplateColumns: '280px 1fr 280px', alignItems: 'start' }}>
                {/* Left: Algorithm Selector */}
                <div className="card" style={{ position: 'sticky', top: 'var(--space-4)' }}>
                    <div className="card-header">
                        <div className="card-title"><Settings2 /> Algorithm</div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                        {ALGORITHMS.map(a => (
                            <button
                                key={a.id}
                                className={`nav-item ${selectedAlgo === a.id ? 'active' : ''}`}
                                onClick={() => { setSelectedAlgo(a.id); setParams({}); }}
                                style={{ textAlign: 'left' }}
                            >
                                <span style={{ fontSize: '1.15rem' }}>{a.icon}</span>
                                <span className="nav-label">{a.name}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Center: Parameter Controls */}
                <div>
                    {/* Auto-tune section */}
                    <div className="card" style={{ marginBottom: 'var(--space-4)' }}>
                        <div className="card-header">
                            <div className="card-title"><Wand2 /> Automatic Tuning</div>
                        </div>
                        <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'center', flexWrap: 'wrap' }}>
                            <div className="tabs">
                                <button className={`tab ${tuningMethod === 'grid' ? 'active' : ''}`} onClick={() => setTuningMethod('grid')}>GridSearch</button>
                                <button className={`tab ${tuningMethod === 'random' ? 'active' : ''}`} onClick={() => setTuningMethod('random')}>RandomSearch</button>
                                <button className={`tab ${tuningMethod === 'optuna' ? 'active' : ''}`} onClick={() => setTuningMethod('optuna')}>Optuna</button>
                            </div>
                            <button className="btn btn-primary" onClick={autoTune}>
                                <Wand2 size={14} /> Run Auto-Tune
                            </button>
                        </div>
                        <p style={{ fontSize: '0.78rem', color: 'var(--gray-500)', marginTop: 'var(--space-3)' }}>
                            {tuningMethod === 'grid' && 'Exhaustive search over specified parameter grid. Best for small parameter spaces.'}
                            {tuningMethod === 'random' && 'Random sampling from parameter distributions. Faster for large spaces.'}
                            {tuningMethod === 'optuna' && 'Bayesian optimization with pruning. State-of-the-art hyperparameter optimization.'}
                        </p>
                    </div>

                    {/* Parameters */}
                    <div className="card">
                        <div className="card-header">
                            <div className="card-title">
                                <SlidersHorizontal /> {algo?.name} Parameters
                            </div>
                            <span className="badge badge-primary">{algo?.hyperparams.length} params</span>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
                            {algo?.hyperparams.map(hp => (
                                <div key={hp.key} className="input-group">
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                        <label className="input-label" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1)' }}>
                                            {hp.label}
                                            <div className="tooltip-wrapper" style={{ cursor: 'help' }}>
                                                <HelpCircle size={13} style={{ color: 'var(--gray-600)' }} />
                                                <div className="tooltip-content">{hp.tooltip}</div>
                                            </div>
                                        </label>
                                        <code style={{
                                            fontFamily: 'var(--font-mono)',
                                            fontSize: '0.7rem',
                                            color: 'var(--primary-400)',
                                            background: 'rgba(99,102,241,0.1)',
                                            padding: '1px 6px',
                                            borderRadius: 'var(--radius-sm)',
                                        }}>
                                            {hp.key}
                                        </code>
                                    </div>

                                    {hp.type === 'number' && (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                                            <input
                                                type="range"
                                                min={hp.min}
                                                max={hp.max}
                                                step={hp.step}
                                                value={getParamValue(hp)}
                                                onChange={(e) => setParamValue(hp.key, parseFloat(e.target.value))}
                                                style={{ flex: 1, accentColor: 'var(--primary-500)' }}
                                            />
                                            <input
                                                type="number"
                                                className="input"
                                                style={{ width: 90, textAlign: 'center', fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}
                                                min={hp.min}
                                                max={hp.max}
                                                step={hp.step}
                                                value={getParamValue(hp)}
                                                onChange={(e) => setParamValue(hp.key, parseFloat(e.target.value))}
                                            />
                                        </div>
                                    )}

                                    {hp.type === 'select' && (
                                        <select
                                            className="select"
                                            value={getParamValue(hp)}
                                            onChange={(e) => setParamValue(hp.key, e.target.value)}
                                        >
                                            {hp.options.map(opt => (
                                                <option key={opt} value={opt}>{opt}</option>
                                            ))}
                                        </select>
                                    )}

                                    {hp.type === 'text' && (
                                        <input
                                            type="text"
                                            className="input"
                                            value={getParamValue(hp)}
                                            onChange={(e) => setParamValue(hp.key, e.target.value)}
                                            style={{ fontFamily: 'var(--font-mono)' }}
                                        />
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right: Saved Configs */}
                <div className="card" style={{ position: 'sticky', top: 'var(--space-4)' }}>
                    <div className="card-header">
                        <div className="card-title"><Save /> Saved Configs</div>
                    </div>
                    {savedConfigs.length === 0 ? (
                        <p style={{ fontSize: '0.85rem', color: 'var(--gray-500)', textAlign: 'center', padding: 'var(--space-4)' }}>
                            No saved configurations yet.
                        </p>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                            {savedConfigs.map((config, idx) => {
                                const configAlgo = ALGORITHMS.find(a => a.id === config.algo);
                                return (
                                    <div
                                        key={idx}
                                        style={{
                                            padding: 'var(--space-3)',
                                            background: 'var(--surface-1)',
                                            borderRadius: 'var(--radius-lg)',
                                            border: '1px solid var(--glass-border)',
                                            cursor: 'pointer',
                                            transition: 'all var(--transition-fast)',
                                        }}
                                        onClick={() => loadConfig(config)}
                                        onMouseEnter={(e) => e.currentTarget.style.borderColor = 'rgba(99,102,241,0.3)'}
                                        onMouseLeave={(e) => e.currentTarget.style.borderColor = ''}
                                    >
                                        <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--gray-200)', marginBottom: 'var(--space-1)' }}>
                                            {config.name}
                                        </div>
                                        <div style={{ fontSize: '0.72rem', color: 'var(--gray-500)' }}>
                                            {configAlgo?.icon} {configAlgo?.name}
                                        </div>
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: 'var(--space-2)' }}>
                                            {Object.entries(config.params).slice(0, 3).map(([k, v]) => (
                                                <span key={k} style={{
                                                    fontSize: '0.65rem',
                                                    background: 'var(--surface-3)',
                                                    padding: '1px 6px',
                                                    borderRadius: 'var(--radius-sm)',
                                                    color: 'var(--gray-400)',
                                                    fontFamily: 'var(--font-mono)',
                                                }}>
                                                    {k}={v}
                                                </span>
                                            ))}
                                            {Object.keys(config.params).length > 3 && (
                                                <span style={{ fontSize: '0.65rem', color: 'var(--gray-500)' }}>
                                                    +{Object.keys(config.params).length - 3} more
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {/* Export / Import */}
                    <div style={{ marginTop: 'var(--space-4)', display: 'flex', gap: 'var(--space-2)' }}>
                        <button className="btn btn-secondary btn-sm" style={{ flex: 1 }}
                            onClick={() => {
                                const json = JSON.stringify(savedConfigs, null, 2);
                                const blob = new Blob([json], { type: 'application/json' });
                                const url = URL.createObjectURL(blob);
                                const a = document.createElement('a');
                                a.href = url;
                                a.download = 'hyperparams_configs.json';
                                a.click();
                                addToast('Configurations exported!', 'success');
                            }}
                        >
                            <Download size={12} /> Export
                        </button>
                        <button className="btn btn-secondary btn-sm" style={{ flex: 1 }}
                            onClick={() => addToast('Import feature: upload a JSON config file.', 'info')}
                        >
                            <Upload size={12} /> Import
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

import { useState } from 'react';
import {
    Brain, Info, CheckSquare, Square, ChevronDown, ChevronUp,
    Play, Layers, Search
} from 'lucide-react';
import { ALGORITHMS } from '../data/mockData';
import { useToast } from '../context/ToastContext';

export default function ModelSelection() {
    const { addToast } = useToast();
    const [selectedModels, setSelectedModels] = useState(['gradient_boosting']);
    const [expandedModel, setExpandedModel] = useState('gradient_boosting');
    const [trainMode, setTrainMode] = useState('scratch'); // 'scratch' | 'pretrained'
    const [searchQuery, setSearchQuery] = useState('');

    const filteredAlgorithms = ALGORITHMS.filter(a =>
        a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.category.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const toggleModel = (id) => {
        setSelectedModels(prev =>
            prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id]
        );
    };

    const handleStartTraining = () => {
        if (selectedModels.length === 0) {
            addToast('Please select at least one model to train.', 'warning');
            return;
        }
        addToast(`Training started for ${selectedModels.length} model(s)!`, 'success');
    };

    return (
        <div className="page-container">
            {/* Header */}
            <div className="top-bar">
                <div>
                    <h1 className="page-title">Model Selection</h1>
                    <p className="page-subtitle">Choose and configure ML algorithms for churn prediction</p>
                </div>
                <div className="top-bar-actions">
                    <button className="btn btn-primary btn-lg" onClick={handleStartTraining}>
                        <Play size={16} /> Train {selectedModels.length > 0 && `(${selectedModels.length})`}
                    </button>
                </div>
            </div>

            {/* Training Mode & Search */}
            <div className="card" style={{ marginBottom: 'var(--space-6)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
                    <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--gray-300)' }}>Training Mode:</span>
                        <div className="tabs" style={{ background: 'var(--surface-1)' }}>
                            <button
                                className={`tab ${trainMode === 'scratch' ? 'active' : ''}`}
                                onClick={() => setTrainMode('scratch')}
                            >
                                From Scratch
                            </button>
                            <button
                                className={`tab ${trainMode === 'pretrained' ? 'active' : ''}`}
                                onClick={() => setTrainMode('pretrained')}
                            >
                                Pre-trained
                            </button>
                        </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', background: 'var(--surface-1)', borderRadius: 'var(--radius-md)', padding: '0 var(--space-3)', border: '1px solid var(--glass-border)' }}>
                        <Search size={16} style={{ color: 'var(--gray-500)' }} />
                        <input
                            className="input"
                            style={{ border: 'none', background: 'transparent', padding: 'var(--space-2) 0' }}
                            placeholder="Search algorithms…"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {/* Selected Models Chips */}
            {selectedModels.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)', marginBottom: 'var(--space-4)' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--gray-500)', lineHeight: '28px' }}>Selected:</span>
                    {selectedModels.map(id => {
                        const algo = ALGORITHMS.find(a => a.id === id);
                        return (
                            <div key={id} className="chip selected" onClick={() => toggleModel(id)}>
                                {algo?.icon} {algo?.name}
                                <span className="chip-remove">×</span>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Algorithm Cards */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                {filteredAlgorithms.map((algo) => {
                    const isSelected = selectedModels.includes(algo.id);
                    const isExpanded = expandedModel === algo.id;

                    return (
                        <div
                            key={algo.id}
                            className="card"
                            style={{
                                borderColor: isSelected ? 'rgba(99, 102, 241, 0.4)' : undefined,
                                boxShadow: isSelected ? 'var(--shadow-glow)' : undefined,
                            }}
                        >
                            {/* Card Top Row */}
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
                                    {/* Select Checkbox */}
                                    <button
                                        className="btn btn-ghost btn-icon"
                                        onClick={() => toggleModel(algo.id)}
                                        style={{ color: isSelected ? 'var(--primary-400)' : 'var(--gray-500)' }}
                                    >
                                        {isSelected ? <CheckSquare size={22} /> : <Square size={22} />}
                                    </button>

                                    {/* Icon & Name */}
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                                        <div style={{
                                            fontSize: '1.5rem',
                                            width: 44,
                                            height: 44,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            background: 'var(--surface-1)',
                                            borderRadius: 'var(--radius-lg)',
                                        }}>
                                            {algo.icon}
                                        </div>
                                        <div>
                                            <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--gray-100)' }}>{algo.name}</div>
                                            <span className="badge badge-primary" style={{ marginTop: 2 }}>{algo.category}</span>
                                        </div>
                                    </div>
                                </div>

                                <button
                                    className="btn btn-ghost"
                                    onClick={() => setExpandedModel(isExpanded ? null : algo.id)}
                                >
                                    {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                                    <span style={{ fontSize: '0.8rem' }}>Details</span>
                                </button>
                            </div>

                            {/* Expanded Details */}
                            {isExpanded && (
                                <div style={{ marginTop: 'var(--space-5)', paddingTop: 'var(--space-5)', borderTop: '1px solid var(--glass-border)' }}>
                                    {/* Description */}
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'flex-start',
                                        gap: 'var(--space-3)',
                                        padding: 'var(--space-4)',
                                        background: 'rgba(99, 102, 241, 0.05)',
                                        borderRadius: 'var(--radius-lg)',
                                        marginBottom: 'var(--space-4)',
                                        border: '1px solid rgba(99, 102, 241, 0.1)',
                                    }}>
                                        <Info size={18} style={{ color: 'var(--primary-400)', flexShrink: 0, marginTop: 2 }} />
                                        <p style={{ fontSize: '0.85rem', color: 'var(--gray-300)', lineHeight: 1.6 }}>
                                            {algo.description}
                                        </p>
                                    </div>

                                    {/* Pros & Cons */}
                                    <div className="grid-2" style={{ marginBottom: 'var(--space-4)' }}>
                                        <div>
                                            <h4 style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--success-400)', marginBottom: 'var(--space-2)', display: 'flex', alignItems: 'center', gap: 'var(--space-1)' }}>
                                                ✓ Advantages
                                            </h4>
                                            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
                                                {algo.pros.map((pro, i) => (
                                                    <li key={i} style={{ fontSize: '0.8rem', color: 'var(--gray-400)', display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                                                        <span style={{ color: 'var(--success-500)', fontSize: '0.6rem' }}>●</span> {pro}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                        <div>
                                            <h4 style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--warning-400)', marginBottom: 'var(--space-2)', display: 'flex', alignItems: 'center', gap: 'var(--space-1)' }}>
                                                ✗ Limitations
                                            </h4>
                                            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
                                                {algo.cons.map((con, i) => (
                                                    <li key={i} style={{ fontSize: '0.8rem', color: 'var(--gray-400)', display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                                                        <span style={{ color: 'var(--warning-500)', fontSize: '0.6rem' }}>●</span> {con}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>

                                    {/* Hyperparameters Preview */}
                                    <div style={{ marginTop: 'var(--space-2)' }}>
                                        <h4 style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--gray-400)', marginBottom: 'var(--space-2)' }}>
                                            <Layers size={14} style={{ verticalAlign: 'middle', marginRight: 4 }} />
                                            Key Hyperparameters ({algo.hyperparams.length})
                                        </h4>
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
                                            {algo.hyperparams.map(hp => (
                                                <div key={hp.key} className="chip">
                                                    <code style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem' }}>{hp.key}</code>
                                                    <span style={{ color: 'var(--gray-500)' }}>= {hp.default}</span>
                                                </div>
                                            ))}
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

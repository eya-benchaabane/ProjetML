import { useState } from 'react';
import {
    Brain, BarChart3, Database, GitBranch, TrendingUp,
    Clock, Activity, Users, Zap, ArrowUpRight
} from 'lucide-react';
import {
    AreaChart, Area, BarChart, Bar, XAxis, YAxis,
    CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';
import { MOCK_RESULTS, EXPERIMENT_HISTORY, MODEL_VERSIONS } from '../data/mockData';

const accuracyData = [
    { name: 'LR', accuracy: 79.65, f1: 59.63, auc: 84.12 },
    { name: 'RF', accuracy: 82.34, f1: 64.06, auc: 87.01 },
    { name: 'SVM', accuracy: 80.89, f1: 61.34, auc: 85.23 },
    { name: 'KNN', accuracy: 78.12, f1: 56.34, auc: 81.87 },
    { name: 'GB', accuracy: 83.56, f1: 66.73, auc: 88.92 },
    { name: 'MLP', accuracy: 81.78, f1: 62.86, auc: 86.34 },
];

const trainingTrend = [
    { day: 'Mon', experiments: 3, avgAccuracy: 78.5 },
    { day: 'Tue', experiments: 5, avgAccuracy: 80.2 },
    { day: 'Wed', experiments: 4, avgAccuracy: 81.1 },
    { day: 'Thu', experiments: 7, avgAccuracy: 82.8 },
    { day: 'Fri', experiments: 6, avgAccuracy: 83.5 },
    { day: 'Sat', experiments: 2, avgAccuracy: 82.1 },
    { day: 'Sun', experiments: 1, avgAccuracy: 83.6 },
];

const churnDistribution = [
    { name: 'No Churn', value: 73.5, color: '#6366f1' },
    { name: 'Churn', value: 26.5, color: '#f43f5e' },
];

export default function Dashboard() {
    const bestModel = MODEL_VERSIONS.find(m => m.status === 'production');
    const recentExperiments = EXPERIMENT_HISTORY.slice(0, 4);

    return (
        <div className="page-container">
            {/* Header */}
            <div className="top-bar">
                <div>
                    <h1 className="page-title">Dashboard</h1>
                    <p className="page-subtitle">Telco Customer Churn Prediction — Overview</p>
                </div>
                <div className="top-bar-actions">
                    <span className="badge badge-success" style={{ fontSize: '0.75rem', padding: '4px 12px' }}>
                        <Activity size={12} /> System Healthy
                    </span>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="stats-grid">
                <div className="stat-card primary">
                    <div className="stat-icon"><Brain size={20} /></div>
                    <div className="stat-value">6</div>
                    <div className="stat-label">Models Trained</div>
                </div>
                <div className="stat-card accent">
                    <div className="stat-icon"><BarChart3 size={20} /></div>
                    <div className="stat-value">83.56%</div>
                    <div className="stat-label">Best Accuracy</div>
                </div>
                <div className="stat-card success">
                    <div className="stat-icon"><Database size={20} /></div>
                    <div className="stat-value">7,043</div>
                    <div className="stat-label">Dataset Records</div>
                </div>
                <div className="stat-card warning">
                    <div className="stat-icon"><GitBranch size={20} /></div>
                    <div className="stat-value">7</div>
                    <div className="stat-label">Total Experiments</div>
                </div>
            </div>

            {/* Charts Row */}
            <div className="grid-2" style={{ marginBottom: 'var(--space-6)' }}>
                {/* Model Performance Comparison */}
                <div className="card">
                    <div className="card-header">
                        <div className="card-title"><BarChart3 /> Model Performance Comparison</div>
                    </div>
                    <ResponsiveContainer width="100%" height={280}>
                        <BarChart data={accuracyData} barGap={4}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(99,102,241,0.1)" />
                            <XAxis dataKey="name" stroke="var(--gray-500)" fontSize={12} />
                            <YAxis stroke="var(--gray-500)" fontSize={12} domain={[50, 100]} />
                            <Tooltip
                                contentStyle={{
                                    background: 'var(--surface-3)',
                                    border: '1px solid var(--glass-border)',
                                    borderRadius: '8px',
                                    color: 'var(--gray-200)',
                                    fontSize: '0.8rem',
                                }}
                            />
                            <Bar dataKey="accuracy" name="Accuracy %" fill="#6366f1" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="f1" name="F1 Score %" fill="#06b6d4" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="auc" name="AUC-ROC %" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Training Trend */}
                <div className="card">
                    <div className="card-header">
                        <div className="card-title"><TrendingUp /> Weekly Training Activity</div>
                    </div>
                    <ResponsiveContainer width="100%" height={280}>
                        <AreaChart data={trainingTrend}>
                            <defs>
                                <linearGradient id="gradExperiments" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#6366f1" stopOpacity={0.3} />
                                    <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(99,102,241,0.1)" />
                            <XAxis dataKey="day" stroke="var(--gray-500)" fontSize={12} />
                            <YAxis stroke="var(--gray-500)" fontSize={12} />
                            <Tooltip
                                contentStyle={{
                                    background: 'var(--surface-3)',
                                    border: '1px solid var(--glass-border)',
                                    borderRadius: '8px',
                                    color: 'var(--gray-200)',
                                    fontSize: '0.8rem',
                                }}
                            />
                            <Area
                                type="monotone"
                                dataKey="experiments"
                                name="Experiments"
                                stroke="#6366f1"
                                fill="url(#gradExperiments)"
                                strokeWidth={2}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Bottom Row */}
            <div className="grid-3" style={{ gridTemplateColumns: '1fr 1fr 1.2fr' }}>
                {/* Churn Distribution */}
                <div className="card">
                    <div className="card-header">
                        <div className="card-title"><Users /> Churn Distribution</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <ResponsiveContainer width="100%" height={200}>
                            <PieChart>
                                <Pie
                                    data={churnDistribution}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={55}
                                    outerRadius={80}
                                    paddingAngle={3}
                                    dataKey="value"
                                >
                                    {churnDistribution.map((entry, index) => (
                                        <Cell key={index} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{
                                        background: 'var(--surface-3)',
                                        border: '1px solid var(--glass-border)',
                                        borderRadius: '8px',
                                        color: 'var(--gray-200)',
                                        fontSize: '0.8rem',
                                    }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: 'var(--space-6)', marginTop: 'var(--space-2)' }}>
                        {churnDistribution.map(d => (
                            <div key={d.name} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', fontSize: '0.8rem' }}>
                                <span style={{ width: 10, height: 10, borderRadius: '50%', background: d.color, display: 'inline-block' }} />
                                <span style={{ color: 'var(--gray-400)' }}>{d.name}: <strong style={{ color: 'var(--gray-200)' }}>{d.value}%</strong></span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Best Model */}
                <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div className="card-header">
                        <div className="card-title"><Zap /> Production Model</div>
                        <span className="badge badge-success">Live</span>
                    </div>
                    <div style={{ textAlign: 'center', padding: 'var(--space-4) 0' }}>
                        <div style={{ fontSize: '2.5rem', marginBottom: 'var(--space-2)' }}>🚀</div>
                        <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--gray-100)', marginBottom: 'var(--space-1)' }}>
                            {bestModel?.model}
                        </div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--gray-400)', marginBottom: 'var(--space-4)' }}>
                            Version {bestModel?.id} · {bestModel?.date}
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'center', gap: 'var(--space-4)' }}>
                            <div>
                                <div style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--success-400)' }}>
                                    {(bestModel?.accuracy * 100).toFixed(1)}%
                                </div>
                                <div style={{ fontSize: '0.7rem', color: 'var(--gray-500)' }}>Accuracy</div>
                            </div>
                            <div>
                                <div style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--primary-400)' }}>
                                    88.9%
                                </div>
                                <div style={{ fontSize: '0.7rem', color: 'var(--gray-500)' }}>AUC-ROC</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Recent Experiments */}
                <div className="card">
                    <div className="card-header">
                        <div className="card-title"><Clock /> Recent Experiments</div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                        {recentExperiments.map((exp) => (
                            <div
                                key={exp.id}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    padding: 'var(--space-3)',
                                    background: 'var(--surface-1)',
                                    borderRadius: 'var(--radius-lg)',
                                    border: '1px solid var(--glass-border)',
                                }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                                    <div style={{
                                        width: 32, height: 32,
                                        borderRadius: 'var(--radius-md)',
                                        background: exp.status === 'success' ? 'rgba(34,197,94,0.15)' : 'rgba(245,158,11,0.15)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontSize: '0.85rem'
                                    }}>
                                        {exp.status === 'success' ? '✓' : '⚠'}
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--gray-200)' }}>{exp.modelName}</div>
                                        <div style={{ fontSize: '0.7rem', color: 'var(--gray-500)' }}>{exp.version}</div>
                                    </div>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--primary-300)' }}>
                                        {(exp.accuracy * 100).toFixed(1)}%
                                    </div>
                                    <div style={{ fontSize: '0.65rem', color: 'var(--gray-500)' }}>
                                        {new Date(exp.timestamp).toLocaleDateString()}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

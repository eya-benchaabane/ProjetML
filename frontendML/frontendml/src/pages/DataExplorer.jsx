import { useState, useMemo } from 'react';
import {
    Database, Filter, Columns, Search, Download, Trash2,
    Eye, EyeOff, ArrowUpDown, ChevronLeft, ChevronRight
} from 'lucide-react';
import { DATASET_COLUMNS, generateSampleData } from '../data/mockData';
import { useToast } from '../context/ToastContext';

export default function DataExplorer() {
    const { addToast } = useToast();
    const [data, setData] = useState(() => generateSampleData(100));
    const [visibleColumns, setVisibleColumns] = useState(
        ['customerID', 'gender', 'SeniorCitizen', 'tenure', 'Contract', 'MonthlyCharges', 'TotalCharges', 'Churn']
    );
    const [sortCol, setSortCol] = useState(null);
    const [sortDir, setSortDir] = useState('asc');
    const [filterChurn, setFilterChurn] = useState('all');
    const [searchText, setSearchText] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [showColumnPicker, setShowColumnPicker] = useState(false);
    const [removeMissing, setRemoveMissing] = useState(false);
    const pageSize = 15;

    const allColumns = DATASET_COLUMNS.map(c => c.name);

    const filteredData = useMemo(() => {
        let result = [...data];

        // Search
        if (searchText) {
            result = result.filter(row =>
                Object.values(row).some(v =>
                    String(v).toLowerCase().includes(searchText.toLowerCase())
                )
            );
        }

        // Churn filter
        if (filterChurn !== 'all') {
            result = result.filter(row => row.Churn === filterChurn);
        }

        // Sort
        if (sortCol) {
            result.sort((a, b) => {
                const va = a[sortCol];
                const vb = b[sortCol];
                if (typeof va === 'number') return sortDir === 'asc' ? va - vb : vb - va;
                return sortDir === 'asc' ? String(va).localeCompare(String(vb)) : String(vb).localeCompare(String(va));
            });
        }

        return result;
    }, [data, searchText, filterChurn, sortCol, sortDir]);

    const totalPages = Math.ceil(filteredData.length / pageSize);
    const pagedData = filteredData.slice((currentPage - 1) * pageSize, currentPage * pageSize);

    const handleSort = (col) => {
        if (sortCol === col) {
            setSortDir(d => d === 'asc' ? 'desc' : 'asc');
        } else {
            setSortCol(col);
            setSortDir('asc');
        }
    };

    const toggleColumn = (col) => {
        setVisibleColumns(prev =>
            prev.includes(col) ? prev.filter(c => c !== col) : [...prev, col]
        );
    };

    const handleCleanData = () => {
        setData(prev => prev.filter(row => !Object.values(row).some(v => v === null || v === undefined || v === '')));
        setRemoveMissing(true);
        addToast('Missing values removed from dataset.', 'success');
    };

    const exportCsv = () => {
        const headers = visibleColumns.join(',');
        const rows = filteredData.map(row => visibleColumns.map(c => JSON.stringify(row[c] ?? '')).join(','));
        const csv = [headers, ...rows].join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'telco_churn_data.csv';
        a.click();
        addToast('Dataset exported as CSV.', 'success');
    };

    // Stats
    const churnCount = data.filter(r => r.Churn === 'Yes').length;
    const avgTenure = (data.reduce((s, r) => s + r.tenure, 0) / data.length).toFixed(1);
    const avgMonthly = (data.reduce((s, r) => s + r.MonthlyCharges, 0) / data.length).toFixed(2);

    return (
        <div className="page-container">
            {/* Header */}
            <div className="top-bar">
                <div>
                    <h1 className="page-title">Dataset Explorer</h1>
                    <p className="page-subtitle">Preview, filter, and clean the Telco Customer Churn dataset</p>
                </div>
                <div className="top-bar-actions">
                    <button className="btn btn-secondary" onClick={handleCleanData}>
                        <Trash2 size={14} /> Clean Missing
                    </button>
                    <button className="btn btn-accent" onClick={exportCsv}>
                        <Download size={14} /> Export CSV
                    </button>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="stats-grid" style={{ marginBottom: 'var(--space-6)' }}>
                <div className="stat-card primary">
                    <div className="stat-value">{data.length}</div>
                    <div className="stat-label">Total Records</div>
                </div>
                <div className="stat-card accent">
                    <div className="stat-value">{allColumns.length}</div>
                    <div className="stat-label">Features</div>
                </div>
                <div className="stat-card warning">
                    <div className="stat-value">{churnCount} ({((churnCount / data.length) * 100).toFixed(1)}%)</div>
                    <div className="stat-label">Churned Customers</div>
                </div>
                <div className="stat-card success">
                    <div className="stat-value">{avgTenure} mo</div>
                    <div className="stat-label">Avg. Tenure</div>
                </div>
            </div>

            {/* Filters & Controls */}
            <div className="card" style={{ marginBottom: 'var(--space-4)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 'var(--space-3)' }}>
                    {/* Search */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', background: 'var(--surface-1)', borderRadius: 'var(--radius-md)', padding: '0 var(--space-3)', border: '1px solid var(--glass-border)', minWidth: 250 }}>
                        <Search size={16} style={{ color: 'var(--gray-500)' }} />
                        <input
                            className="input"
                            style={{ border: 'none', background: 'transparent' }}
                            placeholder="Search data…"
                            value={searchText}
                            onChange={(e) => { setSearchText(e.target.value); setCurrentPage(1); }}
                        />
                    </div>

                    <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'center' }}>
                        {/* Churn Filter */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                            <Filter size={14} style={{ color: 'var(--gray-500)' }} />
                            <select className="select" value={filterChurn} onChange={(e) => { setFilterChurn(e.target.value); setCurrentPage(1); }}>
                                <option value="all">All Customers</option>
                                <option value="Yes">Churned Only</option>
                                <option value="No">Active Only</option>
                            </select>
                        </div>

                        {/* Column Picker */}
                        <div style={{ position: 'relative' }}>
                            <button className="btn btn-secondary" onClick={() => setShowColumnPicker(!showColumnPicker)}>
                                <Columns size={14} /> Columns ({visibleColumns.length})
                            </button>
                            {showColumnPicker && (
                                <div style={{
                                    position: 'absolute',
                                    top: '100%',
                                    right: 0,
                                    marginTop: 'var(--space-2)',
                                    background: 'var(--surface-3)',
                                    border: '1px solid var(--glass-border)',
                                    borderRadius: 'var(--radius-lg)',
                                    padding: 'var(--space-3)',
                                    zIndex: 50,
                                    width: 220,
                                    maxHeight: 320,
                                    overflowY: 'auto',
                                    boxShadow: 'var(--shadow-xl)',
                                }}>
                                    {allColumns.map(col => (
                                        <label
                                            key={col}
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: 'var(--space-2)',
                                                padding: '4px var(--space-2)',
                                                fontSize: '0.8rem',
                                                color: 'var(--gray-300)',
                                                cursor: 'pointer',
                                                borderRadius: 'var(--radius-sm)',
                                            }}
                                            onMouseEnter={(e) => e.currentTarget.style.background = 'var(--glass-highlight)'}
                                            onMouseLeave={(e) => e.currentTarget.style.background = ''}
                                        >
                                            {visibleColumns.includes(col)
                                                ? <Eye size={14} style={{ color: 'var(--primary-400)' }} />
                                                : <EyeOff size={14} style={{ color: 'var(--gray-600)' }} />
                                            }
                                            <input
                                                type="checkbox"
                                                checked={visibleColumns.includes(col)}
                                                onChange={() => toggleColumn(col)}
                                                style={{ display: 'none' }}
                                            />
                                            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem' }}>{col}</span>
                                        </label>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                {/* Results count */}
                <div style={{ marginTop: 'var(--space-3)', fontSize: '0.8rem', color: 'var(--gray-500)' }}>
                    Showing {pagedData.length} of {filteredData.length} records (filtered from {data.length} total)
                </div>
            </div>

            {/* Data Table */}
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <div className="data-table-wrapper">
                    <table className="data-table">
                        <thead>
                            <tr>
                                {visibleColumns.map(col => (
                                    <th
                                        key={col}
                                        onClick={() => handleSort(col)}
                                        style={{ cursor: 'pointer', userSelect: 'none' }}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1)' }}>
                                            {col}
                                            <ArrowUpDown size={12} style={{ opacity: sortCol === col ? 1 : 0.3 }} />
                                        </div>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {pagedData.map((row, idx) => (
                                <tr key={idx}>
                                    {visibleColumns.map(col => (
                                        <td key={col}>
                                            {col === 'Churn' ? (
                                                <span className={`badge ${row[col] === 'Yes' ? 'badge-danger' : 'badge-success'}`}>
                                                    {row[col]}
                                                </span>
                                            ) : col === 'MonthlyCharges' || col === 'TotalCharges' ? (
                                                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.82rem' }}>
                                                    ${typeof row[col] === 'number' ? row[col].toFixed(2) : row[col]}
                                                </span>
                                            ) : col === 'tenure' ? (
                                                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.82rem' }}>{row[col]} mo</span>
                                            ) : col === 'SeniorCitizen' ? (
                                                <span className={`badge ${row[col] === 1 ? 'badge-warning' : 'badge-primary'}`}>
                                                    {row[col] === 1 ? 'Yes' : 'No'}
                                                </span>
                                            ) : (
                                                String(row[col] ?? '')
                                            )}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: 'var(--space-3) var(--space-4)',
                    borderTop: '1px solid var(--glass-border)',
                    background: 'var(--surface-2)',
                }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--gray-500)' }}>
                        Page {currentPage} of {totalPages}
                    </span>
                    <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                        <button
                            className="btn btn-secondary btn-sm"
                            disabled={currentPage <= 1}
                            onClick={() => setCurrentPage(p => p - 1)}
                        >
                            <ChevronLeft size={14} /> Prev
                        </button>
                        <button
                            className="btn btn-secondary btn-sm"
                            disabled={currentPage >= totalPages}
                            onClick={() => setCurrentPage(p => p + 1)}
                        >
                            Next <ChevronRight size={14} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Column Metadata */}
            <div className="card" style={{ marginTop: 'var(--space-6)' }}>
                <div className="card-header">
                    <div className="card-title"><Database /> Column Metadata</div>
                </div>
                <div className="data-table-wrapper">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Column</th>
                                <th>Type</th>
                                <th>Description</th>
                                <th>Values / Range</th>
                            </tr>
                        </thead>
                        <tbody>
                            {DATASET_COLUMNS.map(col => (
                                <tr key={col.name}>
                                    <td>
                                        <code style={{ fontFamily: 'var(--font-mono)', fontSize: '0.82rem', color: 'var(--primary-300)' }}>
                                            {col.name}
                                        </code>
                                    </td>
                                    <td>
                                        <span className={`badge ${col.type === 'target' ? 'badge-danger' :
                                                col.type === 'numeric' ? 'badge-accent' :
                                                    col.type === 'categorical' ? 'badge-primary' :
                                                        'badge-warning'
                                            }`}>
                                            {col.type}
                                        </span>
                                    </td>
                                    <td style={{ fontSize: '0.82rem' }}>{col.description}</td>
                                    <td style={{ fontSize: '0.78rem', fontFamily: 'var(--font-mono)' }}>
                                        {col.values ? col.values.join(', ') :
                                            col.min !== undefined ? `${col.min} — ${col.max}` : '—'}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

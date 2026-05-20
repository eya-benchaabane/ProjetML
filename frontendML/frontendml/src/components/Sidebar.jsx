import { NavLink } from 'react-router-dom';
import {
    LayoutDashboard, Brain, SlidersHorizontal, BarChart3,
    Database, GitBranch, History, Upload, ChevronLeft, ChevronRight,
    Sparkles
} from 'lucide-react';

const navSections = [
    {
        title: 'Overview',
        items: [
            { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
        ]
    },
    {
        title: 'Modeling',
        items: [
            { to: '/models', icon: Brain, label: 'Model Selection' },
            { to: '/hyperparams', icon: SlidersHorizontal, label: 'Hyperparameters' },
            { to: '/results', icon: BarChart3, label: 'Results & Viz' },
        ]
    },
    {
        title: 'Data',
        items: [
            { to: '/data', icon: Database, label: 'Dataset Explorer' },
            { to: '/upload', icon: Upload, label: 'Upload Data' },
        ]
    },
    {
        title: 'MLOps',
        items: [
            { to: '/mlops', icon: GitBranch, label: 'Model Registry' },
            { to: '/experiments', icon: History, label: 'Experiments' },
        ]
    },
];

export default function Sidebar({ collapsed, onToggle }) {
    return (
        <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
            {/* Logo */}
            <div className="sidebar-logo">
                <div className="logo-icon">
                    <Sparkles />
                </div>
                <span className="logo-text">ChurnGuard AI</span>
            </div>

            {/* Navigation */}
            <nav className="sidebar-nav">
                {navSections.map((section) => (
                    <div key={section.title}>
                        <div className="nav-section-title">{section.title}</div>
                        {section.items.map((item) => (
                            <NavLink
                                key={item.to}
                                to={item.to}
                                end={item.to === '/'}
                                className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                            >
                                <item.icon className="nav-icon" size={20} />
                                <span className="nav-label">{item.label}</span>
                            </NavLink>
                        ))}
                    </div>
                ))}
            </nav>

            {/* Footer Toggle */}
            <div className="sidebar-footer">
                <button className="sidebar-toggle" onClick={onToggle}>
                    {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
                    {!collapsed && <span>Collapse</span>}
                </button>
            </div>
        </aside>
    );
}

import { X, CheckCircle, AlertTriangle, AlertCircle, Info } from 'lucide-react';
import { useToast } from '../context/ToastContext';

const icons = {
    success: <CheckCircle size={18} />,
    warning: <AlertTriangle size={18} />,
    error: <AlertCircle size={18} />,
    info: <Info size={18} />,
};

const colors = {
    success: 'var(--success-400)',
    warning: 'var(--warning-400)',
    error: 'var(--danger-400)',
    info: 'var(--primary-400)',
};

export default function ToastContainer() {
    const { toasts, removeToast } = useToast();

    return (
        <div className="toast-container">
            {toasts.map((toast) => (
                <div key={toast.id} className={`toast ${toast.type}`}>
                    <span style={{ color: colors[toast.type] }}>{icons[toast.type]}</span>
                    <div style={{ flex: 1 }}>
                        <p style={{ fontSize: '0.85rem', color: 'var(--gray-200)' }}>{toast.message}</p>
                    </div>
                    <button
                        onClick={() => removeToast(toast.id)}
                        style={{ background: 'none', border: 'none', color: 'var(--gray-500)', cursor: 'pointer', padding: '2px' }}
                    >
                        <X size={14} />
                    </button>
                </div>
            ))}
        </div>
    );
}

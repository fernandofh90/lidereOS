import React from 'react';

// --- Base UI ---

export const Card = ({ children, className = '', onClick, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div onClick={onClick} className={`bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden ${onClick ? 'cursor-pointer hover:border-slate-300 transition-colors' : ''} ${className}`} {...props}>
    {children}
  </div>
);

export const Button = ({ children, variant = 'primary', className = '', onClick, type = 'button', disabled = false }: { 
    children?: React.ReactNode, 
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger', 
    className?: string, 
    onClick?: () => void,
    type?: 'button' | 'submit' | 'reset',
    disabled?: boolean
}) => {
  const baseStyles = "px-4 py-2 rounded-lg font-medium text-sm transition-colors flex items-center justify-center gap-2";
  const variants = {
    primary: "bg-slate-900 text-white hover:bg-slate-800 disabled:bg-slate-400",
    secondary: "bg-slate-100 text-slate-900 hover:bg-slate-200",
    outline: "border border-slate-300 text-slate-700 hover:bg-slate-50",
    ghost: "text-slate-600 hover:bg-slate-100",
    danger: "bg-rose-100 text-rose-700 hover:bg-rose-200"
  };
  return (
    <button type={type} disabled={disabled} className={`${baseStyles} ${variants[variant]} ${className}`} onClick={onClick}>
      {children}
    </button>
  );
};

export const StatusBadge = ({ status, text }: { status: 'OK' | 'ATENÇÃO' | 'CRÍTICO' | 'ALTO' | 'MÉDIO' | 'BAIXO' | 'pending' | 'in_progress' | 'done', text?: string }) => {
  let colors = "bg-slate-100 text-slate-700";
  
  if (status === 'OK' || status === 'ALTO' || status === 'done') colors = "bg-emerald-100 text-emerald-800";
  if (status === 'ATENÇÃO' || status === 'MÉDIO' || status === 'in_progress') colors = "bg-amber-100 text-amber-800";
  if (status === 'CRÍTICO' || status === 'BAIXO') colors = "bg-rose-100 text-rose-800";
  
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors}`}>
      {text || status}
    </span>
  );
};

export const Input = ({ label, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) => (
    <div className="mb-4">
        <label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>
        <input className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none transition-all text-slate-900" {...props} />
    </div>
);

export const Select = ({ label, options, ...props }: React.SelectHTMLAttributes<HTMLSelectElement> & { label: string, options: {value: string, label: string}[] }) => (
    <div className="mb-4">
        <label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>
        <select className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none transition-all bg-white text-slate-900" {...props}>
            <option value="" disabled>Selecione...</option>
            {options.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
        </select>
    </div>
);

export const TextArea = ({ label, ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { label: string }) => (
    <div className="mb-4">
        <label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>
        <textarea className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none transition-all min-h-[100px] text-slate-900" {...props} />
    </div>
);
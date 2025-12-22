import React from 'react';

// --- Card ---
export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode;
    className?: string;
}

export const Card = ({ children, className = '', ...props }: CardProps) => (
    <div className={`bg-white rounded-xl border border-slate-200 shadow-sm ${className}`} {...props}>
        {children}
    </div>
);

// --- Button ---
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
    className?: string;
    children?: React.ReactNode;
    type?: "button" | "submit" | "reset";
    disabled?: boolean;
    onClick?: React.MouseEventHandler<HTMLButtonElement>;
}

export const Button = ({ children, variant = 'primary', size = 'md', className = '', ...props }: ButtonProps) => {
    const baseStyle = "inline-flex items-center justify-center font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:pointer-events-none rounded-lg";

    const variants = {
        primary: "bg-primary-600 hover:bg-primary-700 text-white shadow-md shadow-primary-200 focus:ring-primary-500",
        secondary: "bg-slate-900 hover:bg-slate-800 text-white focus:ring-slate-900",
        outline: "border border-slate-200 hover:bg-slate-50 text-slate-700 focus:ring-slate-200",
        danger: "bg-red-500 hover:bg-red-600 text-white focus:ring-red-500",
        ghost: "hover:bg-primary-50 text-slate-600 hover:text-primary-700"
    };

    const sizes = {
        sm: "h-8 px-3 text-xs",
        md: "h-10 px-4 py-2 text-sm",
        lg: "h-12 px-6 text-base"
    };

    return (
        <button className={`${baseStyle} ${variants[variant]} ${sizes[size]} ${className}`} {...props}>
            {children}
        </button>
    );
};

// --- Input ---
export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    icon?: React.ReactNode;
    className?: string;
    name?: string;
    type?: string;
    placeholder?: string;
    value?: string | number | readonly string[];
    onChange?: React.ChangeEventHandler<HTMLInputElement>;
    required?: boolean;
    disabled?: boolean;
    min?: string | number;
    max?: string | number;
    step?: string | number;
    maxLength?: number;
}

export const Input = ({ label, error, icon, className = '', ...props }: InputProps) => (
    <div className="w-full">
        {label && <label className="block text-sm font-medium text-slate-700 mb-1.5">{label}</label>}
        <div className="relative">
            {icon && <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">{icon}</div>}
            <input
                className={`w-full ${icon ? 'pl-10' : 'px-3'} py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 disabled:bg-slate-50 disabled:text-slate-500 ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''} ${className}`}
                {...props}
            />
        </div>
        {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
);

// --- Textarea ---
export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    label?: string;
    error?: string;
    className?: string;
    name?: string;
    placeholder?: string;
    value?: string | number | readonly string[];
    onChange?: React.ChangeEventHandler<HTMLTextAreaElement>;
    required?: boolean;
    disabled?: boolean;
    maxLength?: number;
    rows?: number;
}

export const Textarea = ({ label, error, className = '', ...props }: TextareaProps) => (
    <div className="w-full">
        {label && <label className="block text-sm font-medium text-slate-700 mb-1.5">{label}</label>}
        <textarea
            className={`w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 disabled:bg-slate-50 disabled:text-slate-500 min-h-[80px] ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''} ${className}`}
            {...props}
        />
        {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
);

// --- Select ---
export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
    label?: string;
    options: { label: string; value: string }[];
    error?: string;
    className?: string;
    name?: string;
    value?: string | number | readonly string[];
    onChange?: React.ChangeEventHandler<HTMLSelectElement>;
    required?: boolean;
    disabled?: boolean;
}

export const Select = ({ label, options, error, className = '', ...props }: SelectProps) => (
    <div className="w-full">
        {label && <label className="block text-sm font-medium text-slate-700 mb-1.5">{label}</label>}
        <div className="relative">
            <select
                className={`w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 disabled:bg-slate-50 disabled:text-slate-500 appearance-none ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''} ${className}`}
                {...props}
            >
                {options.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
            </select>
            {/* Custom arrow icon */}
            <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
            </div>
        </div>
        {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
);

// --- Badge ---
export const Badge = ({ children, color = 'slate', className = '' }: { children: React.ReactNode, color?: 'slate' | 'green' | 'blue' | 'yellow' | 'red' | 'primary', className?: string }) => {
    const colors = {
        slate: "bg-slate-100 text-slate-700",
        green: "bg-emerald-100 text-emerald-700",
        blue: "bg-blue-100 text-blue-700",
        yellow: "bg-amber-100 text-amber-700",
        red: "bg-red-100 text-red-700",
        primary: "bg-primary-50 text-primary-700 border border-primary-100",
    };
    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[color]} ${className}`}>
            {children}
        </span>
    );
};

// --- StatCard ---
export const StatCard = ({ title, value, icon, trend, color = 'primary' }: { title: string, value: string, icon: React.ReactNode, trend?: string, color?: 'primary' | 'green' | 'red' | 'yellow' | 'blue' | 'slate' }) => {
    const colors = {
        primary: "bg-primary-50 text-primary-600",
        green: "bg-green-100 text-green-600",
        red: "bg-red-100 text-red-600",
        yellow: "bg-yellow-100 text-yellow-600",
        blue: "bg-blue-100 text-blue-600",
        slate: "bg-slate-100 text-slate-600"
    };

    return (
        <Card className="p-6">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-slate-500">{title}</p>
                    <h3 className="text-2xl font-bold text-slate-900 mt-1">{value}</h3>
                    {trend && <p className="text-xs text-emerald-600 mt-1 font-medium">{trend}</p>}
                </div>
                <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${colors[color]}`}>
                    {icon}
                </div>
            </div>
        </Card>
    );
};

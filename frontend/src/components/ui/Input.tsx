import React from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
}

export const Input: React.FC<InputProps> = ({ label, error, className = "", ...props }) => {
    return (
        <div className={`flex flex-col gap-1.5 ${className}`}>
            {label && <label className="text-xs font-bold uppercase tracking-widest ml-1" style={{ color: 'rgba(75,61,28,0.7)', fontFamily: "'Berlin Sans', sans-serif" }}>{label}</label>}
            <input
                className={`px-4 py-3 rounded-sm transition-all duration-200 outline-none`}
                style={{
                    backgroundColor: '#e6e3d7', /* brand-bone */
                    border: `1px solid ${error ? '#cc4444' : 'rgba(82,120,88,0.3)'}`,
                    color: '#4b3d1c', /* brand-olive */
                    fontFamily: "'MegantZ', serif",
                    boxShadow: 'inset 0 2px 4px rgba(75,61,28,0.02)'
                }}
                {...props}
            />
            {error && <p className="text-xs font-medium ml-1 mt-0.5" style={{ color: '#cc4444' }}>{error}</p>}
        </div>
    );
};

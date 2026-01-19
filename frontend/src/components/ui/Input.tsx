import React from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
}

export const Input: React.FC<InputProps> = ({ label, error, className = "", ...props }) => {
    return (
        <div className={`flex flex-col gap-1.5 ${className}`}>
            {label && <label className="text-sm font-medium text-foreground/80 ml-1">{label}</label>}
            <input
                className={`px-4 py-3 rounded-2xl bg-background/50 border transition-all duration-300 outline-none focus:ring-2 focus:ring-primary/20 ${error ? "border-red-500" : "border-foreground/10 focus:border-primary"
                    }`}
                {...props}
            />
            {error && <p className="text-xs text-red-500 ml-1 mt-0.5">{error}</p>}
        </div>
    );
};

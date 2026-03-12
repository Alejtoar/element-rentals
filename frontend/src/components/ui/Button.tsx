import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "primary" | "secondary" | "outline" | "glass" | "sand";
    size?: "sm" | "md" | "lg";
    isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
    children,
    variant = "primary",
    size = "md",
    className = "",
    isLoading,
    ...props
}) => {
    const baseStyles =
        "inline-flex items-center justify-center font-bold tracking-wider uppercase transition-all duration-300 rounded-sm focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02]";

    // Berlin Sans applied via inline style on each variant
    const fontStyle = { fontFamily: "'Berlin Sans', sans-serif" };

    const variants: Record<string, React.CSSProperties> = {
        primary: {
            backgroundColor: '#265140',    /* brand-forest */
            color: '#e6e3d7',              /* brand-bone */
            boxShadow: '0 4px 16px rgba(38,81,64,0.20)',
        },
        secondary: {
            backgroundColor: '#527858',    /* brand-sage */
            color: '#e6e3d7',
            boxShadow: '0 4px 16px rgba(82,120,88,0.20)',
        },
        outline: {
            backgroundColor: 'transparent',
            border: '1.5px solid #265140',
            color: '#265140',
        },
        sand: {
            backgroundColor: '#cfbb9b',    /* brand-sand */
            color: '#4b3d1c',              /* brand-olive */
            boxShadow: '0 4px 16px rgba(207,187,155,0.25)',
        },
        glass: {
            backgroundColor: 'rgba(230,227,215,0.60)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(75,61,28,0.10)',
            color: '#4b3d1c',
        },
    };

    const sizes: Record<string, string> = {
        sm: "px-4 py-2 text-xs",
        md: "px-6 py-3 text-sm",
        lg: "px-8 py-4 text-base",
    };

    return (
        <button
            className={`${baseStyles} ${sizes[size]} ${className}`}
            style={{ ...fontStyle, ...variants[variant] }}
            disabled={isLoading || props.disabled}
            {...props}
        >
            {isLoading ? (
                <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-current"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                >
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
            ) : null}
            {children}
        </button>
    );
};

import React, { forwardRef } from 'react';

const Input = forwardRef(({ label, error, className = '', ...props }, ref) => {
    return (
        <div className="flex flex-col gap-1 mb-3">
            {label && <label className="text-sm font-medium text-gray-700">{label}</label>}
            <input
                ref={ref}
                className={`border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${error ? 'border-red-500' : 'border-gray-300'} ${className}`}
                {...props}
            />
            {error && <span className="text-xs text-red-500">{error.message}</span>}
        </div>
    );
});

Input.displayName = 'Input';

export default Input;

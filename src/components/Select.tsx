import { SelectHTMLAttributes, forwardRef } from 'react';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, className = '', ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="mb-1.5 block text-sm font-semibold text-slate-700 dark:text-slate-200">
            {label}
          </label>
        )}
        <select
          ref={ref}
          className={`w-full rounded-xl border px-4 py-2.5 text-sm transition-all duration-200 glass-input text-slate-900 dark:text-slate-100 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed ${
            error
              ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20'
              : ''
          } ${className}`}
          {...props}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value} className="bg-white dark:bg-[#242120] text-slate-900 dark:text-[#e8e3d9]">
              {option.label}
            </option>
          ))}
        </select>
        {error && (
          <p className="mt-1.5 text-xs font-medium text-rose-600 dark:text-rose-400">{error}</p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';

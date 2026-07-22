import { ButtonHTMLAttributes, forwardRef } from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';

type BaseButtonProps = Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  'onAnimationStart' | 'onDrag' | 'onDragStart' | 'onDragEnd'
>;

interface ButtonProps extends BaseButtonProps {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'accent';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', isLoading, className = '', children, disabled, ...props }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm';

    const variants = {
      primary: 'bg-slate-900 text-white dark:bg-white dark:text-slate-950 hover:bg-slate-800 dark:hover:bg-slate-100 focus:ring-slate-400 font-extrabold shadow-sm',
      secondary: 'bg-white dark:bg-[#18181b] text-slate-800 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-[#242429] border border-slate-200 dark:border-[#27272a] focus:ring-slate-400 font-bold',
      accent: 'bg-teal-600 text-white dark:bg-teal-500 dark:text-slate-950 hover:bg-teal-700 focus:ring-teal-400 font-extrabold shadow-sm',
      ghost: 'bg-transparent text-slate-700 dark:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-[#18181b] focus:ring-slate-400 shadow-none font-bold',
      danger: 'bg-rose-600 text-white hover:bg-rose-700 focus:ring-rose-500 font-extrabold shadow-sm',
    };


    const sizes = {
      sm: 'px-3 py-1.5 text-xs font-semibold',
      md: 'px-4 py-2 text-sm font-semibold',
      lg: 'px-6 py-3 text-base font-semibold',
    };

    return (
      <motion.button
        ref={ref}
        whileHover={{ scale: disabled || isLoading ? 1 : 1.02, y: disabled || isLoading ? 0 : -1 }}
        whileTap={{ scale: disabled || isLoading ? 1 : 0.98 }}
        className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
        disabled={disabled || isLoading}
        {...(props as HTMLMotionProps<'button'>)}
      >
        {isLoading ? (
          <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
        ) : null}
        {children}
      </motion.button>
    );
  }
);

Button.displayName = 'Button';

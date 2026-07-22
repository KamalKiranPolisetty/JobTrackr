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
      primary: 'bg-[#D7494C] text-white hover:bg-[#C43538] focus:ring-[#D7494C]/40 shadow-sm',
      secondary: 'bg-white dark:bg-[#2e2b28] text-gray-700 dark:text-[#e8e3d9] hover:bg-gray-50 dark:hover:bg-[#302d2a] border border-gray-200 dark:border-[#3a3733] focus:ring-[#D7494C]/30 shadow-none',
      accent: 'bg-violet-600 text-white hover:bg-violet-700 focus:ring-violet-400 shadow-sm',
      ghost: 'bg-transparent text-gray-600 dark:text-[#9c9891] hover:bg-gray-100 dark:hover:bg-[#302d2a] focus:ring-gray-300 shadow-none',
      danger: 'bg-rose-600 text-white hover:bg-rose-700 focus:ring-rose-500 shadow-sm',
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

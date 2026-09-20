import React, { ButtonHTMLAttributes } from 'react';
import { cn } from '../utils/utils';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', fullWidth, children, ...props }, ref) => {
    const variants = {
      primary: 'bg-brand-900 text-white hover:bg-brand-800 border border-brand-900',
      secondary: 'bg-brand-200 text-brand-900 hover:bg-brand-300 border border-brand-200',
      outline: 'bg-transparent text-brand-900 border border-brand-900 hover:bg-brand-900 hover:text-white',
      ghost: 'bg-transparent text-brand-900 hover:bg-brand-100 border border-transparent'
    };

    const sizes = {
      sm: 'py-2 px-4 text-sm',
      md: 'py-3 px-6 text-base',
      lg: 'py-4 px-8 text-lg'
    };

    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center rounded-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none',
          variants[variant],
          sizes[size],
          fullWidth ? 'w-full' : '',
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);
Button.displayName = 'Button';

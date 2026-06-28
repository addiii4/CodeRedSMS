import { ButtonHTMLAttributes, ReactNode } from 'react';

type Variant = 'primary' | 'secondary' | 'danger' | 'ghost';

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  loading?: boolean;
  children: ReactNode;
};

const variantClasses: Record<Variant, string> = {
  primary: 'bg-primary hover:bg-primary-hover text-white border-primary',
  secondary: 'bg-white hover:bg-bg text-ink border-line',
  danger: 'bg-red-600 hover:bg-red-700 text-white border-red-600',
  ghost: 'bg-transparent hover:bg-bg text-ink border-transparent',
};

export default function Button({
  variant = 'primary',
  loading = false,
  children,
  className = '',
  disabled,
  ...rest
}: Props) {
  return (
    <button
      {...rest}
      disabled={disabled || loading}
      className={`px-4 py-2 rounded-lg border font-semibold text-sm transition disabled:opacity-50 disabled:cursor-not-allowed ${variantClasses[variant]} ${className}`}
    >
      {loading ? 'Loading…' : children}
    </button>
  );
}

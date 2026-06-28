import { InputHTMLAttributes, forwardRef } from 'react';

type Props = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  error?: string;
};

const Input = forwardRef<HTMLInputElement, Props>(function Input(
  { label, error, className = '', ...rest },
  ref,
) {
  return (
    <label className="block">
      {label && <span className="block text-sm font-medium mb-1 text-ink">{label}</span>}
      <input
        ref={ref}
        {...rest}
        className={`w-full px-3 py-2 border rounded-lg text-sm bg-white focus:outline-none focus:border-primary ${
          error ? 'border-red-500' : 'border-line'
        } ${className}`}
      />
      {error && <span className="block text-xs text-red-600 mt-1">{error}</span>}
    </label>
  );
});

export default Input;

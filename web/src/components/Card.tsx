import { ReactNode } from 'react';

export default function Card({
  children,
  className = '',
  onClick,
}: {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-xl border border-line p-5 shadow-sm ${
        onClick ? 'cursor-pointer hover:shadow-md transition' : ''
      } ${className}`}
    >
      {children}
    </div>
  );
}

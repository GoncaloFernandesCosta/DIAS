import { ReactNode } from 'react';

export default function Card({
  className = '',
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      className={`rounded-2xl border border-ink-100 bg-white shadow-card transition-all duration-300 ${className}`}
    >
      {children}
    </div>
  );
}
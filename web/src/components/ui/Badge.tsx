import { ReactNode } from 'react';

type Variant = 'success' | 'warning' | 'info' | 'danger' | 'default';

const variants: Record<Variant, string> = {
  success: 'bg-emerald-100 text-emerald-700',
  warning: 'bg-amber-100 text-amber-700',
  info: 'bg-cyan-100 text-cyan-700',
  danger: 'bg-red-100 text-red-700',
  default: 'bg-ink-100 text-ink-700',
};

export default function Badge({
  variant = 'default',
  className = '',
  children,
}: {
  variant?: Variant;
  className?: string;
  children: ReactNode;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${variants[variant]} ${className}`}
    >
      {children}
    </span>
  );
}
import type { ButtonHTMLAttributes, ReactNode } from 'react';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  children: ReactNode;
}

export function Button({ variant = 'ghost', children, ...props }: ButtonProps) {
  return (
    <button className={`button ${variant}`} {...props}>
      {children}
    </button>
  );
}

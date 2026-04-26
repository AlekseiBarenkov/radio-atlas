import type { ButtonHTMLAttributes, PropsWithChildren } from 'react';
import S from './button.module.css';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary';
};

export const Button = (props: PropsWithChildren<ButtonProps>) => {
  const { children, variant = 'primary', type = 'button', className = '', ...buttonProps } = props;

  return (
    <button
      type={type}
      className={`${S.button} ${variant === 'secondary' ? S.secondary : ''} ${className}`}
      {...buttonProps}
    >
      {children}
    </button>
  );
};

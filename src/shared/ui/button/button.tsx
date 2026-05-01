import type { ButtonHTMLAttributes, PropsWithChildren } from 'react';
import S from './button.module.css';

type ButtonVariant = 'primary' | 'secondary';
type ButtonSize = 's' | 'm';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
};

export const Button = (props: PropsWithChildren<ButtonProps>) => {
  const {
    children,
    variant = 'primary',
    size = 'm',
    fullWidth = false,
    type = 'button',
    className = '',
    ...buttonProps
  } = props;

  return (
    <button
      type={type}
      className={[S.button, className].filter(Boolean).join(' ')}
      data-variant={variant}
      data-size={size}
      data-fullwidth={fullWidth || undefined}
      {...buttonProps}
    >
      {children}
    </button>
  );
};

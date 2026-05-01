import type { ButtonHTMLAttributes, PropsWithChildren } from 'react';
import S from './icon-button.module.css';

type IconButtonSize = 's' | 'm';

type IconButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  size?: IconButtonSize;
};

export const IconButton = (props: PropsWithChildren<IconButtonProps>) => {
  const { children, size = 's', type = 'button', className = '', ...buttonProps } = props;

  return (
    <button type={type} className={[S.button, className].filter(Boolean).join(' ')} data-size={size} {...buttonProps}>
      {children}
    </button>
  );
};

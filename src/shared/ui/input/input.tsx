import { forwardRef, type InputHTMLAttributes } from 'react';
import S from './input.module.css';

type InputSize = 'm';

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  size?: InputSize;
};

export const Input = forwardRef<HTMLInputElement, InputProps>((props, ref) => {
  const { size = 'm', className = '', ...inputProps } = props;

  return (
    <input ref={ref} className={[S.input, className].filter(Boolean).join(' ')} data-size={size} {...inputProps} />
  );
});

Input.displayName = 'Input';

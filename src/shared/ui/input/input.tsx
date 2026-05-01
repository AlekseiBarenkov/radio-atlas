import type { InputHTMLAttributes } from 'react';
import S from './input.module.css';

type InputSize = 'm';

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  size?: InputSize;
};

export const Input = (props: InputProps) => {
  const { size = 'm', className = '', ...inputProps } = props;

  return <input className={[S.input, className].filter(Boolean).join(' ')} data-size={size} {...inputProps} />;
};

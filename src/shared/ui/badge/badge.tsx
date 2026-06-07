import type { PropsWithChildren } from 'react';
import S from './badge.module.css';

export type BadgeTone = 'neutral' | 'info' | 'success' | 'warning' | 'danger';

type BadgeProps = PropsWithChildren<{
  tone?: BadgeTone;
  className?: string;
}>;

export const Badge = (props: BadgeProps) => {
  const { tone = 'neutral', className = '', children } = props;

  return (
    <span className={[S.badge, className].filter(Boolean).join(' ')} data-tone={tone}>
      {children}
    </span>
  );
};

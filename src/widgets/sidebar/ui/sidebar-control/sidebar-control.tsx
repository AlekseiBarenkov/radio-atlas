import type { PropsWithChildren } from 'react';
import S from './sidebar-control.module.css';

type SidebarControlHeight = 'auto' | 'player';

type SidebarControlProps = PropsWithChildren<{
  height?: SidebarControlHeight;
}>;

export const SidebarControl = (props: SidebarControlProps) => {
  const { children, height = 'auto' } = props;

  return (
    <div className={S.control} data-height={height}>
      {children}
    </div>
  );
};

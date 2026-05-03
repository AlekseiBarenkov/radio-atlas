import type { PropsWithChildren } from 'react';
import S from './page-shell.module.css';

export const PageShell = (props: PropsWithChildren) => {
  const { children } = props;

  return <div className={S.shell}>{children}</div>;
};

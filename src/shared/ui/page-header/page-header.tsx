import type { PropsWithChildren } from 'react';
import S from './page-header.module.css';

type PageHeaderProps = {
  title: string;
  description?: string;
};

export const PageHeader = (props: PropsWithChildren<PageHeaderProps>) => {
  const { title, description, children } = props;

  return (
    <header className={S.header}>
      <div className={S.content}>
        <h1 className={S.title}>{title}</h1>
        {description && <p className={S.description}>{description}</p>}
      </div>

      {children && <div className={S.actions}>{children}</div>}
    </header>
  );
};

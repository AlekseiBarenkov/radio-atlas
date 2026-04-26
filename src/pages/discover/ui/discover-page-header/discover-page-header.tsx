import { useTranslation } from '@features/localization';
import S from './discover-page-header.module.css';

export const DiscoverPageHeader = () => {
  const t = useTranslation();

  return (
    <header className={S.header}>
      <h1 className={S.title}>{t.discover.title}</h1>
      <p className={S.description}>{t.discover.description}</p>
    </header>
  );
};

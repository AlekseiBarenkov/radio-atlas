import S from './discover-page-header.module.css';

export const DiscoverPageHeader = () => {
  return (
    <header className={S.header}>
      <h1 className={S.title}>Discover stations</h1>
      <p className={S.description}>Расширенный список станций из Radio Browser</p>
    </header>
  );
};
